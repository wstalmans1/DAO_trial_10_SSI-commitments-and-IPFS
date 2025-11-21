import { useMemo, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import { ThemeToggle } from './components/ThemeToggle'
import { ProfileView } from './features/profiles/ProfileView'
import { ProfileEditor } from './features/profiles/ProfileEditor'

export default function App() {
  const { address, isConnected } = useAccount()
  const [lookupAddress, setLookupAddress] = useState('')

  const resolvedLookup = useMemo(() => {
    const trimmed = lookupAddress.trim()
    if (!trimmed) return undefined
    return /^0x[a-fA-F0-9]{40}$/.test(trimmed) ? (trimmed as `0x${string}`) : null
  }, [lookupAddress])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">DAO dApp</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </header>
      <main className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Your profile</h2>
            <ProfileView address={address} />
          </div>
          <div className="space-y-4 rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-50">
              View another participant
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Paste any wallet address to view its profile.
            </p>
            <input
              value={lookupAddress}
              onChange={e => setLookupAddress(e.target.value)}
              placeholder="0x1234..."
              className="w-full rounded-lg border border-gray-300 bg-transparent p-2 text-sm outline-none focus:border-indigo-500 dark:border-gray-700"
            />
            {resolvedLookup === null && (
              <p className="text-sm text-red-600 dark:text-red-400">Enter a valid 42-char address.</p>
            )}
            {resolvedLookup && <ProfileView address={resolvedLookup} />}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Manage your SSI participant profile</h2>
          {isConnected ? (
            <ProfileEditor />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Connect your wallet to build, preview, and save your profile on-chain.
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
