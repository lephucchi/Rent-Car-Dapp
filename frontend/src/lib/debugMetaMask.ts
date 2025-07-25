export function debugMetaMaskConnection(): void {
  console.group('🔍 MetaMask Debug Information');
  
  // Check browser environment
  console.log('🌐 Browser Environment:', typeof window !== 'undefined' ? 'Available' : 'Not Available');
  
  // Check window.ethereum
  console.log('⚡ window.ethereum:', window.ethereum ? 'Present' : 'Missing');
  
  if (window.ethereum) {
    console.log('🦊 isMetaMask:', window.ethereum.isMetaMask || false);
    console.log('📞 request method:', typeof window.ethereum.request);
    console.log('👂 on method:', typeof window.ethereum.on);
    console.log('🔌 provider info:', {
      chainId: window.ethereum.chainId,
      networkVersion: window.ethereum.networkVersion,
      selectedAddress: window.ethereum.selectedAddress
    });
  }
  
  // Check for other wallet providers
  console.log('🔍 Other wallet providers:');
  console.log('  - window.web3:', typeof (window as any).web3);
  console.log('  - window.ethereum.providers:', (window.ethereum as any)?.providers?.length || 0);
  
  // Check network
  if (window.ethereum?.chainId) {
    const chainId = parseInt(window.ethereum.chainId, 16);
    console.log('🌍 Current Chain ID:', chainId);
    console.log('🌍 Network:', getNetworkName(chainId));
  }
  
  console.groupEnd();
}

function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 1: return 'Ethereum Mainnet';
    case 5: return 'Goerli Testnet';
    case 11155111: return 'Sepolia Testnet';
    case 80001: return 'Mumbai Testnet';
    case 1337: return 'Localhost/Hardhat';
    default: return `Unknown (${chainId})`;
  }
}

// Global debug function
(window as any).debugMetaMask = debugMetaMaskConnection;
