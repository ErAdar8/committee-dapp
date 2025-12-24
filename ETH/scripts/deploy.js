const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying BuildingCommitteeFactory...");

  const Factory = await ethers.getContractFactory(
    "BuildingCommitteeFactory"
  );

  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();

  console.log(
    "BuildingCommitteeFactory deployed at:",
    factoryAddress
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
