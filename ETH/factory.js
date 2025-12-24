
import { Contract } from "ethers";
import BuildingCommitteeFactory from "../ETH/artifacts/contracts/campaing.sol/BuildingCommitteeFactory.json";
 const ABI= BuildingCommitteeFactory.abi;
const FACTORY_ADDRESS ="0x26493A703FcA746254704203c8b141A32A6C1d55";

export function getFactoryContract(signerOrProvider) {
  return new Contract(FACTORY_ADDRESS, ABI, signerOrProvider);
}

