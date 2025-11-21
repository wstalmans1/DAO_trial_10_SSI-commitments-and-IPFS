# Project Description: DAO Trial 10 - SSI Commitments and IPFS

## Project Overview
This is a decentralized application (dApp) project focused on DAO functionality with Self-Sovereign Identity (SSI) commitments and IPFS integration. The project is structured as a monorepo using pnpm workspaces, containing both a frontend React application and smart contracts workspace.

**Repository**: https://github.com/wstalmans1/DAO_trial_10_SSI-commitments-and-IPFS.git

## Tech Stack

### Frontend (`apps/dao-dapp/`)
- **Framework**: Vite + React 18 + TypeScript
- **Web3 Integration**: 
  - RainbowKit v2 (~2.2.9) for wallet connection UI
  - wagmi v2 (~2.16.9) for Ethereum interactions
  - viem (~2.37.13) as the Ethereum library
- **Styling**: Tailwind CSS v4 (~4.0.17) with PostCSS
- **State Management**: TanStack Query v5 (~5.90.10) for server state
- **Development**: ESLint, TypeScript, React Hooks

### Smart Contracts (`packages/contracts/`)
- **Framework**: Hardhat v2 (^2.27.0) with ethers v6
- **Testing**: Foundry (Forge/Anvil) for additional testing
- **Libraries**: OpenZeppelin Contracts (^5.4.0) and Upgradeable Contracts
- **Tools**: 
  - TypeChain for TypeScript bindings
  - hardhat-deploy for deployment management
  - Solhint + Prettier for code quality
  - solidity-docgen for NatSpec documentation
  - gas-reporter and contract-sizer for optimization

### Development Environment
- **Package Manager**: pnpm v10.16.1 (workspace-based monorepo)
- **Node Version**: >=22 <23 (specified in .nvmrc)
- **Git Hooks**: Husky + lint-staged for pre-commit checks
- **CI/CD**: GitHub Actions workflow configured

## Current Implementation Status

### ✅ Completed Features

1. **Project Setup**
   - Monorepo structure with pnpm workspaces
   - Complete development environment configuration
   - CI/CD pipeline setup

2. **Frontend Foundation**
   - Basic React app structure with Vite
   - RainbowKit wallet connection integration
   - Wagmi configuration for multiple chains (mainnet, polygon, optimism, arbitrum, sepolia)
   - TanStack Query setup for data fetching

3. **Dark Theme Implementation**
   - Custom ThemeContext with React Context API
   - Theme persistence in localStorage
   - System preference detection
   - ThemeToggle component with sun/moon icons
   - Tailwind v4 dark mode configuration
   - RainbowKit theme integration (dark/light themes)
   - Smooth transitions between themes
   - FOUC (Flash of Unstyled Content) prevention

4. **Smart Contracts Infrastructure**
   - Hardhat configuration with multiple networks
   - Foundry setup for additional testing
   - Deployment scripts structure
   - Verification scripts (Etherscan, Blockscout, standard JSON)
   - Upgradeable contract support
   - NatSpec documentation tooling

### 📁 Project Structure

```
DAO_trial_10_SSI-commitments-and-IPFS/
├── apps/
│   └── dao-dapp/                    # Frontend React application
│       ├── src/
│       │   ├── components/
│       │   │   └── ThemeToggle.tsx  # Dark/light theme toggle button
│       │   ├── contexts/
│       │   │   └── ThemeContext.tsx # Theme state management
│       │   ├── config/
│       │   │   └── wagmi.ts         # Wagmi/RainbowKit configuration
│       │   ├── contracts/           # Generated contract ABIs (empty, ready for artifacts)
│       │   ├── App.tsx              # Main app component
│       │   ├── main.tsx             # App entry point with providers
│       │   └── index.css            # Tailwind imports + dark mode CSS variables
│       └── index.html               # HTML with theme initialization script
│
├── packages/
│   └── contracts/                   # Smart contracts workspace
│       ├── contracts/               # Solidity contracts (currently empty)
│       ├── deploy/                  # Hardhat-deploy scripts (empty)
│       ├── scripts/                 # Utility scripts (deploy, verify, upgrade, debug)
│       ├── test/                    # Hardhat tests (empty)
│       ├── forge-test/              # Foundry tests (Sample.t.sol example)
│       └── hardhat.config.ts        # Hardhat configuration
│
├── .github/workflows/ci.yml         # GitHub Actions CI pipeline
├── setup.sh                         # Bootstrap script for initial setup
└── README.md                        # Project documentation
```

### 🔧 Key Configuration Files

- **Root `package.json`**: Workspace scripts for frontend/contracts operations
- **`pnpm-workspace.yaml`**: Defines workspace packages
- **`.gitignore`**: Excludes node_modules, artifacts, env files
- **`.prettierrc.json`**: Code formatting rules (including Solidity)
- **`.solhint.json`**: Solidity linting rules with NatSpec enforcement
- **`foundry.toml`**: Foundry configuration for testing

### 🎨 Frontend Components

**ThemeContext** (`src/contexts/ThemeContext.tsx`):
- Manages theme state (light/dark)
- Persists to localStorage
- Listens to system preference changes
- Provides `useTheme()` hook

**ThemeToggle** (`src/components/ThemeToggle.tsx`):
- Button component with sun/moon icons
- Toggles between light and dark themes
- Styled with Tailwind classes

**App.tsx**:
- Basic layout with header
- Includes ThemeToggle and ConnectButton
- Dark mode classes applied throughout

### 🔗 Smart Contracts Setup

**Hardhat Configuration**:
- Solidity 0.8.28 with optimizer (200 runs)
- Multiple network support (hardhat, sepolia, mainnet, polygon, optimism, arbitrum)
- TypeChain integration for TypeScript bindings
- Artifacts output to `apps/dao-dapp/src/contracts/` for frontend access
- Auto-documentation generation (can be disabled with `DOCS_AUTOGEN=false`)

**Deployment Scripts Available**:
- `deploy.ts`: Basic deployment template
- `deploy-upgradeable.ts`: Upgradeable proxy deployment
- `upgrade-contract.ts`: Proxy upgrade utility
- `verify-multi.ts`: Multi-explorer verification
- `verify-stdjson.ts`: Standard JSON verification
- `verify-upgradeable.ts`: Upgradeable contract verification
- `debug-deployment.ts`: Address inspection utility

## What's Ready to Build On

### Frontend
- ✅ Complete wallet connection infrastructure
- ✅ Dark theme system ready for extension
- ✅ TypeScript setup with proper types
- ✅ Contract artifacts directory ready (ABIs will auto-populate after contract compilation)
- ✅ Responsive design foundation with Tailwind

### Smart Contracts
- ✅ Full Hardhat development environment
- ✅ OpenZeppelin contracts available
- ✅ Deployment and verification tooling
- ✅ Testing infrastructure (Hardhat + Foundry)
- ✅ Documentation generation ready
- ⚠️ No contracts implemented yet (ExampleToken was removed)

### Development Workflow
- ✅ Pre-commit hooks (Husky + lint-staged)
- ✅ Code formatting (Prettier)
- ✅ Linting (ESLint for TS/JS, Solhint for Solidity)
- ✅ CI/CD pipeline configured
- ✅ Local blockchain (Anvil) ready

## Next Steps / What Needs to Be Built

1. **Smart Contracts**: 
   - DAO governance contracts
   - SSI commitment handling contracts
   - IPFS integration contracts
   - Any token or voting mechanisms

2. **Frontend Features**:
   - DAO dashboard UI
   - SSI commitment interface
   - IPFS file upload/retrieval
   - Governance voting interface
   - Member management

3. **Integration**:
   - Connect frontend to deployed contracts
   - Implement contract interactions via wagmi hooks
   - IPFS client integration (likely Pinata, Infura, or Web3.Storage)

## Environment Variables Needed

**Frontend** (`apps/dao-dapp/.env.local`):
- `VITE_WALLETCONNECT_ID`: WalletConnect project ID
- `VITE_MAINNET_RPC`: Mainnet RPC URL
- `VITE_POLYGON_RPC`: Polygon RPC URL
- `VITE_OPTIMISM_RPC`: Optimism RPC URL
- `VITE_ARBITRUM_RPC`: Arbitrum RPC URL
- `VITE_SEPOLIA_RPC`: Sepolia RPC URL

**Contracts** (`packages/contracts/.env.hardhat.local`):
- `PRIVATE_KEY` or `MNEMONIC`: Deployment account
- `SEPOLIA_RPC`, `MAINNET_RPC`, etc.: Network RPC URLs
- `ETHERSCAN_API_KEY`: For contract verification
- `CMC_API_KEY`: Optional, for gas reporting

## Common Commands

```bash
# Frontend development
pnpm web:dev

# Compile contracts
pnpm contracts:compile

# Deploy contracts
pnpm contracts:deploy

# Run tests
pnpm contracts:test
pnpm forge:test

# Start local chain
pnpm anvil:start
```

## Notes for ChatGPT

- This is a fresh project with clean git history (single initial commit)
- All example/template code has been removed (ExampleToken)
- The project is ready for DAO, SSI commitments, and IPFS features to be built
- Dark theme is fully functional and can be extended
- Contract artifacts will automatically appear in `apps/dao-dapp/src/contracts/` after compilation
- The project uses modern tooling (Hardhat v2, wagmi v2, Tailwind v4)
- TypeScript is used throughout for type safety

