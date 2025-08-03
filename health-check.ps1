# Rent Car DApp - Health Check Script

Write-Host "🔍 Rent Car DApp Health Check" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$issues = @()
$warnings = @()

# Function to check if a process is running on a specific port
function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Function to check file exists
function Test-FileExists {
    param([string]$FilePath, [string]$Description)
    if (Test-Path $FilePath) {
        Write-Host "✅ $Description" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ $Description" -ForegroundColor Red
        $script:issues += $Description
        return $false
    }
}

# Function to check directory structure
function Test-DirectoryStructure {
    Write-Host "`n📁 Checking directory structure..." -ForegroundColor Yellow
    
    $requiredDirs = @(
        @{Path="smartcontract"; Desc="Smart contract directory"},
        @{Path="frontend"; Desc="Frontend directory"},
        @{Path="smartcontract/contracts"; Desc="Contracts directory"},
        @{Path="smartcontract/scripts"; Desc="Scripts directory"},
        @{Path="frontend/src"; Desc="Frontend source directory"},
        @{Path="frontend/src/lib"; Desc="Frontend lib directory"},
        @{Path="frontend/src/stores"; Desc="Frontend stores directory"},
        @{Path="frontend/src/contexts"; Desc="Frontend contexts directory"}
    )
    
    foreach ($dir in $requiredDirs) {
        Test-FileExists -FilePath $dir.Path -Description $dir.Desc
    }
}

# Function to check required files
function Test-RequiredFiles {
    Write-Host "`n📄 Checking required files..." -ForegroundColor Yellow
    
    $requiredFiles = @(
        @{Path="smartcontract/contracts/FixedRentalContract.sol"; Desc="FixedRentalContract.sol"},
        @{Path="smartcontract/hardhat.config.js"; Desc="Hardhat config"},
        @{Path="smartcontract/scripts/deploy-fixed-rental.js"; Desc="Deploy script"},
        @{Path="frontend/package.json"; Desc="Frontend package.json"},
        @{Path="frontend/src/main.tsx"; Desc="Frontend main.tsx"},
        @{Path="frontend/src/lib/contractConfig.ts"; Desc="Contract config"},
        @{Path="frontend/src/lib/web3-integration.ts"; Desc="Web3 integration service"},
        @{Path="frontend/src/stores/unifiedWeb3Store.ts"; Desc="Unified Web3 store"},
        @{Path="frontend/src/contexts/Web3Context.tsx"; Desc="Web3 context"},
        @{Path="frontend/src/components/UnifiedRentalDashboard.tsx"; Desc="Unified rental dashboard"},
        @{Path="frontend/src/pages/RentalContract.tsx"; Desc="Rental contract page"}
    )
    
    foreach ($file in $requiredFiles) {
        Test-FileExists -FilePath $file.Path -Description $file.Desc
    }
}

# Function to check dependencies
function Test-Dependencies {
    Write-Host "`n📦 Checking dependencies..." -ForegroundColor Yellow
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Node.js not found" -ForegroundColor Red
            $script:issues += "Node.js not installed"
        }
    } catch {
        Write-Host "❌ Node.js not found" -ForegroundColor Red
        $script:issues += "Node.js not installed"
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ npm not found" -ForegroundColor Red
            $script:issues += "npm not installed"
        }
    } catch {
        Write-Host "❌ npm not found" -ForegroundColor Red
        $script:issues += "npm not installed"
    }
    
    # Check smart contract dependencies
    if (Test-Path "smartcontract/node_modules") {
        Write-Host "✅ Smart contract dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Smart contract dependencies not installed" -ForegroundColor Yellow
        $script:warnings += "Run 'npm install' in smartcontract directory"
    }
    
    # Check frontend dependencies
    if (Test-Path "frontend/node_modules") {
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend dependencies not installed" -ForegroundColor Yellow
        $script:warnings += "Run 'npm install' in frontend directory"
    }
}

# Function to check services
function Test-Services {
    Write-Host "`n🌐 Checking services..." -ForegroundColor Yellow
    
    # Check Hardhat network
    if (Test-Port -Port 8545) {
        Write-Host "✅ Hardhat network running on port 8545" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Hardhat network not running on port 8545" -ForegroundColor Yellow
        $script:warnings += "Start Hardhat network: 'npx hardhat node' in smartcontract directory"
    }
    
    # Check frontend dev server
    if (Test-Port -Port 5173) {
        Write-Host "✅ Frontend dev server running on port 5173" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend dev server not running on port 5173" -ForegroundColor Yellow
        $script:warnings += "Start frontend server: 'npm run dev' in frontend directory"
    }
}

# Function to check contract configuration
function Test-ContractConfig {
    Write-Host "`n📜 Checking contract configuration..." -ForegroundColor Yellow
    
    $configPath = "frontend/src/lib/contractConfig.ts"
    if (Test-Path $configPath) {
        $configContent = Get-Content $configPath -Raw
        
        # Check if config has proper structure
        if ($configContent -match 'address:\s*"0x[a-fA-F0-9]{40}"') {
            Write-Host "✅ Contract address format is valid" -ForegroundColor Green
        } else {
            Write-Host "❌ Contract address format is invalid" -ForegroundColor Red
            $script:issues += "Invalid contract address in contractConfig.ts"
        }
        
        if ($configContent -match 'chainId:\s*1337') {
            Write-Host "✅ Chain ID is set to 1337 (Hardhat)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Chain ID is not set to 1337" -ForegroundColor Yellow
            $script:warnings += "Chain ID should be 1337 for Hardhat network"
        }
        
        if ($configContent -match 'abi:\s*\[') {
            Write-Host "✅ ABI is present in config" -ForegroundColor Green
        } else {
            Write-Host "❌ ABI is missing from config" -ForegroundColor Red
            $script:issues += "ABI missing from contractConfig.ts"
        }
    }
}

# Function to validate routes
function Test-Routes {
    Write-Host "`n🛣️  Checking routes configuration..." -ForegroundColor Yellow
    
    $mainTsxPath = "frontend/src/main.tsx"
    if (Test-Path $mainTsxPath) {
        $mainContent = Get-Content $mainTsxPath -Raw
        
        if ($mainContent -match '<Route path="/contract"') {
            Write-Host "✅ Contract route is configured" -ForegroundColor Green
        } else {
            Write-Host "❌ Contract route is missing" -ForegroundColor Red
            $script:issues += "Contract route not configured in main.tsx"
        }
        
        if ($mainContent -match 'Web3Provider') {
            Write-Host "✅ Web3Provider is integrated" -ForegroundColor Green
        } else {
            Write-Host "❌ Web3Provider is not integrated" -ForegroundColor Red
            $script:issues += "Web3Provider not integrated in main.tsx"
        }
    }
}

# Main execution
Write-Host "Starting comprehensive health check...`n"

Test-DirectoryStructure
Test-RequiredFiles
Test-Dependencies
Test-Services
Test-ContractConfig
Test-Routes

# Summary
Write-Host "`n📊 Health Check Summary" -ForegroundColor Magenta
Write-Host "======================" -ForegroundColor Magenta

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "🎉 All checks passed! System is ready." -ForegroundColor Green
} else {
    if ($issues.Count -gt 0) {
        Write-Host "`n❌ Issues found ($($issues.Count)):" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  • $issue" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  Warnings ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  • $warning" -ForegroundColor Yellow
        }
    }
}

Write-Host "`n🚀 Quick Start Commands:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Auto setup: .\start-dev.ps1" -ForegroundColor White
Write-Host "2. Manual setup:" -ForegroundColor White
Write-Host "   • cd smartcontract && npx hardhat node" -ForegroundColor Gray
Write-Host "   • cd smartcontract && npx hardhat run scripts/deploy-fixed-rental.js --network localhost" -ForegroundColor Gray
Write-Host "   • cd frontend && npm run dev" -ForegroundColor Gray
Write-Host "3. Access contract dashboard: http://localhost:5173/contract" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "• README-INTEGRATION.md - Complete setup guide" -ForegroundColor White
Write-Host "• USAGE.md - Usage instructions" -ForegroundColor White

if ($issues.Count -eq 0) {
    exit 0
} else {
    exit 1
}
