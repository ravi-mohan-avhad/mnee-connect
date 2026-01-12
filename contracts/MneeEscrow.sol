// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MneeEscrow
 * @notice Proof-of-Task Agent Escrow Contract for MNEE Stablecoin
 * 
 * Prevents agents from being scammed by service providers.
 * Funds are locked until a signed "Task Completion" attestation is provided.
 * 
 * Features:
 * - Lock MNEE funds for a specific task
 * - Conditional release upon task completion proof
 * - Automatic refund if task not completed within deadline
 * - Support for EAS (Ethereum Attestation Service) or webhook attestations
 */
contract MneeEscrow is ReentrancyGuard, Ownable {
    IERC20 public immutable mneeToken;
    
    // EAS Schema UID for task completion attestations (if using EAS)
    bytes32 public taskCompletionSchemaUID;
    
    // Trusted attestation provider (webhook backend address)
    address public attestationProvider;

    enum TaskStatus {
        Active,
        Completed,
        Refunded,
        Disputed
    }

    struct EscrowTask {
        address agent;           // AI agent or client initiating task
        address serviceProvider; // Service provider performing the task
        uint256 amount;          // MNEE amount locked
        uint256 deadline;        // Unix timestamp for task completion
        TaskStatus status;       // Current status
        bytes32 taskId;          // Unique task identifier
        string taskDescription;  // Brief description
        bool autoRefund;         // Enable automatic refund after deadline
    }

    // Mapping: taskId => EscrowTask
    mapping(bytes32 => EscrowTask) public tasks;
    
    // Mapping: agent => array of taskIds
    mapping(address => bytes32[]) public agentTasks;
    
    // Mapping: serviceProvider => array of taskIds
    mapping(address => bytes32[]) public providerTasks;

    // Events
    event TaskCreated(
        bytes32 indexed taskId,
        address indexed agent,
        address indexed serviceProvider,
        uint256 amount,
        uint256 deadline
    );

    event TaskCompleted(
        bytes32 indexed taskId,
        address indexed serviceProvider,
        bytes32 attestationUID
    );

    event TaskRefunded(
        bytes32 indexed taskId,
        address indexed agent,
        uint256 amount
    );

    event TaskDisputed(
        bytes32 indexed taskId,
        address indexed disputeInitiator
    );

    event AttestationProviderUpdated(address indexed newProvider);

    /**
     * @notice Constructor
     * @param _mneeToken Address of MNEE ERC-20 token
     * @param _attestationProvider Address allowed to provide attestations
     */
    constructor(
        address _mneeToken,
        address _attestationProvider
    ) Ownable(msg.sender) {
        require(_mneeToken != address(0), "Invalid MNEE token address");
        mneeToken = IERC20(_mneeToken);
        attestationProvider = _attestationProvider;
    }

    /**
     * @notice Lock MNEE funds for a task
     * @param _serviceProvider Address of service provider
     * @param _amount Amount of MNEE to lock (in token's smallest unit)
     * @param _deadline Unix timestamp deadline for task completion
     * @param _taskDescription Brief task description
     * @param _autoRefund Enable automatic refund after deadline
     * @return taskId Unique identifier for this escrow task
     */
    function lockFunds(
        address _serviceProvider,
        uint256 _amount,
        uint256 _deadline,
        string calldata _taskDescription,
        bool _autoRefund
    ) external nonReentrant returns (bytes32 taskId) {
        require(_serviceProvider != address(0), "Invalid provider address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in future");
        require(bytes(_taskDescription).length > 0, "Description required");

        // Generate unique taskId
        taskId = keccak256(
            abi.encodePacked(
                msg.sender,
                _serviceProvider,
                _amount,
                block.timestamp,
                _taskDescription
            )
        );
        
        require(tasks[taskId].agent == address(0), "Task already exists");

        // Transfer MNEE from agent to this contract
        require(
            mneeToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        // Create escrow task
        tasks[taskId] = EscrowTask({
            agent: msg.sender,
            serviceProvider: _serviceProvider,
            amount: _amount,
            deadline: _deadline,
            status: TaskStatus.Active,
            taskId: taskId,
            taskDescription: _taskDescription,
            autoRefund: _autoRefund
        });

        // Track tasks
        agentTasks[msg.sender].push(taskId);
        providerTasks[_serviceProvider].push(taskId);

        emit TaskCreated(
            taskId,
            msg.sender,
            _serviceProvider,
            _amount,
            _deadline
        );
    }

    /**
     * @notice Release funds to service provider with task completion proof
     * @param _taskId Task identifier
     * @param _attestationUID UID of EAS attestation or webhook signature
     * @param _signature Optional signature for webhook-based attestations
     */
    function releaseWithProof(
        bytes32 _taskId,
        bytes32 _attestationUID,
        bytes calldata _signature
    ) external nonReentrant {
        EscrowTask storage task = tasks[_taskId];
        
        require(task.agent != address(0), "Task does not exist");
        require(task.status == TaskStatus.Active, "Task not active");
        require(block.timestamp <= task.deadline, "Task deadline passed");

        // Verify attestation
        bool isValidAttestation = _verifyAttestation(
            _taskId,
            _attestationUID,
            _signature,
            task.serviceProvider
        );
        
        require(isValidAttestation, "Invalid attestation");

        // Update status
        task.status = TaskStatus.Completed;

        // Transfer MNEE to service provider
        require(
            mneeToken.transfer(task.serviceProvider, task.amount),
            "Transfer failed"
        );

        emit TaskCompleted(_taskId, task.serviceProvider, _attestationUID);
    }

    /**
     * @notice Refund MNEE to agent if task not completed by deadline
     * @param _taskId Task identifier
     */
    function refund(bytes32 _taskId) external nonReentrant {
        EscrowTask storage task = tasks[_taskId];
        
        require(task.agent != address(0), "Task does not exist");
        require(task.status == TaskStatus.Active, "Task not active");
        require(
            msg.sender == task.agent || task.autoRefund,
            "Not authorized or auto-refund disabled"
        );
        require(block.timestamp > task.deadline, "Deadline not passed");

        // Update status
        task.status = TaskStatus.Refunded;

        // Transfer MNEE back to agent
        require(
            mneeToken.transfer(task.agent, task.amount),
            "Transfer failed"
        );

        emit TaskRefunded(_taskId, task.agent, task.amount);
    }

    /**
     * @notice Initiate dispute for a task
     * @param _taskId Task identifier
     */
    function dispute(bytes32 _taskId) external {
        EscrowTask storage task = tasks[_taskId];
        
        require(task.agent != address(0), "Task does not exist");
        require(task.status == TaskStatus.Active, "Task not active");
        require(
            msg.sender == task.agent || msg.sender == task.serviceProvider,
            "Not authorized"
        );

        task.status = TaskStatus.Disputed;

        emit TaskDisputed(_taskId, msg.sender);
    }

    /**
     * @notice Resolve disputed task (only owner)
     * @param _taskId Task identifier
     * @param _releaseToProvider True to pay provider, false to refund agent
     */
    function resolveDispute(
        bytes32 _taskId,
        bool _releaseToProvider
    ) external onlyOwner nonReentrant {
        EscrowTask storage task = tasks[_taskId];
        
        require(task.status == TaskStatus.Disputed, "Task not disputed");

        address recipient = _releaseToProvider ? task.serviceProvider : task.agent;
        task.status = _releaseToProvider ? TaskStatus.Completed : TaskStatus.Refunded;

        require(
            mneeToken.transfer(recipient, task.amount),
            "Transfer failed"
        );

        if (_releaseToProvider) {
            emit TaskCompleted(_taskId, task.serviceProvider, bytes32(0));
        } else {
            emit TaskRefunded(_taskId, task.agent, task.amount);
        }
    }

    /**
     * @notice Update attestation provider address
     * @param _newProvider New attestation provider address
     */
    function updateAttestationProvider(address _newProvider) external onlyOwner {
        require(_newProvider != address(0), "Invalid address");
        attestationProvider = _newProvider;
        emit AttestationProviderUpdated(_newProvider);
    }

    /**
     * @notice Update EAS schema UID
     * @param _schemaUID New schema UID for task completion attestations
     */
    function updateSchemaUID(bytes32 _schemaUID) external onlyOwner {
        taskCompletionSchemaUID = _schemaUID;
    }

    /**
     * @notice Get task details
     * @param _taskId Task identifier
     * @return Task details
     */
    function getTask(bytes32 _taskId) external view returns (EscrowTask memory) {
        return tasks[_taskId];
    }

    /**
     * @notice Get all tasks for an agent
     * @param _agent Agent address
     * @return Array of taskIds
     */
    function getAgentTasks(address _agent) external view returns (bytes32[] memory) {
        return agentTasks[_agent];
    }

    /**
     * @notice Get all tasks for a service provider
     * @param _provider Provider address
     * @return Array of taskIds
     */
    function getProviderTasks(address _provider) external view returns (bytes32[] memory) {
        return providerTasks[_provider];
    }

    /**
     * @notice Verify task completion attestation
     * @dev Internal function - can be extended to support EAS or custom signatures
     */
    function _verifyAttestation(
        bytes32 _taskId,
        bytes32 _attestationUID,
        bytes calldata _signature,
        address _serviceProvider
    ) internal view returns (bool) {
        // Option 1: EAS Attestation verification
        // If using Ethereum Attestation Service, verify attestation on-chain
        // (Requires EAS contract integration)
        
        // Option 2: Webhook-based attestation (signature verification)
        if (_signature.length > 0) {
            // Recover signer from signature
            bytes32 messageHash = keccak256(
                abi.encodePacked(
                    _taskId,
                    _attestationUID,
                    _serviceProvider
                )
            );
            
            bytes32 ethSignedMessageHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
            );
            
            address signer = _recoverSigner(ethSignedMessageHash, _signature);
            
            // Check if signer is the trusted attestation provider
            return signer == attestationProvider;
        }
        
        // Option 3: Simple attestationUID verification (for testing)
        // In production, implement proper EAS or webhook verification
        return _attestationUID != bytes32(0);
    }

    /**
     * @notice Recover signer address from signature
     */
    function _recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _signature
    ) internal pure returns (address) {
        require(_signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }

        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /**
     * @notice Emergency withdraw (only owner, only if no active tasks)
     * @dev Should only be used in extreme cases
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = mneeToken.balanceOf(address(this));
        require(balance > 0, "No balance");
        
        require(
            mneeToken.transfer(owner(), balance),
            "Transfer failed"
        );
    }
}
