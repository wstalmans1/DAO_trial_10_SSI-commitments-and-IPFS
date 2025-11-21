import deployment from './deployments/sepolia/ParticipantProfiles.json'

export const participantProfilesAbi = deployment.abi as const
export const participantProfilesAddress = deployment.address as `0x${string}`
