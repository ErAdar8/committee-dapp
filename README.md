# Committee DApp

A decentralized committee management dApp implementing real-world, DAO-style governance on Ethereum.

This project models a **building committee / homeowner association** as an on-chain system, where members collectively manage shared funds, approve expenses, and execute payments transparently — without relying on centralized trust.

---

## 🧠 The Problem

Traditional committee or HOA management is typically based on trust in a single manager or small group.

Common issues include:
- Centralized control over shared funds
- Limited transparency around expenses
- Slow, opaque approval processes
- No verifiable audit trail

In practice, participants must trust that funds are handled fairly.

---

## 💡 The Solution

This dApp replaces trust with **on-chain governance**.

- Funds are held directly by a smart contract
- Spending requests are proposed on-chain
- Only approved committee members can vote
- Payments are executed automatically after majority approval
- Every action is publicly verifiable on Ethereum

---

## 🏗 System Architecture

### Smart Contracts (Solidity + Hardhat)
- **CommitteeFactory** — deploys new committees
- **Committee** — manages members, requests, approvals, and payments
- Majority-based approval mechanism
- Safe ETH transfers with explicit balance checks

### Frontend (Next.js + Ethers.js)
- Wallet-based authentication (MetaMask)
- Dynamic routing per committee address
- UI for creating, approving, and finalizing requests
- Direct interaction with deployed smart contracts

---

## 🔐 Governance Logic

- Only the manager can create spending requests
- Only approved members can vote
- A request can be finalized only if:
  - More than 50% of members approve
  - The contract holds sufficient ETH
- ETH transfers are executed atomically on finalization

This guarantees **transparent, verifiable, and tamper-resistant governance**.

---

## 🧪 Testing & Deployment

- Unit tests written using Hardhat
- Local testing via Hardhat Network
- Designed to support deployment to Ethereum testnets (e.g. Sepolia)

---

## 🖥 Tech Stack

- Solidity
- Hardhat
- Ethers.js
- Next.js
- Tailwind CSS
- MetaMask

---

## 🚀 Getting Started

```bash
npm install
npm run dev
