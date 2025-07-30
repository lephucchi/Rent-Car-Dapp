/**
 * Utility functions for MetaMask detection and interaction
 */

export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  
  return !!(window.ethereum && window.ethereum.isMetaMask);
};

export const getMetaMaskError = (): string | null => {
  if (typeof window === "undefined") {
    return "Browser environment required";
  }
  
  if (!window.ethereum) {
    return "MetaMask is not installed. Please install MetaMask and refresh the page.";
  }
  
  if (!window.ethereum.isMetaMask) {
    return "MetaMask not detected. Please ensure MetaMask is your active wallet.";
  }
  
  return null;
};

export const connectToMetaMask = async () => {
  const error = getMetaMaskError();
  if (error) {
    throw new Error(error);
  }
  
  try {
    const accounts = await window.ethereum!.request({ 
      method: "eth_requestAccounts" 
    });
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please connect your wallet.");
    }
    
    return accounts[0];
  } catch (err: any) {
    if (err.code === 4001) {
      throw new Error("Connection rejected. Please approve the connection request.");
    } else if (err.code === -32002) {
      throw new Error("Connection request already pending. Please check MetaMask.");
    } else {
      throw err;
    }
  }
};
