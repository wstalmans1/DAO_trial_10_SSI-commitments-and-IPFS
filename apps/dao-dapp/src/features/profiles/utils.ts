export interface ProfileCredential {
  label?: string
  vcId?: string
  vcUri?: string
  hash?: string
  issuer?: string
  type?: string[]
}

export interface ProfileDaoInfo {
  roles?: string[]
  joinedAt?: number
}

export interface ProfileDocument {
  version?: number
  displayName?: string
  bio?: string
  avatarUri?: string
  links?: Record<string, string>
  dao?: ProfileDaoInfo
  publicCredentials?: ProfileCredential[]
}

export function toGatewayUri(uri: string) {
  if (uri.startsWith('ipfs://')) {
    const path = uri.replace('ipfs://', '').replace(/^ipfs\//, '')
    return `https://ipfs.io/ipfs/${path}`
  }

  return uri
}
