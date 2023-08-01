// Copyright 2023 Stichting Block Foundation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



// Import necessary libraries
import { ethers } from "hardhat";

// The main function of this script, where the deployment takes place
async function main() {
  // Getting the Contract Factory, which will allow us to deploy new instances of the contract
  const PrivateCityFactory = await ethers.getContractFactory("PrivateCity");

  // Getting the account that will deploy the contract (the first one in the list of available accounts)
  const [deployer] = await ethers.getSigners();

  // Logging the deployer's address
  console.log("Deploying the contracts with the account:", deployer.address);

  // Logging the deployer's balance
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploying the contract and getting the deployed instance
  const PrivateCity = await PrivateCityFactory.deploy();

  // Logging the contract address
  console.log("PrivateCity Contract Address:", PrivateCity.address);

  // Waiting for the contract to be fully deployed (mined)
  await PrivateCity.deployed();

  // Logging that the contract has been deployed
  console.log("PrivateCity contract has been deployed");
}

// Running the main function and handling potential errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
