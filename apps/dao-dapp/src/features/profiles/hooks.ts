import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import {
  participantProfilesAbi,
  participantProfilesAddress
} from '../../contracts/participantProfiles'

export function useParticipantProfile(address?: `0x${string}`) {
  const { address: connected } = useAccount()
  const target = address ?? connected

  const { data, isLoading, isError, refetch } = useReadContract({
    abi: participantProfilesAbi,
    address: participantProfilesAddress,
    functionName: 'getProfile',
    args: target ? [target] : undefined,
    query: { enabled: !!target }
  })

  let profileUri: string | undefined
  let updatedAt: number | undefined
  let exists = false

  if (data) {
    const [uri, ts, ex] = data as [string, bigint, boolean]
    profileUri = uri
    updatedAt = Number(ts)
    exists = ex
  }

  return { profileUri, updatedAt, exists, isLoading, isError, refetch }
}

export function useSetMyProfile() {
  const { writeContractAsync, isPending } = useWriteContract()

  async function setMyProfile(uri: string) {
    return writeContractAsync({
      abi: participantProfilesAbi,
      address: participantProfilesAddress,
      functionName: 'setMyProfile',
      args: [uri]
    })
  }

  return { setMyProfile, isPending }
}
