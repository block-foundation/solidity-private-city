// SPDX-License-Identifier: Apache-2.0


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


pragma solidity ^0.8.19;


// ============================================================================
// Contracts
// ============================================================================

/**
 * Private City Contract
 * @dev 
 */
contract PrivateCity {

    // Parameters
    // ========================================================================

    // Owner of the contract, the city mayor
    address public mayor;

    // City treasury
    uint public treasury;

    // Structs
    // ========================================================================

    // Define the struct for a Citizen
    struct Citizen {
        string name;
        address payable citizenAddress;
        uint propertyCount;
        uint balance;
    }

    // Define the struct for a Property
    struct Property {
        string propertyID;
        address ownerAddress;
        string propertyDetails;
        uint taxRate; // Tax rate as percentage
    }


    // Constructor
    // ========================================================================

    // Set the mayor to the contract deployer
    constructor() {
        mayor = msg.sender;
    }

    // Mappings
    // ========================================================================

    // Map of all citizens in the city
    mapping(address => Citizen) public citizens;

    // Map of all properties in the city
    mapping(string => Property) public properties;


    // Events
    // ========================================================================

    event CitizenAdded(address citizenAddress, string name);
    event CitizenRemoved(address citizenAddress);
    event PropertyAdded(string propertyID, address ownerAddress);
    event PropertyRemoved(string propertyID);
    event PropertyTransferred(string propertyID, address fromAddress, address toAddress);
    event Deposited(address fromAddress, uint amount);
    event Withdrawn(address toAddress, uint amount);
    event TaxesPaid(address fromAddress, uint totalTax);


    // Modifiers
    // ========================================================================

    // Modifier to require that the caller is the mayor
    modifier onlyMayor {
        require(msg.sender == mayor, "Only the mayor can perform this action");
        _;
    }


    // Methods
    // ========================================================================

    // Function for citizens to deposit Ether into their city account
    function deposit() public payable {
        // Add the deposited amount to the citizen's balance
        citizens[msg.sender].balance += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    // Function for citizens to withdraw Ether from their city account
    function withdraw(uint amount) public {
        require(citizens[msg.sender].balance >= amount, "Insufficient balance");
        // Subtract the amount from the citizen's balance
        citizens[msg.sender].balance -= amount;
        // Transfer the amount to the citizen
        citizens[msg.sender].citizenAddress.transfer(amount);
        emit Withdrawn(msg.sender, amount);
    }

    function addCitizen(string memory name, address payable citizenAddress) public onlyMayor {
        citizens[citizenAddress] = Citizen(name, citizenAddress, 0, 0);
        emit CitizenAdded(citizenAddress, name);
    }

    function removeCitizen(address citizenAddress) public onlyMayor {
        delete citizens[citizenAddress];
        emit CitizenRemoved(citizenAddress);
    }

    function addProperty(string memory propertyID, string memory propertyDetails, address ownerAddress, uint taxRate) public onlyMayor {
        properties[propertyID] = Property(propertyID, ownerAddress, propertyDetails, taxRate);
        citizens[ownerAddress].propertyCount += 1;
        emit PropertyAdded(propertyID, ownerAddress);
    }

    function removeProperty(string memory propertyID) public onlyMayor {
        address ownerAddress = properties[propertyID].ownerAddress;
        citizens[ownerAddress].propertyCount -= 1;
        delete properties[propertyID];
        emit PropertyRemoved(propertyID);
    }

    function transferProperty(string memory propertyID, address toAddress) public onlyMayor {
        address fromAddress = properties[propertyID].ownerAddress;
        citizens[fromAddress].propertyCount -= 1;
        properties[propertyID].ownerAddress = toAddress;
        citizens[toAddress].propertyCount += 1;
        emit PropertyTransferred(propertyID, fromAddress, toAddress);
    }

    function payTaxes() public {
        // Calculate the total tax for the citizen
        uint totalTax = 0;
        for (string memory propertyID in properties) {
            if (properties[propertyID].ownerAddress == msg.sender) {
                totalTax += properties[propertyID].taxRate;
            }
        }

        require(citizens[msg.sender].balance >= totalTax, "Insufficient balance for tax payment");
        
        // Subtract the tax from the citizen's balance
        citizens[msg.sender].balance -= totalTax;
        // Add the tax to the city's treasury
        treasury += totalTax;

        emit TaxesPaid(msg.sender, totalTax);
    }

}
