// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ForestCustody
 * @dev Manages the tamper-proof chain of custody for forest products.
 */
contract ForestCustody is AccessControl {
    bytes32 public constant ACTOR_ROLE = keccak256("ACTOR_ROLE");
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");

    struct CustodyRecord {
        string batchId;
        string eventType;
        address actor;
        uint256 quantity;
        string permitNumber;
        string dataHash;
        uint256 timestamp;
        bool verified;
    }

    mapping(string => CustodyRecord[]) public custodyChain;

    event CustodyEventAdded(string indexed batchId, address actor, string eventType, uint256 timestamp);
    event CustodyEventVerified(string indexed batchId, uint256 index, address authority);

    /**
     * @dev Constructor that grants the deployer the default admin role.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Adds a new custody event for a given batch.
     * @param batchId The unique identifier for the batch.
     * @param eventType The type of event (e.g., "harvested", "transported").
     * @param quantity The quantity of forest products involved.
     * @param permitNumber The associated permit number.
     * @param dataHash The SHA256 hash of the off-chain metadata.
     */
    function addCustodyEvent(
        string memory batchId,
        string memory eventType,
        uint256 quantity,
        string memory permitNumber,
        string memory dataHash
    ) external onlyRole(ACTOR_ROLE) {
        CustodyRecord memory newRecord = CustodyRecord({
            batchId: batchId,
            eventType: eventType,
            actor: msg.sender,
            quantity: quantity,
            permitNumber: permitNumber,
            dataHash: dataHash,
            timestamp: block.timestamp,
            verified: false
        });

        custodyChain[batchId].push(newRecord);

        emit CustodyEventAdded(batchId, msg.sender, eventType, block.timestamp);
    }

    /**
     * @dev Verifies a specific custody event by an authority.
     * @param batchId The unique identifier for the batch.
     * @param index The index of the event in the custody chain.
     */
    function verifyCustodyEvent(string memory batchId, uint256 index) external onlyRole(AUTHORITY_ROLE) {
        require(index < custodyChain[batchId].length, "Index out of bounds");
        require(!custodyChain[batchId][index].verified, "Event already verified");

        custodyChain[batchId][index].verified = true;

        emit CustodyEventVerified(batchId, index, msg.sender);
    }

    /**
     * @dev Retrieves the entire custody chain for a given batch.
     * @param batchId The unique identifier for the batch.
     * @return An array of CustodyRecord structs representing the custody chain.
     */
    function getCustodyChain(string memory batchId) external view returns (CustodyRecord[] memory) {
        return custodyChain[batchId];
    }

    /**
     * @dev Retrieves the total number of custody events for a given batch.
     * @param batchId The unique identifier for the batch.
     * @return The number of events in the custody chain.
     */
    function getCustodyEventCount(string memory batchId) external view returns (uint256) {
        return custodyChain[batchId].length;
    }
}
