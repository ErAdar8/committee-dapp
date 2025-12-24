// ETH/providers.js
import { BrowserProvider, JsonRpcProvider } from "ethers";

const INFURA_URL =
  "https://sepolia.infura.io/v3/0c4cc699fab94fa2a148dc0d75280512";

export async function getProvider() {
  // Browser + MetaMask
  if (typeof window !== "undefined" && window.ethereum) {
    const browserProvider = new BrowserProvider(window.ethereum);

    const network = await browserProvider.getNetwork();

    const chainId =
      typeof network.chainId === "bigint"
        ? Number(network.chainId)
        : network.chainId;

    // Wrong network -> fallback to Infura (read-only)
    if (chainId !== 11155111) {
      return new JsonRpcProvider(INFURA_URL);
    }

    return browserProvider;
  }

  // SSR / No MetaMask -> Infura provider
  return new JsonRpcProvider(INFURA_URL);
}
