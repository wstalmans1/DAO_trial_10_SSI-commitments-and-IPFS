import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ThemeToggle } from './components/ThemeToggle'

export default function App() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">DAO dApp</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ConnectButton />
        </div>
      </header>
      <main>
        {/* Your app content goes here */}
      </main>
    </div>
  )
}
