import { Contract } from "ethers";
import BuildingCommitteeABI from "../ETH/artifacts/contracts/campaing.sol/BuildingCommittee.json";

export function getCommitteeContract(address, providerOrSigner) {
  return new Contract(address, BuildingCommitteeABI.abi, providerOrSigner);
}
