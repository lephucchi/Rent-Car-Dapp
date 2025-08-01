/// <reference types="vite/client" />

interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
  [key: string]: any;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
