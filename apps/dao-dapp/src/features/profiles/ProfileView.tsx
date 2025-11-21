import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useParticipantProfile } from './hooks'
import { ProfileDocument, toGatewayUri } from './utils'

interface ProfileViewProps {
  address?: `0x${string}`
}

function formatTimestamp(ts?: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleString()
}

export function ProfileView({ address }: ProfileViewProps) {
  const { address: connected } = useAccount()
  const targetAddress = useMemo(() => address ?? connected, [address, connected])

  const { profileUri, updatedAt, exists, isLoading, isError, refetch } =
    useParticipantProfile(targetAddress)

  const [profileJson, setProfileJson] = useState<ProfileDocument | null>(null)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isFetchingJson, setIsFetchingJson] = useState(false)

  useEffect(() => {
    setProfileJson(null)
    setJsonError(null)

    if (!profileUri || !exists) return
    let cancelled = false

    async function load() {
      setIsFetchingJson(true)
      try {
        const url = toGatewayUri(profileUri)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Failed to fetch profile JSON (${res.status})`)
        const json = await res.json()
        if (!json || typeof json !== 'object') {
          throw new Error('Profile JSON is not an object')
        }
        if (!cancelled) setProfileJson(json as ProfileDocument)
      } catch (err) {
        if (!cancelled) setJsonError((err as Error)?.message ?? 'Unable to load profile JSON')
      } finally {
        if (!cancelled) setIsFetchingJson(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [profileUri, exists])

  const linkEntries = useMemo(
    () => (profileJson?.links ? Object.entries(profileJson.links).filter(([, v]) => !!v) : []),
    [profileJson]
  )

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Profile for</p>
          <p className="font-semibold text-gray-900 dark:text-gray-50">
            {targetAddress ?? 'Connect wallet to view your profile'}
          </p>
        </div>
        {profileUri && exists && (
          <a
            href={toGatewayUri(profileUri)}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-300"
          >
            View JSON
          </a>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          {exists ? 'Profile set' : 'No profile on-chain'}
        </span>
        <span>Updated: {formatTimestamp(updatedAt)}</span>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-indigo-600 hover:text-indigo-400 dark:text-indigo-300"
        >
          Refresh
        </button>
      </div>

      {!targetAddress && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Connect your wallet or provide an address to see profile details.
        </p>
      )}

      {targetAddress && (
        <>
          {isLoading && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Reading on-chain profile...
            </p>
          )}
          {isError && (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400">
              Unable to read profile from the contract.
            </p>
          )}
          {!isLoading && !isError && exists && (
            <>
              {isFetchingJson && (
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  Fetching profile JSON from storage...
                </p>
              )}
              {jsonError && (
                <p className="mt-4 text-sm text-red-600 dark:text-red-400">{jsonError}</p>
              )}
              {profileJson && (
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                    {profileJson.avatarUri && (
                      <img
                        src={toGatewayUri(profileJson.avatarUri)}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-indigo-500/60"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                        {profileJson.displayName ?? 'Unnamed participant'}
                      </h3>
                      {profileJson.bio && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          {profileJson.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {linkEntries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Links
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {linkEntries.map(([key, value]) => (
                          <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-200"
                          >
                            {key}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {profileJson.dao && (profileJson.dao.roles?.length || profileJson.dao.joinedAt) && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        DAO
                      </h4>
                      <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                        {profileJson.dao.roles?.length ? (
                          <p>
                            Roles:{' '}
                            <span className="font-medium">{profileJson.dao.roles.join(', ')}</span>
                          </p>
                        ) : null}
                        {profileJson.dao.joinedAt ? (
                          <p>Joined: {formatTimestamp(profileJson.dao.joinedAt)}</p>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {profileJson.publicCredentials && profileJson.publicCredentials.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        Public credentials
                      </h4>
                      <div className="mt-2 grid gap-3 md:grid-cols-2">
                        {profileJson.publicCredentials.map((cred, idx) => (
                          <div
                            key={`${cred.vcId ?? idx}`}
                            className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-700"
                          >
                            {cred.label && (
                              <p className="text-base font-semibold text-gray-900 dark:text-gray-50">
                                {cred.label}
                              </p>
                            )}
                            {cred.issuer && (
                              <p className="text-gray-600 dark:text-gray-300">Issuer: {cred.issuer}</p>
                            )}
                            {cred.type?.length ? (
                              <p className="text-gray-600 dark:text-gray-300">
                                Types: {cred.type.join(', ')}
                              </p>
                            ) : null}
                            {cred.vcUri && (
                              <a
                                href={toGatewayUri(cred.vcUri)}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 block text-indigo-600 underline hover:text-indigo-500 dark:text-indigo-300"
                              >
                                Credential URI
                              </a>
                            )}
                            {cred.hash && (
                              <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                                Hash: {cred.hash}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
