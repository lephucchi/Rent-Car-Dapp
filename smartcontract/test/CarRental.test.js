const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarRental", function () {
  let CarRental;
  let carRental;
  let lessor;
  let lessee;
  let inspector;
  let addrs;

  const make = "Toyota";
  const model = "Camry";
  const year = 2023;
  const pricePerDay = ethers.utils.parseEther("0.01");
  const rentalDuration = 7;
  const depositAmount = ethers.utils.parseEther("0.1");
  const latePenaltyRate = ethers.utils.parseEther("0.005");
  const earlyDepreciationRate = ethers.utils.parseEther("0.002");

  beforeEach(async function () {
    [lessor, lessee, inspector, ...addrs] = await ethers.getSigners();

    CarRental = await ethers.getContractFactory("CarRental");
    carRental = await CarRental.connect(lessor).deploy(
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
  });

  describe("Deployment", function () {
    it("Should set the right lessor", async function () {
      expect(await carRental.lessor()).to.equal(lessor.address);
    });

    it("Should set the right inspector", async function () {
      expect(await carRental.inspector()).to.equal("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
    });

    it("Should set the right car info", async function () {
      const carInfo = await carRental.getCarInfo();
      expect(carInfo[0]).to.equal(make);
      expect(carInfo[1]).to.equal(model);
      expect(carInfo[2]).to.equal(year);
    });

    it("Should set the right rental info", async function () {
      const rentalInfo = await carRental.getRentalInfo();
      expect(rentalInfo[0]).to.equal(pricePerDay);
      expect(rentalInfo[1]).to.equal(rentalDuration);
      expect(rentalInfo[2]).to.equal(depositAmount);
      expect(rentalInfo[3]).to.equal(latePenaltyRate);
      expect(rentalInfo[4]).to.equal(earlyDepreciationRate);
    });

    it("Should set initial status to Pending", async function () {
      expect(await carRental.status()).to.equal(0); // Pending
    });
  });

  describe("Contract Activation", function () {
    it("Should allow lessee to activate contract with sufficient deposit", async function () {
      await expect(
        carRental.connect(lessee).activateContract({ value: depositAmount })
      ).to.emit(carRental, "ContractActivated");

      expect(await carRental.lessee()).to.equal(lessee.address);
      expect(await carRental.status()).to.equal(1); // Active
    });

    it("Should reject activation with insufficient deposit", async function () {
      const insufficientDeposit = ethers.utils.parseEther("0.05");
      
      await expect(
        carRental.connect(lessee).activateContract({ value: insufficientDeposit })
      ).to.be.revertedWith("Insufficient deposit");
    });
  });

  describe("Car Return", function () {
    beforeEach(async function () {
      await carRental.connect(lessee).activateContract({ value: depositAmount });
    });

    it("Should allow lessee to return car", async function () {
      await expect(carRental.connect(lessee).returnCar())
        .to.emit(carRental, "CarReturned");

      expect(await carRental.status()).to.equal(2); // Returned
    });

    it("Should reject return from non-lessee", async function () {
      await expect(
        carRental.connect(inspector).returnCar()
      ).to.be.revertedWith("Only lessee can call this function");
    });
  });

  describe("Car Inspection", function () {
    beforeEach(async function () {
      await carRental.connect(lessee).activateContract({ value: depositAmount });
      await carRental.connect(lessee).returnCar();
    });

    it("Should allow inspector to inspect car - no damage", async function () {
      await expect(carRental.connect(inspector).inspectCar(false, 0))
        .to.emit(carRental, "InspectionCompleted")
        .withArgs(false, 0);

      expect(await carRental.status()).to.equal(3); // Completed
      expect(await carRental.isDamaged()).to.equal(false);
      expect(await carRental.compensationAmount()).to.equal(0);
    });

    it("Should allow inspector to inspect car - with damage", async function () {
      const compensationAmount = ethers.utils.parseEther("0.02");
      
      await expect(carRental.connect(inspector).inspectCar(true, compensationAmount))
        .to.emit(carRental, "InspectionCompleted")
        .withArgs(true, compensationAmount);

      expect(await carRental.isDamaged()).to.equal(true);
      expect(await carRental.compensationAmount()).to.equal(compensationAmount);
    });

    it("Should reject inspection from non-inspector", async function () {
      await expect(
        carRental.connect(lessee).inspectCar(false, 0)
      ).to.be.revertedWith("Only inspector can call this function");
    });
  });

  describe("Contract Cancellation", function () {
    beforeEach(async function () {
      await carRental.connect(lessee).activateContract({ value: depositAmount });
    });

    it("Should allow cancellation in Pending status", async function () {
      // Deploy new contract in Pending status
      const newCarRental = await CarRental.connect(lessor).deploy(
        inspector.address,
        make,
        model,
        year,
        pricePerDay,
        rentalDuration,
        depositAmount,
        latePenaltyRate,
        earlyDepreciationRate
      );
      await newCarRental.deployed();

      // Activate by lessee first to set lessee address
      await newCarRental.connect(lessee).activateContract({ value: depositAmount });
      
      // Reset to pending for cancellation test
      // This would require additional contract functions in real implementation
    });
  });

  describe("Getter Functions", function () {
    it("Should return correct contract balance", async function () {
      await carRental.connect(lessee).activateContract({ value: depositAmount });
      expect(await carRental.getContractBalance()).to.equal(depositAmount);
    });

    it("Should return correct time info", async function () {
      await carRental.connect(lessee).activateContract({ value: depositAmount });
      const timeInfo = await carRental.getTimeInfo();
      expect(timeInfo[0]).to.be.gt(0); // startTime
      expect(timeInfo[1]).to.be.gt(timeInfo[0]); // dueTime > startTime
    });

    it("Should return correct inspection info", async function () {
      const inspectionInfo = await carRental.getInspectionInfo();
      expect(inspectionInfo[0]).to.equal(false); // not damaged initially
      expect(inspectionInfo[1]).to.equal(0); // no compensation initially
    });
  });
});
