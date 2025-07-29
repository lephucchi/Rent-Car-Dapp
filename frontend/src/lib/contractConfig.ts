// Contract configuration for FixedRentalContract
export const contractConfig = {
  address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  network: "localhost",
  chainId: 1337,
  abi: [
    {
      "type": "constructor",
      "inputs": [
        {"type": "string", "name": "_assetName"},
        {"type": "uint256", "name": "_rentalFeePerDay"},
        {"type": "uint256", "name": "_durationDays"},
        {"type": "uint256", "name": "_insuranceFee"},
        {"type": "address", "name": "_damageAssessor"}
      ]
    },
    {
      "type": "function",
      "name": "assetName",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "string"}]
    },
    {
      "type": "function",
      "name": "rentalFeePerDay",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "durationDays",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "insuranceFee",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "lessor",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "address"}]
    },
    {
      "type": "function",
      "name": "lessee",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "address"}]
    },
    {
      "type": "function",
      "name": "isRented",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "bool"}]
    },
    {
      "type": "function",
      "name": "isDamaged",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "bool"}]
    },
    {
      "type": "function",
      "name": "renterRequestedReturn",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "bool"}]
    },
    {
      "type": "function",
      "name": "ownerConfirmedReturn",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "bool"}]
    },
    {
      "type": "function",
      "name": "actualDays",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "assessedDamageAmount",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "getTotalRentalFee",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "getDeposit",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "getRemainingPayment",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "getFinalPaymentAmount",
      "constant": true,
      "inputs": [],
      "outputs": [{"type": "uint256"}]
    },
    {
      "type": "function",
      "name": "rent",
      "constant": false,
      "payable": true,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "cancelRental",
      "constant": false,
      "payable": false,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "requestReturn",
      "constant": false,
      "payable": false,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "confirmReturn",
      "constant": false,
      "payable": false,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "setActualUsage",
      "constant": false,
      "payable": false,
      "inputs": [{"type": "uint256", "name": "_actualDays"}],
      "outputs": []
    },
    {
      "type": "function",
      "name": "reportDamage",
      "constant": false,
      "payable": false,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "assessDamage",
      "constant": false,
      "payable": false,
      "inputs": [{"type": "uint256", "name": "amountInEther"}],
      "outputs": []
    },
    {
      "type": "function",
      "name": "completeRental",
      "constant": false,
      "payable": true,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "event",
      "name": "RentalStarted",
      "inputs": [
        {"type": "address", "name": "lessee", "indexed": false},
        {"type": "uint256", "name": "deposit", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "RentalCancelled",
      "inputs": [
        {"type": "address", "name": "lessee", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "DamageReported",
      "inputs": [
        {"type": "address", "name": "lessor", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "FundsTransferred",
      "inputs": [
        {"type": "address", "name": "to", "indexed": false},
        {"type": "uint256", "name": "amount", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "RenterRequestedReturn",
      "inputs": [
        {"type": "address", "name": "lessee", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "OwnerConfirmedReturn",
      "inputs": [
        {"type": "address", "name": "lessor", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "ActualUsageSet",
      "inputs": [
        {"type": "uint256", "name": "daysUsed", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "DamageAssessed",
      "inputs": [
        {"type": "address", "name": "assessor", "indexed": false},
        {"type": "uint256", "name": "amount", "indexed": false}
      ]
    }
  ]
};
