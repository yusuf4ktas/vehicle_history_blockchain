# Vehicle History Blockchain - Local Setup Guide

## Project Structure
```
vehicle_history_blockchain/
├── contracts/             ← solidity files
├── migrations/
├── build/                 ← generated by Truffle
├── client/                ← React front-end (create-react-app)
│   └── src/
│       ├── App.js
│       ├── Landing.jsx
│       ├── Landing.css
│       ├── RolesExplainedPage.css
│       ├── RolesExplainedPage.jsx
│       ├── roles.js  ← pass adresses and private keys as a dictionary
│       ├── txHelper.js
│       └── VehicleHistory.json      ← copied here after migrations
└── ganache-db/            ← persistent chain data (created on first run)
```

## Goal
Clone the repository, set up Ganache, deploy the smart contract, and run the React front-end on your local machine.

## Prerequisites

| Tool         |   Tested Version    |   Why we need it               |
|--------------|---------------------|--------------------------------|
| Node.js      | ≥ 18 LTS (v20.19.1) | JS runtime for Truffle & React |
| Git          | any                 | Clone the repo                 |
| Truffle      | 5.12.x              | Compile/migrate the contract   |
| Ganache CLI  | 7.x                 | Local Ethereum chain           |

## Setup Instructions

### 1. Install Blockchain Tools

```bash
# Globally install Truffle & Ganache-CLI
npm install -g truffle ganache

# Verify installation
ganache --version    # should print something like v7.9.x
```

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd vehicle_history_blockchain
```

### 3. Install Dependencies

```bash
# In project root
npm install @openzeppelin/contracts

# In client directory (React app)
cd client
npm install web3
npm install react-router-dom
cd ..
```

### 4. Start Ganache with Persistent Database

```bash
# Run in project root
npx ganache --port 7545 --mnemonic "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat" --db .\.ganache-db
```

**Configuration Explained:**

| Flag            | Purpose                                         |
|-----------------|-----------------------------------------------------|
| `--port 7545`   | Matches what the React app & Truffle config expect |
| `--mnemonic …`  | Hard-codes the same 10 test accounts for every teammate |
| `--db ./ganache-db` | Folder where chain data blocks will be stored      |

*Keep this terminal window running.*

### 5. Compile & Deploy the Contract

Open a second terminal in the project root:

```bash
truffle compile
truffle migrate --reset      # Deploys to the Ganache chain running on :7545
```

On success, you'll see a contract address (e.g., `0xE7…8Ab`).

### 6. Copy Contract Artifacts to Front-end

```bash
# In project root
copy build\contracts\VehicleHistory.json client\src\VehicleHistory.json
```

### 7. Run the React Front-end

```bash
cd client
npm start
```

This will open `http://localhost:3000` in your browser.

### 8. Role Assignment (One-time Setup)

If you kept the default mnemonic, you can skip this step because `migrations/3_grant_demo_roles.js` automatically assigns:

| Role                  | Account       | When          |
|-----------------------|---------------|---------------|
| DMV (DEFAULT_ADMIN_ROLE) | `accounts[0]` | On deployment |
| First Vehicle Owner   | `accounts[1]` | First Registration |
| SERVICE_ROLE          | `accounts[2]` | Migration #3  |
| INSURER_ROLE          | `accounts[3]` | Migration #3  |

If you disabled migration #3 or changed the mnemonic, run:

```bash
truffle console
truffle(development)> const vh = await VehicleHistory.deployed()
truffle(development)> await vh.grantRole(await vh.SERVICE_ROLE(), accounts[3])
truffle(development)> await vh.grantRole(await vh.INSURER_ROLE(), accounts[0])
.exit
```

### 9. Workflow After Reboot

1. Start Ganache again (same command, same folder → chain resurrects)
2. Compile/migrate only if you changed the Solidity code
   * Skipping this keeps the existing contract & data
3. Run `npm start` inside `/client`

## Troubleshooting

### Common Errors & Fixes

| Symptom                               | Likely Cause                             | Fix                                                                 |
|---------------------------------------|------------------------------------------|---------------------------------------------------------------------|
| Contract not deployed on this network pop-up | Ganache is on a different chain ID than last time | Delete `ganache-db`, restart Ganache, run `truffle migrate --reset`, copy JSON again |
| Error: Invalid or empty address       | You left an address box empty or mistyped | Paste a valid `0x…` account from Ganache                             |
| Transaction "reverted by the EVM"     | Role or VIN pre-check failed in the contract | Check the red message text – it shows the exact `require()` reason |

## Testing Guide

### Account Roles in Ganache

Get accounts from truffle console, accounts having indexes 4 up to 9 are potential buyers 

| Index | Address Prefix | Role                                 |
|-------|----------------|--------------------------------------|
| 0     | `0x90F8bf…`    | Deployer – has DMV_ROLE + INSURER_ROLE |
| 1     | `0xFFcF8F…`    | First owner                          |
| 2     | `0x9c5cD9…`    | Service center (SERVICE_ROLE)        |
| 3     | `0xCc5cF6…`    | Insurer (INSURER_ROLE)               |
| 4     | `0x6E11BA…`    | Potential new owner after transfer   |


### Step-by-Step Testing Process

| Step | Action               | Value to Enter           | Active Sender            |
|------|----------------------|--------------------------|--------------------------|
| 1    | Select sender        | `DMV` (index 0)          |                          |
| 2    | VIN field            | `TESTVIN-901`            |                          |
| 3    | Payload / IPFS       | `ipfs://reg`             |                          |
| 4    | Owner address        | `0xFFcF8F…` (index 1)    |                          |
| 5    | Click Register (DMV) |                          | `DMV`                    |
| 6    | Click Load History   | (row 0 appears)          |                          |
| 7    | Change sender        | `Current Owner` (index 1)|                          |
| 8    | New owner address    | `0x6E11BA…` (index 4)    |                          |
| 9    | Payload              | `doc#A1`                 |                          |
| 10   | Transfer Ownership   |                          | `Current Owner`          |
| 11   | Change sender        | `Service Shop` (index 2) |                          |
| 12   | Payload              | `ipfs://service`         |                          |
| 13   | Click Add Service    |                          | `Service Shop`           |
| 14   | Change sender        | `Insurer` (index 3)      |                          |
| 15   | Payload              | `ipfs://accident`        |                          |
| 16   | Click Add Accident   |                          | `Insurer`                |
| 17   | Change sender        | `New Owner` (index 2)    |                          |
| 18   | Payload              | `km:123456`              |                          |
| 19   | Click Add Odometer   |                          | `New Owner`              |
| 20   | Click Load History   |                          |                          |

### Expected Results

After completing the testing process, you should see 5 history entries:

| #  | Type         | Sender          |
|----|--------------|-----------------|
| 0  | Registration | `DMV`           |
| 1  | Transfer     | `Current Owner` |
| 2  | Service      | `Service Shop`  |
| 3  | Accident     | `Insurer`       |
| 4  | Odometer     | `New Owner`     |

Timestamps and payloads should match what you entered during testing.
