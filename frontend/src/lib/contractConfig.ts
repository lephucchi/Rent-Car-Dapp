// Contract configuration loaded from deployed contract
export const contractConfig = {
  address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  network: "localhost",
  chainId: 1337,
  abi: [
    {
      "type": "constructor",
      "payable": false,
      "inputs": [
        {"type": "string", "name": "_assetName"},
        {"type": "uint256", "name": "_rentalFeePerMinute"},
        {"type": "uint256", "name": "_durationMinutes"},
        {"type": "uint256", "name": "_insuranceFee"},
        {"type": "uint256", "name": "_insuranceCompensation"}
      ]
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
      "inputs": [{"type": "uint256", "name": "_actualMinutes"}],
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
      "name": "completeRental",
      "constant": false,
      "payable": true,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "withdrawFunds",
      "constant": false,
      "payable": false,
      "inputs": [],
      "outputs": []
    },
    {
      "type": "function",
      "name": "getContractDetails",
      "constant": true,
      "payable": false,
      "inputs": [],
      "outputs": [
        {"type": "string", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "address", "name": ""},
        {"type": "address", "name": ""},
        {"type": "uint8", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "uint256", "name": ""},
        {"type": "bool", "name": ""}
      ]
    },
    {
      "type": "function",
      "name": "getRemainingPayment",
      "constant": true,
      "payable": false,
      "inputs": [],
      "outputs": [{"type": "uint256", "name": ""}]
    },
    {
      "type": "event",
      "name": "RentalStarted",
      "inputs": [
        {"type": "address", "name": "lessee", "indexed": true},
        {"type": "uint256", "name": "startTime", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "RenterRequestedReturn",
      "inputs": []
    },
    {
      "type": "event",
      "name": "OwnerConfirmedReturn",
      "inputs": []
    },
    {
      "type": "event",
      "name": "ActualUsageSet",
      "inputs": [
        {"type": "uint256", "name": "actualMinutes", "indexed": false}
      ]
    },
    {
      "type": "event",
      "name": "DamageReported",
      "inputs": []
    },
    {
      "type": "event",
      "name": "FundsTransferred",
      "inputs": [
        {"type": "address", "name": "to", "indexed": true},
        {"type": "uint256", "name": "amount", "indexed": false}
      ]
    }
  ]
};
