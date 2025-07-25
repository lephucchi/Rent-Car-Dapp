export interface MetaMaskStatus {
  isInstalled: boolean;
  isAvailable: boolean;
  error?: string;
  suggestion?: string;
}

export function checkMetaMaskStatus(): MetaMaskStatus {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return {
      isInstalled: false,
      isAvailable: false,
      error: "Not in browser environment",
      suggestion: "This application requires a browser with MetaMask installed"
    };
  }

  // Check if ethereum object exists
  if (!window.ethereum) {
    return {
      isInstalled: false,
      isAvailable: false,
      error: "MetaMask not found",
      suggestion: "Please install MetaMask extension from https://metamask.io/ and refresh the page"
    };
  }

  // Check if it's actually MetaMask
  if (!window.ethereum.isMetaMask) {
    return {
      isInstalled: false,
      isAvailable: false,
      error: "MetaMask not detected",
      suggestion: "Please make sure MetaMask is installed and enabled in your browser"
    };
  }

  // Check if MetaMask is accessible
  if (!window.ethereum.request) {
    return {
      isInstalled: true,
      isAvailable: false,
      error: "MetaMask not accessible",
      suggestion: "MetaMask seems to be installed but not accessible. Please refresh the page or restart your browser"
    };
  }

  // All checks passed
  return {
    isInstalled: true,
    isAvailable: true
  };
}

export function getMetaMaskErrorMessage(status: MetaMaskStatus): string {
  if (status.isAvailable) {
    return "";
  }

  let message = status.error || "MetaMask connection issue";
  if (status.suggestion) {
    message += ". " + status.suggestion;
  }

  return message;
}

// Helper function to wait for MetaMask to be available
export async function waitForMetaMask(timeout = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    const checkInterval = 100;
    let elapsed = 0;

    const check = () => {
      const status = checkMetaMaskStatus();
      if (status.isAvailable) {
        resolve(true);
        return;
      }

      elapsed += checkInterval;
      if (elapsed >= timeout) {
        resolve(false);
        return;
      }

      setTimeout(check, checkInterval);
    };

    check();
  });
}
