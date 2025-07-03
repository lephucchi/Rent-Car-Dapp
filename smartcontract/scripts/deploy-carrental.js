const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CarRental contract...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract constructor parameters (không cần inspector nữa vì đã cố định)
  const make = "Toyota";
  const model = "Camry";
  const year = 2023;
  const pricePerDay = ethers.utils.parseEther("0.01"); // 0.01 ETH per day
  const rentalDuration = 7; // 7 days
  const depositAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH deposit
  const latePenaltyRate = ethers.utils.parseEther("0.005"); // 0.005 ETH per day late
  const earlyDepreciationRate = ethers.utils.parseEther("0.002"); // 0.002 ETH per day early

  // Deploy the contract
  const CarRental = await ethers.getContractFactory("CarRental");
  const carRental = await CarRental.deploy(
    make,
    model,
    year,
    pricePerDay,
    rentalDuration,
    depositAmount,
    latePenaltyRate,
    earlyDepreciationRate
  );

  await carRental.deployed();

  console.log("CarRental contract deployed to:", carRental.address);
  console.log("Constructor parameters:");
  console.log("- Inspector (default):", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  console.log("- Car:", make, model, year);
  console.log("- Price per day:", ethers.utils.formatEther(pricePerDay), "ETH");
  console.log("- Rental duration:", rentalDuration, "days");
  console.log("- Deposit amount:", ethers.utils.formatEther(depositAmount), "ETH");
  console.log("- Late penalty rate:", ethers.utils.formatEther(latePenaltyRate), "ETH/day");
  console.log("- Early depreciation rate:", ethers.utils.formatEther(earlyDepreciationRate), "ETH/day");

  // Save contract address to a file for frontend
  const fs = require('fs');
  const contractData = {
    address: carRental.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    inspector: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  };
  
  fs.writeFileSync(
    './contract-address.json',
    JSON.stringify(contractData, null, 2)
  );
  
  console.log("Contract address saved to contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
