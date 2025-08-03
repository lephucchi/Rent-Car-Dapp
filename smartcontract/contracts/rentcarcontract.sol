// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LegacyRentalContract {
    address public lessor;
    address public lessee;

    string public assetName;
    uint public rentalFeePerMinute;
    uint public durationMinutes;
    uint public insuranceFee;
    uint public insuranceCompensation;

    uint public startTime;
    bool public isRented;
    bool public isDamaged;

    bool public renterRequestedReturn;
    bool public ownerConfirmedReturn;

    uint public actualMinutes;

    // Events
    event RentalStarted(address lessee, uint deposit);
    event RentalCancelled(address lessee);
    event DamageReported(address lessor);
    event FundsTransferred(address to, uint amount);
    event RenterRequestedReturn(address lessee);
    event OwnerConfirmedReturn(address lessor);
    event ActualUsageSet(uint minutesUsed);

    constructor(
        string memory _assetName,
        uint _rentalFeePerMinute,
        uint _durationMinutes,
        uint _insuranceFee,
        uint _insuranceCompensation
    ) {
        lessor = msg.sender;
        assetName = _assetName;
        rentalFeePerMinute = _rentalFeePerMinute;
        durationMinutes = _durationMinutes;
        insuranceFee = _insuranceFee;
        insuranceCompensation = _insuranceCompensation;
    }

    function getTotalRentalFee() public view returns (uint) {
        return (rentalFeePerMinute * durationMinutes) + insuranceFee;
    }

    function getDeposit() public view returns (uint) {
        return (getTotalRentalFee() * 50) / 100;
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

    function setActualUsage(uint _actualMinutes) external {
        require(msg.sender == lessor, "Only lessor can set actual usage");
        require(isRented, "Asset not rented");
        actualMinutes = _actualMinutes;

        emit ActualUsageSet(_actualMinutes);
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

    function getRemainingPayment() public view returns (uint) {
        require(isRented, "Asset is not rented");

        uint usedMinutes = actualMinutes > 0 ? actualMinutes : durationMinutes;
        uint baseFee;
        uint overdueFee = 0;

        if (usedMinutes <= durationMinutes) {
            baseFee = rentalFeePerMinute * usedMinutes;
        } else {
            uint overdue = usedMinutes - durationMinutes;
            baseFee = rentalFeePerMinute * durationMinutes;
            overdueFee = (rentalFeePerMinute * 150 / 100) * overdue;
        }

        uint finalRentalFee = baseFee + overdueFee + insuranceFee;

        if (isDamaged) {
            finalRentalFee += insuranceCompensation;
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
        require(msg.value == remaining * 1 ether, "Incorrect payment for remaining + damage");

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
        actualMinutes = 0;
    }

    receive() external payable {}
}
