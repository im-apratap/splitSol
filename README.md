# SplitSOL

SplitSOL is a web3 bill-splitting application built securely on the Solana blockchain. It aims to simplify the process of sharing expenses with friends, family, or colleagues with transparent on-chain settlements.

## Features (Backend)

- Secure User Authentication (JWT)
- Group Creation & Member Management
- Expense Tracking & Splitting (Equal, Percentage, Custom)
- Settlements recorded implicitly via Solana Blockchain Transactions (Devnet)

## Mobile App Overview (Current Implementation Stage)

The mobile app is currently under construction and is being built with **Expo Router** and React Native.

**Currently Completed Mobile App Foundation:**

1. **Modern Aesthetic / UI Setup:** Theming established with a sleek dark mode (`#0f111a`, `#1c1f2e`) layered with Solana's brand colors (Purple `#9945FF` and Green `#14F195`).
2. **Reusable UI Library:** Constructed premium core components including `Button`, `Input`, `Card`, and `Container`, aimed to provide a "glassmorphism" inspired web3 appeal.
3. **API Client:** Setup configured Axios instance with automatic JWT header injection handling through React Native's `AsyncStorage`. Dynamically points to localhost (for iOS/Android simulators).

## Upcoming Development (Mobile App)

- **Authentication Screens:** Register and Login screens to interact with the existing backend.
- **Dashboard (/tabs):** The main entry displaying current groups and overall SOL balances.
- **Group Management:** Creating groups, adding friends via public key or username, and listing past expenses.
- **Settlement & Checkout:** Interactive screens calculating owed amounts, ultimately signing and sending Lamports directly through standard Solana wallet interactions.

## Prerequisites to Run

- `Node.js` v18+
- `Bun` (preferred package manager)
- `Expo CLI`
- MongoDB instances running (for backend)

---

_This repository contains both a `server/` (Node/Express) and an Expo `mobile/` client application._
