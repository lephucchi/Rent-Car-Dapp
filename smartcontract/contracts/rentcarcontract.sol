// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FixedRentalContract {
    address public lessor;
    address public lessee;
    address public damageAssessor;

    string public assetName;
    uint public rentalFeePerDay;
    uint public durationDays;
    uint public insuranceFee;

    uint public startTime;
    bool public isRented;
    bool public isDamaged;

    bool public renterRequestedReturn;
    bool public ownerConfirmedReturn;

    uint public actualDays;
    uint public assessedDamageAmount;

    // Events
    event RentalStarted(address lessee, uint deposit);
    event RentalCancelled(address lessee);
    event DamageReported(address lessor);
    event FundsTransferred(address to, uint amount);
    event RenterRequestedReturn(address lessee);
    event OwnerConfirmedReturn(address lessor);
    event ActualUsageSet(uint daysUsed);
    event DamageAssessed(address assessor, uint amount);

    constructor(
        string memory _assetName,
        uint _rentalFeePerDay,
        uint _durationDays,
        uint _insuranceFee,
        address _damageAssessor
    ) {
        lessor = msg.sender;
        assetName = _assetName;
        rentalFeePerDay = _rentalFeePerDay;
        durationDays = _durationDays;
        insuranceFee = _insuranceFee;
        damageAssessor = _damageAssessor;
    }

    function getTotalRentalFee() public view returns (uint) {
        return (rentalFeePerDay * durationDays) + insuranceFee;
    }

    function getDeposit() public view returns (uint) {
        return (getTotalRentalFee() * 30) / 100;
    }

    function rent() external payable {
        require(msg.sender != lessor, "Owner cannot rent own asset");
        require(!isRented, "Asset already rented");
        require(msg.value == getDeposit() * 1 ether, "Incorrect deposit");

        lessee = msg.sender;
        isRented = true;
        startTime = block.timestamp;

        emit RentalStarted(lessee, msg.value / 1 ether);
    }

    function cancelRental() external {
        require(msg.sender == lessee, "Only lessee can cancel");
        require(isRented, "Not rented");

        uint refund = (getDeposit() * 1 ether) / 2;
        payable(lessee).transfer(refund);
        payable(lessor).transfer(refund);

        emit RentalCancelled(lessee);
        reset();
    }

    function setActualUsage(uint _actualDays) external {
        require(msg.sender == lessor, "Only lessor can set actual usage");
        require(isRented, "Asset not rented");

        actualDays = _actualDays;
        emit ActualUsageSet(_actualDays);
    }

    function reportDamage() external {
        require(msg.sender == lessor, "Only lessor can report");
        require(isRented, "Not rented");

        isDamaged = true;
        emit DamageReported(lessor);
    }

    function requestReturn() external {
        require(msg.sender == lessee, "Only lessee can request return");
        require(isRented, "Not rented");

        renterRequestedReturn = true;
        emit RenterRequestedReturn(msg.sender);
    }

    function confirmReturn() external {
        require(msg.sender == lessor, "Only lessor can confirm return");
        require(isRented, "Not rented");

        ownerConfirmedReturn = true;
        emit OwnerConfirmedReturn(msg.sender);
    }

    function assessDamage(uint amountInEther) external {
        require(msg.sender == damageAssessor, "Only damage assessor allowed");
        require(isRented, "Rental not active");
        require(renterRequestedReturn && ownerConfirmedReturn, "Vehicle must be returned");

        assessedDamageAmount = amountInEther;
        emit DamageAssessed(msg.sender, amountInEther);
    }

    function getRemainingPayment() public view returns (uint) {
        require(isRented, "Asset is not rented");

        uint usedDays = actualDays > 0 ? actualDays : durationDays;
        uint baseFee;
        uint overdueFee = 0;

        if (usedDays <= durationDays) {
            baseFee = rentalFeePerDay * usedDays;
        } else {
            uint overdue = usedDays - durationDays;
            baseFee = rentalFeePerDay * durationDays;
            overdueFee = (rentalFeePerDay * 150 / 100) * overdue;
        }

        uint finalRentalFee = baseFee + overdueFee + insuranceFee;

        if (isDamaged) {
            finalRentalFee += assessedDamageAmount;
        }

        uint deposit = getDeposit();
        uint remaining = finalRentalFee > deposit ? finalRentalFee - deposit : 0;
        return remaining;
    }

    function getFinalPaymentAmount() external view returns (uint) {
        return getRemainingPayment() * 1 ether;
    }

    function completeRental() external payable {
        require(isRented, "Not rented");
        require(msg.sender == lessee || msg.sender == lessor, "Not authorized");
        require(renterRequestedReturn && ownerConfirmedReturn, "Both parties must confirm return");

        uint remaining = getRemainingPayment();
        require(msg.value == remaining * 1 ether, "Incorrect payment");

        uint deposit = getDeposit();
        uint totalPaid = msg.value + deposit * 1 ether;

        payable(lessor).transfer(totalPaid);
        emit FundsTransferred(lessor, totalPaid / 1 ether);

        reset();
    }

    function reset() internal {
        lessee = address(0);
        isRented = false;
        isDamaged = false;
        startTime = 0;
        renterRequestedReturn = false;
        ownerConfirmedReturn = false;
        actualDays = 0;
        assessedDamageAmount = 0;
    }

    receive() external payable {}
}
