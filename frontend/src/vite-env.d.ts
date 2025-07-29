/// <reference types="vite/client" />

interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (args: { method: string; params?: any[] | Record<string, any>[] }) => Promise<any>;
  on?: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, callback: (...args: any[]) => void) => void;
  chainId?: string;
  networkVersion?: string;
  selectedAddress?: string;
  [key: string]: any;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
