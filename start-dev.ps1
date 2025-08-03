# Rent Car DApp - Development Setup Script

Write-Host "🚗 Starting Rent Car DApp Development Environment..." -ForegroundColor Green

# Function to check if a process is running on a specific port
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet
        return $connection
    } catch {
        return $false
    }
}

# Function to start Hardhat network
function Start-HardhatNetwork {
    Write-Host "🔧 Starting Hardhat local network..." -ForegroundColor Yellow
    
    # Check if Hardhat network is already running
    if (Test-Port -Port 8545) {
        Write-Host "⚠️  Port 8545 is already in use. Stopping existing process..." -ForegroundColor Yellow
        $process = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
        if ($process) {
            Stop-Process -Id $process -Force
            Start-Sleep -Seconds 2
        }
    }
    
    # Start Hardhat network in background
    cd smartcontract
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx hardhat node" -WindowStyle Minimized
    
    # Wait for network to be ready
    Write-Host "⏳ Waiting for Hardhat network to be ready..." -ForegroundColor Yellow
    $timeout = 30
    $elapsed = 0
    while (-not (Test-Port -Port 8545) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host "." -NoNewline
    }
    
    if (Test-Port -Port 8545) {
        Write-Host "`n✅ Hardhat network is running on http://localhost:8545" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Failed to start Hardhat network" -ForegroundColor Red
        exit 1
    }
    
    cd ..
}

# Function to deploy contract
function Deploy-Contract {
    Write-Host "📜 Deploying FixedRentalContract..." -ForegroundColor Yellow
    
    cd smartcontract
    
    # Deploy the contract
    $deployResult = npx hardhat run scripts/deploy-fixed-rental.js --network localhost
    
    if ($deployResult -match "deployed to: (0x[a-fA-F0-9]{40})") {
        $contractAddress = $matches[1]
        Write-Host "✅ Contract deployed successfully to: $contractAddress" -ForegroundColor Green
        
        # Update the contract config in frontend
        $configPath = "../frontend/src/lib/contractConfig.ts"
        if (Test-Path $configPath) {
            # Read current config
            $configContent = Get-Content $configPath -Raw
            
            # Update the address
            $configContent = $configContent -replace 'address:\s*"0x[a-fA-F0-9]{40}"', "address: `"$contractAddress`""
            
            # Write back to file
            Set-Content -Path $configPath -Value $configContent
            
            Write-Host "✅ Updated contract address in frontend config" -ForegroundColor Green
        }
        
        return $contractAddress
    } else {
        Write-Host "❌ Failed to deploy contract" -ForegroundColor Red
        Write-Host $deployResult -ForegroundColor Red
        exit 1
    }
    
    cd ..
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🌐 Starting frontend development server..." -ForegroundColor Yellow
    
    cd frontend
    
    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start frontend server
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    
    # Wait for frontend to be ready
    Write-Host "⏳ Waiting for frontend to be ready..." -ForegroundColor Yellow
    $timeout = 60
    $elapsed = 0
    while (-not (Test-Port -Port 5173) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 1
        $elapsed++
        if ($elapsed % 5 -eq 0) {
            Write-Host "." -NoNewline
        }
    }
    
    if (Test-Port -Port 5173) {
        Write-Host "`n✅ Frontend is running on http://localhost:5173" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Frontend may still be starting up..." -ForegroundColor Yellow
    }
    
    cd ..
}

# Function to setup MetaMask network
function Show-MetaMaskSetup {
    Write-Host "`n🦊 MetaMask Network Setup:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Network Name: Hardhat Local" -ForegroundColor White
    Write-Host "RPC URL: http://127.0.0.1:8545" -ForegroundColor White
    Write-Host "Chain ID: 1337" -ForegroundColor White
    Write-Host "Currency Symbol: ETH" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Test Accounts (with 10000 ETH each):" -ForegroundColor Cyan
    Write-Host "Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
    Write-Host "Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
    Write-Host ""
    Write-Host "Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor White  
    Write-Host "Private Key: 0x59c6995e998f97d3db2f06c5b6c4e6a7e1c42b43a8a9c65e33c9f22e0e2dc3c8" -ForegroundColor White
    Write-Host ""
    Write-Host "✨ Use Account #0 as the contract owner (lessor)" -ForegroundColor Green
    Write-Host "✨ Use Account #1 as a renter (lessee)" -ForegroundColor Green
}

# Main execution
try {
    Write-Host "🚀 Rent Car DApp Development Environment Setup" -ForegroundColor Magenta
    Write-Host "=============================================" -ForegroundColor Magenta
    
    # Check prerequisites
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
    
    # Check Node.js
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js is not installed" -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm is not installed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    
    # Start Hardhat network
    Start-HardhatNetwork
    
    Start-Sleep -Seconds 3
    
    # Deploy contract
    $contractAddress = Deploy-Contract
    
    Start-Sleep -Seconds 2
    
    # Start frontend
    Start-Frontend
    
    # Show MetaMask setup
    Show-MetaMaskSetup
    
    Write-Host ""
    Write-Host "🎉 Development environment is ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "🔧 Hardhat Network: http://localhost:8545" -ForegroundColor White
    Write-Host "📜 Contract Address: $contractAddress" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Available Pages:" -ForegroundColor Cyan
    Write-Host "   • Home: http://localhost:5173/" -ForegroundColor White
    Write-Host "   • Rent Car: http://localhost:5173/rent" -ForegroundColor White
    Write-Host "   • Lend Car: http://localhost:5173/lend" -ForegroundColor White
    Write-Host "   • Contract Dashboard: http://localhost:5173/contract" -ForegroundColor White
    Write-Host "   • Transactions: http://localhost:5173/transactions" -ForegroundColor White
    Write-Host "   • Inspector: http://localhost:5173/inspector" -ForegroundColor White
    Write-Host "   • Admin: http://localhost:5173/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "🚗 Try the new Contract Dashboard at: http://localhost:5173/contract" -ForegroundColor Green
    Write-Host ""
    Write-Host "To stop the development environment:" -ForegroundColor Yellow
    Write-Host "  1. Close the Hardhat network terminal" -ForegroundColor White
    Write-Host "  2. Close the frontend terminal" -ForegroundColor White
    Write-Host "  3. Or run: Stop-Process -Name node -Force" -ForegroundColor White
    
} catch {
    Write-Host "❌ An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
