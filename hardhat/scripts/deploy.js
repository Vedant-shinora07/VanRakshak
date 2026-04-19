const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy PermitRegistry
  const PermitRegistry = await hre.ethers.getContractFactory("PermitRegistry");
  const permitRegistry = await PermitRegistry.deploy();
  await permitRegistry.waitForDeployment();
  const permitRegistryAddress = await permitRegistry.getAddress();
  console.log("PermitRegistry deployed to:", permitRegistryAddress);

  // Grant FOREST_DEPT_ROLE to deployer on PermitRegistry
  const FOREST_DEPT_ROLE = await permitRegistry.FOREST_DEPT_ROLE();
  let tx = await permitRegistry.grantRole(FOREST_DEPT_ROLE, deployer.address);
  await tx.wait();
  console.log("Granted FOREST_DEPT_ROLE to deployer on PermitRegistry");

  // Deploy ForestCustody
  const ForestCustody = await hre.ethers.getContractFactory("ForestCustody");
  const forestCustody = await ForestCustody.deploy();
  await forestCustody.waitForDeployment();
  const forestCustodyAddress = await forestCustody.getAddress();
  console.log("ForestCustody deployed to:", forestCustodyAddress);

  // Grant ACTOR_ROLE and AUTHORITY_ROLE to deployer on ForestCustody
  const ACTOR_ROLE = await forestCustody.ACTOR_ROLE();
  const AUTHORITY_ROLE = await forestCustody.AUTHORITY_ROLE();
  
  tx = await forestCustody.grantRole(ACTOR_ROLE, deployer.address);
  await tx.wait();
  console.log("Granted ACTOR_ROLE to deployer on ForestCustody");

  tx = await forestCustody.grantRole(AUTHORITY_ROLE, deployer.address);
  await tx.wait();
  console.log("Granted AUTHORITY_ROLE to deployer on ForestCustody");

  // Write addresses to deployments.json
  const deployments = {
    PermitRegistry: permitRegistryAddress,
    ForestCustody: forestCustodyAddress
  };

  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`Addresses written to ${deploymentsPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
