# Solidity API

## ParticipantProfiles

### Profile

```solidity
struct Profile {
  string uri;
  uint64 updatedAt;
  bool exists;
}
```

### ProfileUpdated

```solidity
event ProfileUpdated(address participant, string uri, uint64 updatedAt)
```

### getProfile

```solidity
function getProfile(address participant) external view returns (string uri, uint64 updatedAt, bool exists)
```

### setMyProfile

```solidity
function setMyProfile(string uri) external
```

