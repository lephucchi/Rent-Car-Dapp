import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const PRIVATE_KEY_INSPECTOR = process.env.PRIVATE_KEY_INSPECTOR;
const CONTRACT_ADDRESS_FILE = process.env.CONTRACT_ADDRESS_FILE || '../frontend/public/contract-address.json';

if (!PRIVATE_KEY_INSPECTOR) {
  console.error('Missing PRIVATE_KEY_INSPECTOR in environment');
  process.exit(1);
}

// Initialize provider and wallet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY_INSPECTOR, provider);

// Load deployed contract address
const contractAddressPath = path.resolve(__dirname, CONTRACT_ADDRESS_FILE);
let contractData: { address: string };
try {
  const json = fs.readFileSync(contractAddressPath, 'utf-8');
  contractData = JSON.parse(json);
} catch (err) {
  console.error('Error reading contract address file:', err);
  process.exit(1);
}
const CONTRACT_ADDRESS = contractData.address;

// Contract ABI (should match frontend ABI)
const CONTRACT_ABI = [
  'event InspectionRequested(address contractAddress, address lessee, uint256 timestamp)',
  'event InspectionCompleted(bool isDamaged, uint256 compensation)',
];

// Instantiate contract with provider (read-only)
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// In-memory store for pending inspections
let pendingInspections: string[] = [];

// Subscribe to InspectionRequested event
contract.on('InspectionRequested', (contractAddr: string, lessee: string, timestamp: ethers.BigNumber, event: any) => {
  const addr = contractAddr.toLowerCase();
  if (!pendingInspections.includes(addr)) {
    pendingInspections.push(addr);
    console.log('Inspection requested for contract:', addr);
  }
});

// Subscribe to InspectionCompleted event to remove from pending
contract.on('InspectionCompleted', (isDamaged: boolean, compensation: ethers.BigNumber, event: any) => {
  const addr = event.address.toLowerCase();
  pendingInspections = pendingInspections.filter(a => a !== addr);
  console.log('Inspection completed for contract:', addr);
});

// Express setup
type PendingResponse = { contracts: string[] };
const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to get pending inspections
app.get('/api/inspections/pending', (_req: Request, res: Response) => {
  const response: PendingResponse = { contracts: pendingInspections };
  res.json(response);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
