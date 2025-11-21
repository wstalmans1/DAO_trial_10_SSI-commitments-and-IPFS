// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ParticipantProfiles {
    struct Profile {
        string uri; // e.g. "ipfs://QmProfileCid..."
        uint64 updatedAt; // block.timestamp
        bool exists; // distinguish never-set from empty string
    }

    mapping(address => Profile) private _profiles;

    event ProfileUpdated(address indexed participant, string uri, uint64 updatedAt);

    function getProfile(address participant)
        external
        view
        returns (string memory uri, uint64 updatedAt, bool exists)
    {
        Profile memory p = _profiles[participant];
        return (p.uri, p.updatedAt, p.exists);
    }

    function setMyProfile(string calldata uri) external {
        uint64 ts = uint64(block.timestamp);

        _profiles[msg.sender] = Profile({ uri: uri, updatedAt: ts, exists: true });

        emit ProfileUpdated(msg.sender, uri, ts);
    }
}
