import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Mock MNEE to Sepolia testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy MockMNEE
  console.log("⏳ Deploying MockMNEE contract...");
  const MockMNEE = await ethers.getContractFactory("MockMNEE");
  const mockMnee = await MockMNEE.deploy();
  await mockMnee.waitForDeployment();

  const address = await mockMnee.getAddress();
  console.log("✅ MockMNEE deployed to:", address);
  console.log("📄 Contract name:", await mockMnee.name());
  console.log("🔢 Decimals:", await mockMnee.decimals());
  console.log("💵 Initial supply:", ethers.formatUnits(await mockMnee.totalSupply(), 6), "MNEE\n");

  console.log("🎉 Deployment complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 SAVE THIS INFORMATION:\n");
  console.log("Mock MNEE Address:", address);
  console.log("Network: Sepolia Testnet (Chain ID: 11155111)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("📝 Next Steps:");
  console.log("1. Add to .env.local:");
  console.log(`   NEXT_PUBLIC_MNEE_TOKEN_ADDRESS=${address}`);
  console.log(`   NEXT_PUBLIC_CHAIN_ID=11155111\n`);
  console.log("2. Get test tokens:");
  console.log("   - Visit Sepolia faucet: https://sepoliafaucet.com");
  console.log("   - Get testnet ETH for gas fees\n");
  console.log("3. Get Mock MNEE tokens:");
  console.log("   - Call the faucet() function on the contract");
  console.log("   - You'll receive 1000 MNEE every hour\n");
  
  console.log("4. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${address}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
