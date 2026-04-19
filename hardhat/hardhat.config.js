require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const fs = require('fs');
const path = require('path');

task("copy-abis", "Copies ABIs to the backend directory", async () => {
  const backendAbiDir = path.join(__dirname, '..', 'backend', 'contracts', 'abi');
  
  if (!fs.existsSync(backendAbiDir)) {
    fs.mkdirSync(backendAbiDir, { recursive: true });
  }

  const contracts = ['ForestCustody', 'PermitRegistry'];

  for (const contract of contracts) {
    const abiPath = path.join(__dirname, 'artifacts', 'contracts', `${contract}.sol`, `${contract}.json`);
    const destPath = path.join(backendAbiDir, `${contract}.json`);
    
    if (fs.existsSync(abiPath)) {
      const artifact = require(abiPath);
      fs.writeFileSync(destPath, JSON.stringify(artifact.abi, null, 2));
      console.log(`Copied ${contract} ABI to ${destPath}`);
    } else {
      console.log(`ABI for ${contract} not found at ${abiPath}`);
    }
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mumbai: {
      url: process.env.RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  }
};
