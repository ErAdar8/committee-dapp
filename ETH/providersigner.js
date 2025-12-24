import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID_DEC = 11155111;
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

function isSepoliaChain(chainIdRaw) {
  // MetaMask returns hex string for eth_chainId (e.g. "0xaa36a7")
  if (typeof chainIdRaw === "string") {
    return chainIdRaw.toLowerCase() === SEPOLIA_CHAIN_ID_HEX;
  }

  // ethers may return bigint or number depending on the path
  if (typeof chainIdRaw === "bigint") {
    return Number(chainIdRaw) === SEPOLIA_CHAIN_ID_DEC;
  }

  return chainIdRaw === SEPOLIA_CHAIN_ID_DEC;
}

export async function getWriteSigner() {
  if (typeof window === "undefined") {
    throw new Error("This action requires a browser with MetaMask.");
  }

  if (!window.ethereum) {
    throw new Error("MetaMask was not detected. Please install/enable it.");
  }

  // 1) Request accounts (triggers popup if not connected)
  await window.ethereum.request({ method: "eth_requestAccounts" });

  // 2) Get chainId directly from MetaMask (most reliable)
  const chainIdRaw = await window.ethereum.request({ method: "eth_chainId" });

  if (!isSepoliaChain(chainIdRaw)) {
    throw new Error("Wrong network. Please switch MetaMask to Sepolia and try again.");
  }

  // 3) Build signer
  const provider = new BrowserProvider(window.ethereum);
  return await provider.getSigner();
}
