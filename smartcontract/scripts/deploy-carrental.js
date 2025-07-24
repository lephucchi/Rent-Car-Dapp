const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FixedRentalContract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract constructor parameters for FixedRentalContract
  const assetName = "Toyota Camry 2023";
  const rentalFeePerMinute = ethers.utils.parseUnits("1", "gwei"); // 1 gwei per minute
  const durationMinutes = 60 * 24 * 7; // 7 days in minutes
  const insuranceFee = ethers.utils.parseEther("0.01"); // 0.01 ETH
  const insuranceCompensation = ethers.utils.parseEther("0.1"); // 0.1 ETH

  // Deploy the contract
  const FixedRentalContract = await ethers.getContractFactory("FixedRentalContract");
  const fixedRental = await FixedRentalContract.deploy(
    assetName,
    rentalFeePerMinute,
    durationMinutes,
    insuranceFee,
    insuranceCompensation
  );

  await fixedRental.deployed();

  console.log("FixedRentalContract deployed to:", fixedRental.address);
  console.log("Constructor parameters:");
  console.log("- Asset Name:", assetName);
  console.log("- Rental Fee per Minute:", ethers.utils.formatUnits(rentalFeePerMinute, "gwei"), "gwei");
  console.log("- Duration:", durationMinutes, "minutes");
  console.log("- Insurance Fee:", ethers.utils.formatEther(insuranceFee), "ETH");
  console.log("- Insurance Compensation:", ethers.utils.formatEther(insuranceCompensation), "ETH");

  // Save contract address to a file for backend integration
  const fs = require('fs');
  const path = require('path');
  
  const contractData = {
    address: fixedRental.address,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    contractName: "FixedRentalContract",
    deployer: deployer.address,
    constructorArgs: {
      assetName,
      rentalFeePerMinute: rentalFeePerMinute.toString(),
      durationMinutes,
      insuranceFee: insuranceFee.toString(),
      insuranceCompensation: insuranceCompensation.toString()
    },
    abi: JSON.parse(fixedRental.interface.format(ethers.utils.FormatTypes.json))
  };
  
  // Save to smartcontract directory
  fs.writeFileSync(
    './contract-address.json',
    JSON.stringify(contractData, null, 2)
  );
  
  // Also save to backend directory for FastAPI integration
  const backendPath = path.join(__dirname, '../../backend-fastapi/contract-address.json');
  try {
    fs.writeFileSync(backendPath, JSON.stringify(contractData, null, 2));
    console.log("Contract address saved to both smartcontract and backend directories");
  } catch (err) {
    console.log("Contract address saved to smartcontract directory");
    console.warn("Could not save to backend directory:", err.message);
  }

  // Also save to frontend public directory if exists
  const frontendPath = path.join(__dirname, '../../frontend/public/contract-address.json');
  try {
    fs.writeFileSync(frontendPath, JSON.stringify(contractData, null, 2));
    console.log("Contract address also saved to frontend directory");
  } catch (err) {
    console.warn("Could not save to frontend directory:", err.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
