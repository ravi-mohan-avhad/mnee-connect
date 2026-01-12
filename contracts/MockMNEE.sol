// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MockMNEE
 * @notice Mock MNEE token for testing on Sepolia testnet
 * @dev This contract mimics the real MNEE token (0x8ccedbae4916b79da7f3f612efb2eb93a2bfd6cf)
 *      Key features:
 *      - 6 decimals (same as real MNEE)
 *      - ERC-20 standard
 *      - Faucet function to get free test tokens
 *      - Same interface as production MNEE
 */
contract MockMNEE {
    string public constant name = "Mock MNEE";
    string public constant symbol = "mMNEE";
    uint8 public constant decimals = 6; // CRITICAL: MNEE uses 6 decimals, not 18!
    
    uint256 private _totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Faucet configuration
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**6; // 1000 MNEE (with 6 decimals)
    uint256 public constant FAUCET_COOLDOWN = 1 hours;
    mapping(address => uint256) public lastFaucetTime;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event FaucetDrip(address indexed recipient, uint256 amount);
    
    constructor() {
        // Mint initial supply to deployer for setup
        _mint(msg.sender, 1000000 * 10**6); // 1 million MNEE
    }
    
    /**
     * @notice Get free test tokens from faucet
     * @dev Can be called once per hour per address
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetTime[msg.sender] + FAUCET_COOLDOWN,
            "Faucet: Please wait before requesting again"
        );
        
        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetDrip(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @notice Check time until next faucet drip is available
     * @param account Address to check
     * @return seconds until next drip (0 if available now)
     */
    function timeUntilNextDrip(address account) external view returns (uint256) {
        uint256 nextAvailable = lastFaucetTime[account] + FAUCET_COOLDOWN;
        if (block.timestamp >= nextAvailable) {
            return 0;
        }
        return nextAvailable - block.timestamp;
    }
    
    // Standard ERC-20 Functions
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "ERC20: insufficient allowance");
        
        unchecked {
            _approve(from, msg.sender, currentAllowance - amount);
        }
        
        _transfer(from, to, amount);
        return true;
    }
    
    // Internal Functions
    
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "ERC20: transfer from zero address");
        require(to != address(0), "ERC20: transfer to zero address");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "ERC20: insufficient balance");
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }
    
    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "ERC20: mint to zero address");
        
        _totalSupply += amount;
        unchecked {
            _balances[account] += amount;
        }
        
        emit Transfer(address(0), account, amount);
    }
    
    function _approve(address owner, address spender, uint256 amount) internal {
        require(owner != address(0), "ERC20: approve from zero address");
        require(spender != address(0), "ERC20: approve to zero address");
        
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
    
    /**
     * @notice Emergency function to mint more tokens if needed
     * @dev Only callable by contract deployer for demo purposes
     */
    function mintForDemo(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
