// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PermitRegistry
 * @dev Manages the registration and validation of forest product permits.
 */
contract PermitRegistry is AccessControl {
    bytes32 public constant FOREST_DEPT_ROLE = keccak256("FOREST_DEPT_ROLE");

    struct Permit {
        string permitNumber;
        address issuedTo;
        uint256 expiryTimestamp;
        bool active;
    }

    mapping(string => Permit) public permits;

    event PermitRegistered(string indexed permitNumber, address issuedTo, uint256 expiryTimestamp);
    event PermitRevoked(string indexed permitNumber);

    /**
     * @dev Constructor that grants the deployer the default admin role.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Registers a new permit.
     * @param permitNumber The unique identifier for the permit.
     * @param issuedTo The address of the entity the permit is issued to.
     * @param expiryTimestamp The timestamp when the permit expires.
     */
    function registerPermit(
        string memory permitNumber,
        address issuedTo,
        uint256 expiryTimestamp
    ) external onlyRole(FOREST_DEPT_ROLE) {
        require(bytes(permits[permitNumber].permitNumber).length == 0, "Permit already exists");

        permits[permitNumber] = Permit({
            permitNumber: permitNumber,
            issuedTo: issuedTo,
            expiryTimestamp: expiryTimestamp,
            active: true
        });

        emit PermitRegistered(permitNumber, issuedTo, expiryTimestamp);
    }

    /**
     * @dev Revokes an existing permit.
     * @param permitNumber The unique identifier for the permit.
     */
    function revokePermit(string memory permitNumber) external onlyRole(FOREST_DEPT_ROLE) {
        require(bytes(permits[permitNumber].permitNumber).length != 0, "Permit does not exist");
        require(permits[permitNumber].active, "Permit already revoked");

        permits[permitNumber].active = false;

        emit PermitRevoked(permitNumber);
    }

    /**
     * @dev Checks if a permit is currently valid.
     * @param permitNumber The unique identifier for the permit.
     * @return A boolean indicating whether the permit is valid.
     */
    function isPermitValid(string memory permitNumber) external view returns (bool) {
        Permit memory permit = permits[permitNumber];
        if (bytes(permit.permitNumber).length == 0) return false;
        if (!permit.active) return false;
        if (block.timestamp > permit.expiryTimestamp) return false;
        
        return true;
    }

    /**
     * @dev Retrieves the details of a specific permit.
     * @param permitNumber The unique identifier for the permit.
     * @return The Permit struct containing the permit details.
     */
    function getPermit(string memory permitNumber) external view returns (Permit memory) {
        require(bytes(permits[permitNumber].permitNumber).length != 0, "Permit does not exist");
        return permits[permitNumber];
    }
}
