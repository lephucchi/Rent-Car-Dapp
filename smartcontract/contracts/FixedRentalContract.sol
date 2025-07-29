// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FixedRentalContract {
    // Core participants
    address public lessor;  // Vehicle owner
    address public lessee;  // Renter
    
    // Asset information
    string public assetName;
    uint256 public rentalFeePerMinute;
    uint256 public durationMinutes;
    uint256 public insuranceFee;
    uint256 public insuranceCompensation;
    
    // Rental state
    uint256 public startTime;
    bool public isRented;
    bool public isDamaged;
    bool public renterRequestedReturn;
    bool public ownerConfirmedReturn;
    uint256 public actualMinutes;
    
    // Events
    event RentalStarted(address lessee, uint256 deposit);
    event RentalCancelled(address lessee);
    event RenterRequestedReturn(address lessee);
    event OwnerConfirmedReturn(address lessor);
    event ActualUsageSet(uint256 minutesUsed);
    event DamageReported(address lessor);
    event FundsTransferred(address to, uint256 amount);
    
    // Modifiers
    modifier onlyLessor() {
        require(msg.sender == lessor, "Only lessor can call this function");
        _;
    }
    
    modifier onlyLessee() {
        require(msg.sender == lessee, "Only lessee can call this function");
        _;
    }
    
    modifier onlyWhenRented() {
        require(isRented, "Asset is not rented");
        _;
    }
    
    modifier onlyWhenNotRented() {
        require(!isRented, "Asset is already rented");
        _;
    }
    
    constructor(
        string memory _assetName,
        uint256 _rentalFeePerMinute,
        uint256 _durationMinutes,
        uint256 _insuranceFee,
        uint256 _insuranceCompensation
    ) {
        lessor = msg.sender;
        assetName = _assetName;
        rentalFeePerMinute = _rentalFeePerMinute;
        durationMinutes = _durationMinutes;
        insuranceFee = _insuranceFee;
        insuranceCompensation = _insuranceCompensation;
    }
    
    // View functions for fee calculations
    function getTotalRentalFee() public view returns (uint256) {
        return (rentalFeePerMinute * durationMinutes) + insuranceFee;
    }
    
    function getDeposit() public view returns (uint256) {
        return getTotalRentalFee() / 2; // 50% deposit
    }
    
    function getRemainingPayment() public view onlyWhenRented returns (uint256) {
        uint256 usedMinutes = actualMinutes > 0 ? actualMinutes : durationMinutes;
        uint256 baseFee = rentalFeePerMinute * usedMinutes;
        uint256 totalFee = baseFee + insuranceFee;
        
        // Add damage compensation if applicable
        if (isDamaged) {
            totalFee += insuranceCompensation;
        }
        
        uint256 deposit = getDeposit();
        return totalFee > deposit ? totalFee - deposit : 0;
    }
    
    function getFinalPaymentAmount() external view onlyWhenRented returns (uint256) {
        return getRemainingPayment();
    }
    
    // Main rental functions
    function rent() external payable onlyWhenNotRented {
        require(msg.sender != lessor, "Lessor cannot rent own asset");
        require(msg.value == getDeposit(), "Incorrect deposit amount");
        
        lessee = msg.sender;
        isRented = true;
        startTime = block.timestamp;
        
        emit RentalStarted(lessee, msg.value);
    }
    
    function cancelRental() external onlyLessee onlyWhenRented {
        // Refund 50% to lessee, 50% to lessor
        uint256 refundAmount = getDeposit() / 2;
        
        payable(lessee).transfer(refundAmount);
        payable(lessor).transfer(refundAmount);
        
        emit RentalCancelled(lessee);
        emit FundsTransferred(lessee, refundAmount);
        emit FundsTransferred(lessor, refundAmount);
        
        reset();
    }
    
    function requestReturn() external onlyLessee onlyWhenRented {
        renterRequestedReturn = true;
        emit RenterRequestedReturn(lessee);
    }
    
    function confirmReturn() external onlyLessor onlyWhenRented {
        require(renterRequestedReturn, "Renter must request return first");
        ownerConfirmedReturn = true;
        emit OwnerConfirmedReturn(lessor);
    }
    
    function setActualUsage(uint256 _actualMinutes) external onlyLessor onlyWhenRented {
        actualMinutes = _actualMinutes;
        emit ActualUsageSet(_actualMinutes);
    }
    
    function reportDamage() external onlyLessor onlyWhenRented {
        isDamaged = true;
        emit DamageReported(lessor);
    }
    
    function completeRental() external payable onlyWhenRented {
        require(renterRequestedReturn && ownerConfirmedReturn, "Return process not completed");
        require(msg.sender == lessee || msg.sender == lessor, "Only lessee or lessor can complete");
        
        uint256 remainingPayment = getRemainingPayment();
        require(msg.value == remainingPayment, "Incorrect payment amount");
        
        // Transfer all funds to lessor
        uint256 totalAmount = address(this).balance;
        payable(lessor).transfer(totalAmount);
        
        emit FundsTransferred(lessor, totalAmount);
        
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
    
    // Emergency function to withdraw funds (only lessor)
    function emergencyWithdraw() external onlyLessor {
        require(!isRented, "Cannot withdraw during active rental");
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(lessor).transfer(balance);
            emit FundsTransferred(lessor, balance);
        }
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}