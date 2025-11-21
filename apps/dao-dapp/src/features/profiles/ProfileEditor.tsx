import { useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSetMyProfile } from './hooks'
import { ProfileDocument, toGatewayUri } from './utils'

interface LinkInput {
  key: string
  value: string
}

interface CredentialInput {
  label: string
  vcId: string
  vcUri: string
  hash: string
  issuer: string
  type: string
}

const emptyCredential = (): CredentialInput => ({
  label: '',
  vcId: '',
  vcUri: '',
  hash: '',
  issuer: '',
  type: ''
})

export function ProfileEditor() {
  const { address, isConnected } = useAccount()
  const { setMyProfile, isPending } = useSetMyProfile()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUri, setAvatarUri] = useState('')
  const [joinedAt, setJoinedAt] = useState('')
  const [links, setLinks] = useState<LinkInput[]>([{ key: 'website', value: '' }])
  const [roles, setRoles] = useState<string[]>(['Member'])
  const [credentials, setCredentials] = useState<CredentialInput[]>([])
  const [jsonPreview, setJsonPreview] = useState('')
  const [builderError, setBuilderError] = useState<string | null>(null)

  const [profileUriInput, setProfileUriInput] = useState('')
  const [previewedProfile, setPreviewedProfile] = useState<ProfileDocument | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const [txMessage, setTxMessage] = useState<string | null>(null)

  const filteredLinks = useMemo(
    () =>
      links
        .map(link => ({ key: link.key.trim(), value: link.value.trim() }))
        .filter(link => link.key && link.value),
    [links]
  )

  function buildProfileObject(): ProfileDocument {
    const linkObject =
      filteredLinks.length > 0
        ? filteredLinks.reduce<Record<string, string>>((acc, link) => {
            acc[link.key] = link.value
            return acc
          }, {})
        : undefined

    let parsedJoinedAt: number | undefined
    if (joinedAt.trim()) {
      const parsed = Number(joinedAt)
      if (Number.isNaN(parsed) || parsed < 0) {
        throw new Error('Joined at must be a valid UNIX timestamp')
      }
      parsedJoinedAt = parsed
    }

    const roleList = roles.map(r => r.trim()).filter(Boolean)

    const credentialList = credentials
      .map(cred => {
        const types = cred.type
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)

        const next = {
          label: cred.label.trim() || undefined,
          vcId: cred.vcId.trim() || undefined,
          vcUri: cred.vcUri.trim() || undefined,
          hash: cred.hash.trim() || undefined,
          issuer: cred.issuer.trim() || undefined,
          type: types.length ? types : undefined
        }

        const hasData =
          next.label || next.vcId || next.vcUri || next.hash || next.issuer || next.type
        return hasData ? next : null
      })
      .filter((cred): cred is NonNullable<typeof cred> => cred !== null)

    const profile: ProfileDocument = {
      version: 1,
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
      avatarUri: avatarUri.trim() || undefined,
      links: linkObject,
      dao:
        roleList.length || parsedJoinedAt
          ? {
              roles: roleList.length ? roleList : undefined,
              ...(parsedJoinedAt ? { joinedAt: parsedJoinedAt } : {})
            }
          : undefined,
      publicCredentials: credentialList.length ? credentialList : undefined
    }

    return profile
  }

  function handleGenerateJson() {
    setBuilderError(null)
    try {
      const profile = buildProfileObject()
      const pretty = JSON.stringify(profile, null, 2)
      setJsonPreview(pretty)
    } catch (err) {
      setBuilderError((err as Error).message)
    }
  }

  function downloadJson() {
    try {
      const data = jsonPreview || JSON.stringify(buildProfileObject(), null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'profile.json'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setBuilderError((err as Error).message)
    }
  }

  async function handlePreview() {
    setPreviewError(null)
    setPreviewedProfile(null)
    const uri = profileUriInput.trim()
    if (!uri) {
      setPreviewError('Paste an IPFS/Arweave URI to preview')
      return
    }

    setIsPreviewing(true)
    try {
      const gatewayUri = toGatewayUri(uri)
      const res = await fetch(gatewayUri)
      if (!res.ok) throw new Error(`Failed to fetch profile JSON (${res.status})`)
      const json = await res.json()
      if (!json || typeof json !== 'object') throw new Error('Profile JSON is not an object')
      setPreviewedProfile(json as ProfileDocument)
    } catch (err) {
      setPreviewError((err as Error).message)
    } finally {
      setIsPreviewing(false)
    }
  }

  async function handleSave() {
    setTxError(null)
    setTxMessage(null)

    const uri = profileUriInput.trim()
    if (!uri) {
      setTxError('Paste the profile URI you uploaded to IPFS/Arweave')
      return
    }

    try {
      await setMyProfile(uri)
      setTxMessage('Transaction submitted. Confirm it in your wallet and wait for confirmation.')
    } catch (err) {
      setTxError((err as Error).message)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Build your profile JSON</p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
            SSI Participant Profile
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200">
          {address ?? 'Connect wallet to save'}
        </span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
              Display name
            </label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
              placeholder="Example User"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="mt-1 min-h-[80px] w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
              placeholder="Short description."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
              Avatar URI (ipfs://...)
            </label>
            <input
              value={avatarUri}
              onChange={e => setAvatarUri(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
              placeholder="ipfs://..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Links</label>
              <button
                type="button"
                onClick={() => setLinks([...links, { key: '', value: '' }])}
                className="text-sm text-indigo-600 hover:text-indigo-400 dark:text-indigo-300"
              >
                Add link
              </button>
            </div>
            <div className="space-y-2">
              {links.map((link, idx) => (
                <div key={`${link.key}-${idx}`} className="flex gap-2">
                  <input
                    value={link.key}
                    onChange={e =>
                      setLinks(prev =>
                        prev.map((item, i) => (i === idx ? { ...item, key: e.target.value } : item))
                      )
                    }
                    placeholder="website"
                    className="w-1/3 rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                  />
                  <input
                    value={link.value}
                    onChange={e =>
                      setLinks(prev =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, value: e.target.value } : item
                        )
                      )
                    }
                    placeholder="https://example.org"
                    className="w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setLinks(prev => prev.filter((_, i) => i !== idx))}
                    className="rounded-lg border border-gray-300 px-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Remove link"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">DAO roles</label>
              <button
                type="button"
                onClick={() => setRoles([...roles, ''])}
                className="text-sm text-indigo-600 hover:text-indigo-400 dark:text-indigo-300"
              >
                Add role
              </button>
            </div>
            <div className="space-y-2">
              {roles.map((role, idx) => (
                <div key={`role-${idx}`} className="flex gap-2">
                  <input
                    value={role}
                    onChange={e =>
                      setRoles(prev => prev.map((item, i) => (i === idx ? e.target.value : item)))
                    }
                    placeholder="Member"
                    className="w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setRoles(prev => prev.filter((_, i) => i !== idx))}
                    className="rounded-lg border border-gray-300 px-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    aria-label="Remove role"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
              Joined at (UNIX timestamp, optional)
            </label>
            <input
              value={joinedAt}
              onChange={e => setJoinedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
              placeholder="1737390000"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-800 dark:text-gray-100">
                Public credentials
              </label>
              <button
                type="button"
                onClick={() => setCredentials(prev => [...prev, emptyCredential()])}
                className="text-sm text-indigo-600 hover:text-indigo-400 dark:text-indigo-300"
              >
                Add credential
              </button>
            </div>

            <div className="space-y-4">
              {credentials.map((cred, idx) => (
                <div
                  key={`cred-${idx}`}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      Credential #{idx + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCredentials(prev => prev.filter((_, i) => i !== idx))}
                      className="text-sm text-red-600 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <input
                      value={cred.label}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, label: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Certified DAO Educator"
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                    <input
                      value={cred.vcId}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, vcId: e.target.value } : item))
                        )
                      }
                      placeholder="urn:uuid:..."
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                    <input
                      value={cred.vcUri}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, vcUri: e.target.value } : item))
                        )
                      }
                      placeholder="ipfs://QmVcCid..."
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                    <input
                      value={cred.hash}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) => (i === idx ? { ...item, hash: e.target.value } : item))
                        )
                      }
                      placeholder="0x1234abcd..."
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                    <input
                      value={cred.issuer}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, issuer: e.target.value } : item
                          )
                        )
                      }
                      placeholder="did:web:example.com"
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                    <input
                      value={cred.type}
                      onChange={e =>
                        setCredentials(prev =>
                          prev.map((item, i) =>
                            i === idx ? { ...item, type: e.target.value } : item
                          )
                        )
                      }
                      placeholder="VerifiableCredential,EducationCredential"
                      className="rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {builderError && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {builderError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateJson}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
            >
              Generate JSON
            </button>
            <button
              type="button"
              onClick={downloadJson}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              Download JSON
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
              JSON preview
            </label>
            <pre className="mt-2 min-h-[320px] max-h-[480px] overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
              {jsonPreview || '// Click "Generate JSON" to preview your profile document'}
            </pre>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              2. Upload & save on-chain
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
              <li>Download the JSON and upload it to IPFS/Arweave using your preferred service.</li>
              <li>Paste the resulting URI (e.g. ipfs://Qm...) below.</li>
              <li>Preview the JSON, then save it to the blockchain with your wallet.</li>
            </ol>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                Profile URI
              </label>
              <input
                value={profileUriInput}
                onChange={e => setProfileUriInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
                placeholder="ipfs://QmProfileCid..."
              />
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePreview}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                {isPreviewing ? 'Previewing…' : 'Preview Profile JSON'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isConnected || isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {isPending ? 'Saving...' : 'Save Profile to Blockchain'}
              </button>
            </div>

            {previewError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{previewError}</p>
            )}
            {txError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{txError}</p>}
            {txMessage && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{txMessage}</p>}

            {previewedProfile && (
              <div className="mt-3 rounded-lg bg-gray-900 p-3 text-xs text-gray-100">
                <p className="mb-2 font-semibold text-gray-200">Previewed JSON</p>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(previewedProfile, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
