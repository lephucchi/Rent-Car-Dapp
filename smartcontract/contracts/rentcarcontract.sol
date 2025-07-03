pragma solidity ^0.8.0;

// SPDX-License-Identifier: MIT

contract CarRental {
    address public lessor;
    address public lessee;
    address public inspector;
    
    // Địa chỉ inspector cố định (có thể thay đổi bởi admin nếu cần)
    address public constant DEFAULT_INSPECTOR = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    
    struct Car {
        string make;
        string model;
        uint256 year;
    }
    
    Car public car;
    uint256 public pricePerDay;
    uint256 public rentalDuration;
    uint256 public depositAmount;
    uint256 public latePenaltyRate;
    uint256 public earlyDepreciationRate;
    uint256 public startTime;
    uint256 public dueTime;
    uint256 public returnTime;
    bool public isDamaged;
    uint256 public compensationAmount;
    
    enum Status { Pending, Active, Returned, Completed, Canceled }
    Status public status;
    
    event ContractInitiated(address lessor, uint256 timestamp);
    event ContractActivated(address lessee, uint256 timestamp);
    event CarReturned(address lessee, uint256 timestamp);
    event InspectionCompleted(bool isDamaged, uint256 compensation);
    event ContractFinalized(uint256 totalAmount);
    event ContractCanceled(address user, uint256 timestamp);
    event InspectionRequested(address contractAddress, address lessee, uint256 timestamp);
    
    modifier onlyLessor() {
        require(msg.sender == lessor, "Only lessor can call this function");
        _;
    }
    
    modifier onlyLessee() {
        require(msg.sender == lessee, "Only lessee can call this function");
        _;
    }
    
    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this function");
        _;
    }
    
    modifier inStatus(Status _status) {
        require(status == _status, "Invalid contract status");
        _;
    }
    
    constructor(
        string memory _make,
        string memory _model,
        uint256 _year,
        uint256 _pricePerDay,
        uint256 _rentalDuration,
        uint256 _depositAmount,
        uint256 _latePenaltyRate,
        uint256 _earlyDepreciationRate
    ) {
        lessor = msg.sender;
        inspector = DEFAULT_INSPECTOR; // Sử dụng inspector cố định
        car = Car(_make, _model, _year);
        pricePerDay = _pricePerDay;
        rentalDuration = _rentalDuration;
        depositAmount = _depositAmount;
        latePenaltyRate = _latePenaltyRate;
        earlyDepreciationRate = _earlyDepreciationRate;
        status = Status.Pending;
        emit ContractInitiated(lessor, block.timestamp);
    }
    
    function activateContract() external payable inStatus(Status.Pending) {
        require(msg.value >= depositAmount, "Insufficient deposit");
        lessee = msg.sender;
        startTime = block.timestamp;
        dueTime = startTime + (rentalDuration * 1 days);
        status = Status.Active;
        emit ContractActivated(lessee, block.timestamp);
    }
    
    function returnCar() external onlyLessee inStatus(Status.Active) {
        returnTime = block.timestamp;
        status = Status.Returned;
        
        // Emit event để thông báo cho inspector
        emit InspectionRequested(address(this), lessee, block.timestamp);
        emit CarReturned(lessee, block.timestamp);
    }
    
    function inspectCar(bool _isDamaged, uint256 _compensationAmount) external onlyInspector inStatus(Status.Returned) {
        isDamaged = _isDamaged;
        compensationAmount = _isDamaged ? _compensationAmount : 0;
        status = Status.Completed;
        emit InspectionCompleted(_isDamaged, _compensationAmount);
    }
    
    function finalizeContract() external onlyLessor inStatus(Status.Completed) {
        uint256 rentalFee = pricePerDay * rentalDuration;
        uint256 penalty = 0;
        
        if (returnTime > dueTime) {
            uint256 daysLate = (returnTime - dueTime) / 1 days;
            penalty = daysLate * latePenaltyRate;
        } else if (returnTime < dueTime) {
            uint256 daysEarly = (dueTime - returnTime) / 1 days;
            penalty = daysEarly * earlyDepreciationRate;
        }
        
        uint256 totalCharges = rentalFee + penalty + compensationAmount;
        
        // Transfer rental fee + penalties + compensation to lessor
        if (totalCharges > 0) {
            if (totalCharges <= address(this).balance) {
                payable(lessor).transfer(totalCharges);
            } else {
                payable(lessor).transfer(address(this).balance);
            }
        }
        
        // Return remaining deposit to lessee if any
        uint256 remainingBalance = address(this).balance;
        if (remainingBalance > 0) {
            payable(lessee).transfer(remainingBalance);
        }
        
        emit ContractFinalized(totalCharges);
    }
    
    function cancelContract() external inStatus(Status.Pending) {
        require(msg.sender == lessee || msg.sender == lessor, "Only lessee or lessor can cancel");
        
        status = Status.Canceled;
        
        // Return deposit to lessee if contract is canceled
        if (address(this).balance > 0) {
            payable(lessee).transfer(address(this).balance);
        }
        
        emit ContractCanceled(msg.sender, block.timestamp);
    }
    
    function calculateTotalAmount() internal view returns (uint256) {
        uint256 rentalFee = pricePerDay * rentalDuration;
        uint256 penalty = 0;
        
        if (returnTime > dueTime) {
            uint256 daysLate = (returnTime - dueTime) / 1 days;
            penalty = daysLate * latePenaltyRate;
        } else if (returnTime < dueTime) {
            uint256 daysEarly = (dueTime - returnTime) / 1 days;
            penalty = daysEarly * earlyDepreciationRate;
        }
        
        return rentalFee + penalty + compensationAmount;
    }
    
    // Getter functions for frontend
    function getCarInfo() external view returns (string memory, string memory, uint256) {
        return (car.make, car.model, car.year);
    }
    
    function getRentalInfo() external view returns (uint256, uint256, uint256, uint256, uint256) {
        return (pricePerDay, rentalDuration, depositAmount, latePenaltyRate, earlyDepreciationRate);
    }
    
    function getTimeInfo() external view returns (uint256, uint256, uint256) {
        return (startTime, dueTime, returnTime);
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    function getInspectionInfo() external view returns (bool, uint256) {
        return (isDamaged, compensationAmount);
    }
}