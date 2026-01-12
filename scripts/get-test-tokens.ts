import { ethers } from "hardhat";

async function main() {
  const mockMneeAddress = process.env.MOCK_MNEE_ADDRESS || "";
  
  if (!mockMneeAddress) {
    console.error("❌ Error: Please set MOCK_MNEE_ADDRESS in your .env file");
    process.exit(1);
  }

  console.log("🪙 Getting test tokens from Mock MNEE faucet...\n");

  const [signer] = await ethers.getSigners();
  console.log("📝 Your address:", signer.address);

  // Connect to MockMNEE contract
  const MockMNEE = await ethers.getContractFactory("MockMNEE");
  const mockMnee = MockMNEE.attach(mockMneeAddress);

  // Check current balance
  const balanceBefore = await mockMnee.balanceOf(signer.address);
  console.log("💰 Current balance:", ethers.formatUnits(balanceBefore, 6), "MNEE");

  // Check cooldown
  const timeUntilNext = await mockMnee.timeUntilNextDrip(signer.address);
  
  if (timeUntilNext > 0n) {
    const minutes = Number(timeUntilNext) / 60;
    console.log(`⏰ Faucet on cooldown. Wait ${minutes.toFixed(0)} minutes before next drip.`);
    return;
  }

  // Request tokens from faucet
  console.log("\n⏳ Requesting tokens from faucet...");
  const tx = await mockMnee.faucet();
  console.log("📤 Transaction sent:", tx.hash);
  
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();
  
  // Check new balance
  const balanceAfter = await mockMnee.balanceOf(signer.address);
  const received = balanceAfter - balanceBefore;
  
  console.log("\n✅ Success!");
  console.log("💵 Received:", ethers.formatUnits(received, 6), "MNEE");
  console.log("💰 New balance:", ethers.formatUnits(balanceAfter, 6), "MNEE");
  console.log("\n⏰ You can request again in 1 hour");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
