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
import { assert, expect } from "chai";
import { Contract } from "ethers";

// Start testing the PrivateCity contract
describe("PrivateCity contract", function () {
  let PrivateCity: Contract;

  // Before each test, we deploy our contract
  beforeEach(async function () {
    const PrivateCityFactory = await ethers.getContractFactory("PrivateCity");
    PrivateCity = await PrivateCityFactory.deploy();
    await PrivateCity.deployed();
  });

  // Test suite for citizenship management
  describe("Citizenship management", function () {

    // Test case for adding a new citizen
    it("Should add a new citizen", async function () {
      await PrivateCity.addCitizen("Alice", ethers.Wallet.createRandom().address);
      const citizen = await PrivateCity.citizens(ethers.Wallet.createRandom().address);
      assert(citizen.name === "Alice");
    });

    // Test case for removing a citizen
    it("Should remove a citizen", async function () {
      const address = ethers.Wallet.createRandom().address;
      await PrivateCity.addCitizen("Alice", address);
      await PrivateCity.removeCitizen(address);
      const citizen = await PrivateCity.citizens(address);
      assert(citizen.name === "");
    });
  });

  // Test suite for property management
  describe("Property management", function () {
    const ownerAddress = ethers.Wallet.createRandom().address;
    const propertyID = "property1";
    const propertyDetails = "A nice house";

    // Before each property management test, we add a citizen
    beforeEach(async function () {
      await PrivateCity.addCitizen("Alice", ownerAddress);
    });

    // Test case for adding a new property
    it("Should add a new property", async function () {
      await PrivateCity.addProperty(propertyID, propertyDetails, ownerAddress, 5);
      const property = await PrivateCity.properties(propertyID);
      assert(property.propertyDetails === propertyDetails);
    });

    // Test case for removing a property
    it("Should remove a property", async function () {
      await PrivateCity.addProperty(propertyID, propertyDetails, ownerAddress, 5);
      await PrivateCity.removeProperty(propertyID);
      const property = await PrivateCity.properties(propertyID);
      assert(property.propertyDetails === "");
    });

    // Test case for transferring a property
    it("Should transfer a property", async function () {
      const newOwnerAddress = ethers.Wallet.createRandom().address;
      await PrivateCity.addCitizen("Bob", newOwnerAddress);
      await PrivateCity.addProperty(propertyID, propertyDetails, ownerAddress, 5);
      await PrivateCity.transferProperty(propertyID, newOwnerAddress);
      const property = await PrivateCity.properties(propertyID);
      assert(property.ownerAddress === newOwnerAddress);
    });
  });

  // Test suite for financial system
  describe("Financial system", function () {
    const citizenAddress = ethers.Wallet.createRandom().address;
    const depositAmount = ethers.utils.parseEther("1");

    // Before each financial system test, we add a citizen
    beforeEach(async function () {
      await PrivateCity.addCitizen("Alice", citizenAddress);
    });

    // Test case for depositing Ether
    it("Should deposit Ether", async function () {
      await PrivateCity.connect(citizenAddress).deposit({ value: depositAmount });
      const citizen = await PrivateCity.citizens(citizenAddress);
      assert(citizen.balance.eq(depositAmount));
    });

    // Test case for withdrawing Ether
    it("Should withdraw Ether", async function () {
      await PrivateCity.connect(citizenAddress).deposit({ value: depositAmount });
      await PrivateCity.connect(citizenAddress).withdraw(depositAmount);
      const citizen = await PrivateCity.citizens(citizenAddress);
      assert(citizen.balance.isZero());
    });

    // Test case for paying taxes
    it("Should pay taxes", async function () {
      const propertyID = "property1";
      const propertyDetails = "A nice house";
      const taxRate = 10; // 10%

      await PrivateCity.addProperty(propertyID, propertyDetails, citizenAddress, taxRate);
      await PrivateCity.connect(citizenAddress).deposit({ value: ethers.utils.parseEther("10") }); // Enough to pay the tax

      await PrivateCity.connect(citizenAddress).payTaxes();

      const citizen = await PrivateCity.citizens(citizenAddress);
      assert(citizen.balance.eq(ethers.utils.parseEther("9"))); // The balance should decrease by the tax amount

      const treasury = await PrivateCity.treasury();
      assert(treasury.eq(ethers.utils.parseEther("1"))); // The treasury should increase by the tax amount
    });
  });
});
