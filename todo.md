# Car Rental Smart Contract Documentation

## Overview

This project implements a smart contract called `FixedRentalContract` written in Solidity for managing a fixed-term car rental process. It supports:
s
* One asset per contract instance
* Two parties: `lessor` (owner of the car) and `lessee` (renter)
* A deposit-based rental model with insurance handling and return confirmation flow

This document is intended for frontend developers and AI agents to help integrate with the contract using tools like React, Ethers.js, and MetaMask.

---

## Contract Name

```solidity
contract FixedRentalContract
```

---

## Core Parameters

| Name                    | Type    | Description                                |
| ----------------------- | ------- | ------------------------------------------ |
| `lessor`                | address | The car owner, also the contract deployer  |
| `lessee`                | address | The renter                                 |
| `assetName`             | string  | The name of the asset (car)                |
| `rentalFeePerMinute`    | uint    | Fee in ETH per minute                      |
| `durationMinutes`       | uint    | Agreed rental duration                     |
| `insuranceFee`          | uint    | Flat insurance fee in ETH                  |
| `insuranceCompensation` | uint    | Compensation charged if the car is damaged |

---

## Key States

| Variable                | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `isRented`              | Flag indicating whether the car is currently rented |
| `isDamaged`             | Flag if the lessor reported damage                  |
| `renterRequestedReturn` | Flag if the renter initiated the return process     |
| `ownerConfirmedReturn`  | Flag if the lessor confirmed the return             |
| `actualMinutes`         | Actual minutes used (set by lessor)                 |

---

## Deployment

The contract must be deployed by the **lessor** (car owner):

```solidity
new FixedRentalContract("Tesla Model 3", 1, 60, 10, 50)
```

This example means:

* Fee = 1 ETH per minute
* Duration = 60 minutes
* Insurance = 10 ETH
* Compensation if damaged = 50 ETH

---

## Workflow Summary

1. **Deploy Contract** → `lessor` defines asset + terms.
2. **Rent Car** → `lessee` calls `rent()` with deposit.
3. **Use Period** → Car is considered rented.
4. **Return Process:**

   * `lessee` calls `requestReturn()`
   * `lessor` calls `confirmReturn()`
   * `lessor` sets `actualMinutes` via `setActualUsage()`
   * (Optional) `lessor` reports damage via `reportDamage()`
5. **Pay Remaining Fees** → `lessee` or `lessor` calls `completeRental()` with final payment.

---

## Key Functions (for Frontend Integration)

### rent()

```solidity
function rent() external payable
```

* `msg.sender` becomes `lessee`
* Must pay: `getDeposit()` \* 1 ether
* Emits: `RentalStarted`

### cancelRental()

```solidity
function cancelRental() external
```

* Refund 50% to both parties
* Emits: `RentalCancelled`

### requestReturn()

```solidity
function requestReturn() external
```

* Called by `lessee` after usage
* Emits: `RenterRequestedReturn`

### confirmReturn()

```solidity
function confirmReturn() external
```

* Called by `lessor`
* Emits: `OwnerConfirmedReturn`

### setActualUsage(uint minutesUsed)

```solidity
function setActualUsage(uint _actualMinutes) external
```

* Called by `lessor`
* Required before final fee calculation

### reportDamage()

```solidity
function reportDamage() external
```

* Optional
* Triggers damage flag and adds compensation fee

### completeRental()

```solidity
function completeRental() external payable
```

* Final step
* Requires both `requestReturn` and `confirmReturn`
* Computes remaining payment
* Transfers full funds to `lessor`

---

## View Functions

### getDeposit()

```solidity
function getDeposit() public view returns (uint)
```

* Returns 50% of total fee (excluding insurance)

### getTotalRentalFee()

```solidity
function getTotalRentalFee() public view returns (uint)
```

* `rentalFeePerMinute * duration + insurance`

### getRemainingPayment()

```solidity
function getRemainingPayment() public view returns (uint)
```

* Takes into account: actual minutes, insurance, damage

### getFinalPaymentAmount()

```solidity
function getFinalPaymentAmount() external view returns (uint)
```

* Returns remaining payment in wei

---

## Events

```solidity
RentalStarted(address lessee, uint deposit);
RentalCancelled(address lessee);
RenterRequestedReturn(address lessee);
OwnerConfirmedReturn(address lessor);
DamageReported(address lessor);
ActualUsageSet(uint minutesUsed);
FundsTransferred(address to, uint amount);
```

---

## Suggested Frontend Flow

### 1. Connect Wallet

* Detect current address → define role (`lessor` or `lessee`)

### 2. Read Contract Info

* Use `getDeposit()`, `getTotalRentalFee()` for estimates
* Use state flags (`isRented`, `renterRequestedReturn`, `ownerConfirmedReturn`) to update UI

### 3. Actions per Role

#### As Lessor:

* View contract state
* Call `setActualUsage()`, `confirmReturn()`, `reportDamage()`

#### As Lessee:

* Call `rent()` with deposit ETH
* Later call `requestReturn()`
* Finally `completeRental()` with ETH from `getFinalPaymentAmount()`

---

## TODO Suggestions for Improvement

* Add Inspector (3rd party role) to verify return status
* Modularize damage handling and insurance fund logic
* Improve security with role modifiers (e.g., `onlyLessee`, `onlyLessor`)
* Add timeout for overdue returns
* Implement ERC721-based car ownership (NFT-based)

---

## Contract Deployment

You can compile and deploy this contract with Hardhat or Remix.

For Hardhat:

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

---

## Final Notes

* All ETH values in contract are in `ether` (not `wei`) when interacting from frontend.
* Frontend must convert user ETH input properly using Ethers.js:

```ts
ethers.utils.parseEther("10")
ethers.utils.formatEther(value)
```

---

## License

MIT
