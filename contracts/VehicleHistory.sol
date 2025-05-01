// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/*  ▄▀  OpenZeppelin helpers  ▀▄  */
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * VehicleHistory v2 – block-chain log of registration, transfers,
 * service events, accidents and odometer updates.
 *
 * Roles
 *  ─────────────────────────────────────
 *  DEFAULT_ADMIN_ROLE  → contract owner: can grant/revoke any role.
 *  DMV_ROLE            → may register new vehicles.
 *  SERVICE_ROLE        → may add Service records.
 *  INSURER_ROLE        → may add Accident records.
 *
 *  Current owner       → may transfer ownership & add Odometer records.
 *
 * Data model
 *  ─────────────────────────────────────
 *  mapping VIN  → Vehicle { currentOwner }
 *  mapping VIN  → Record[]  (append-only)
 *
 *  Record {
 *      RecordType     rtype
 *      uint256        timestamp
 *      address        addedBy
 *      string         payload   (IPFS hash or JSON string)
 *  }
 */

contract VehicleHistory is AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;

    /*╔═══════════════ ROLES ══════════════╗*/
    bytes32 public constant DMV_ROLE     = keccak256("DMV_ROLE");
    bytes32 public constant SERVICE_ROLE = keccak256("SERVICE_ROLE");
    bytes32 public constant INSURER_ROLE = keccak256("INSURER_ROLE");

    /*╔══════════ DATA STRUCTURES ═════════╗*/
    enum RecordType { Registration, OwnershipTransfer, Service, Accident, Odometer }

    struct Record {
        RecordType rtype;
        uint256    timestamp;
        address    addedBy;
        string     payload;     // IPFS CID / JSON / free text
    }

    struct Vehicle {
        address currentOwner;
        bool    exists;
    }

    /*╔═════════════ STORAGE ══════════════╗*/
    mapping(string => Vehicle)             private vehicles;   // VIN -> Vehicle
    mapping(string => Record[])            private histories;  // VIN -> record array
    EnumerableSet.AddressSet               private authorised; // convenience set

    /*╔══════════════ EVENTS ═════════════╗*/
    event VehicleRegistered(string indexed vin, address indexed owner);
    event OwnershipTransferred(string indexed vin, address indexed from, address indexed to);
    event HistoryRecordAdded(string indexed vin, RecordType indexed rtype, address indexed by, string payload);

    /*╔═════════════ CONSTRUCTOR ═════════╗*/
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // by default the deployer is also the DMV so tests “just work”
        _grantRole(DMV_ROLE, msg.sender);
    }

    /*╔═══════════  VIEW HELPERS  ════════╗*/
    function getCurrentOwner(string calldata vin) external view returns (address) {
        require(vehicles[vin].exists, "VIN not registered");
        return vehicles[vin].currentOwner;
    }

    function historyLength(string calldata vin) external view returns (uint256) {
        return histories[vin].length;
    }

    function getRecord(string calldata vin, uint256 index)
        external view
        returns (RecordType rtype, uint256 ts, address by, string memory payload)
    {
        Record storage r = histories[vin][index];
        return (r.rtype, r.timestamp, r.addedBy, r.payload);
    }

    /*╔════════ VEHICLE LIFECYCLE  ═══════╗*/

    /// DMV registers brand-new vehicle with its first owner
    function registerVehicle(string calldata vin, address firstOwner, string calldata metaHash)
        external onlyRole(DMV_ROLE)
    {
        require(!vehicles[vin].exists, "VIN already registered");
        require(firstOwner != address(0), "Zero owner");
        vehicles[vin] = Vehicle(firstOwner, true);

        _pushRecord(vin, RecordType.Registration, metaHash);

        emit VehicleRegistered(vin, firstOwner);
    }

    /// Current owner transfers vehicle to a new owner
    function transferOwnership(string calldata vin, address newOwner, string calldata transferDocHash) external {
        Vehicle storage v = vehicles[vin];
        require(v.exists,                 "VIN not registered");
        require(msg.sender == v.currentOwner, "Only current owner");
        require(newOwner != address(0),   "Zero new owner");
        require(newOwner != v.currentOwner,   "Already owner");

        address oldOwner = v.currentOwner;
        v.currentOwner   = newOwner;

        _pushRecord(vin, RecordType.OwnershipTransfer, transferDocHash);
        emit OwnershipTransferred(vin, oldOwner, newOwner);
    }

    /*╔════════ HISTORY WRITERS ══════════╗*/

    /// Service centre adds maintenance or inspection details
    function addServiceRecord(string calldata vin, string calldata cid)
        external onlyRole(SERVICE_ROLE) vehicleExists(vin)
    {
        _pushRecord(vin, RecordType.Service, cid);
    }

    /// Insurer or authorised adjuster logs an accident
    function addAccidentRecord(string calldata vin, string calldata cid)
        external onlyRole(INSURER_ROLE) vehicleExists(vin)
    {
        _pushRecord(vin, RecordType.Accident, cid);
    }

    /// Current owner logs mileage/odometer snapshot
    function addOdometerRecord(string calldata vin, string calldata cid)
        external vehicleExists(vin)
    {
        require(msg.sender == vehicles[vin].currentOwner, "Only owner");
        _pushRecord(vin, RecordType.Odometer, cid);
    }

    /*╔════════ INTERNAL UTILITIES ═══════╗*/

    modifier vehicleExists(string calldata vin) {
        require(vehicles[vin].exists, "VIN not registered");
        _;
    }

    function _pushRecord(string calldata vin, RecordType kind, string calldata payload) internal {
        histories[vin].push(
            Record({ rtype: kind, timestamp: block.timestamp, addedBy: msg.sender, payload: payload })
        );
        emit HistoryRecordAdded(vin, kind, msg.sender, payload);
    }
}
