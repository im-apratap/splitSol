# SplitSOL

SplitSOL is a premium Web3 bill-splitting application built securely on the Solana blockchain. Designed with a modern, clean aesthetic, SplitSOL simplifies the process of sharing expenses with friends, family, or colleagues through transparent on-chain settlements.

![SplitSOL Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)
![Backend](https://img.shields.io/badge/Backend-Bun%20%7C%20Express-black)
![Blockchain](https://img.shields.io/badge/Blockchain-Solana%20Devnet-purple)

## 🌟 Key Features

### Mobile Application (Frontend)

- **Modern Aesthetic:** A beautifully crafted, light-themed premium UI emphasizing highly rounded cards, pill buttons, and soft drop-shadows.
- **Seamless Authentication:** Secure JWT-based login and registration flow.
- **Group & Expense Management:** Intuitive dashboard to create groups, dynamically add members via their usernames, track balances, and add new expenses (Equal, Percentage, Custom splits) manually or automatically via **Gemini Vision AI Receipt Scanning**.
- **On-Chain Settlements:** Integrated checkout to calculate owed amounts and intuitively sign/send Lamports via the Solana blockchain.

### API Server (Backend)

- **High-Performance Runtime:** Powered by Bun and Express for incredibly fast iterations and low latency.
- **Robust Security:** JWT implementation and secure password hashing.
- **NoSQL Database:** MongoDB integration for flexible group, user, and expense schema management.
- **Smart Querying:** Optimized data fetching for real-time balance calculations and settlement tracking.

## 🚀 Getting Started

### Prerequisites

To run this full-stack application locally, you will need:

- [Bun](https://bun.sh/) (Primary package manager and runtime)
- [Expo CLI](https://expo.dev/) installed globally or via npx
- A running MongoDB instance (Local or Atlas)

### Installation & Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/im-apratap/splitSol/
   cd splitSOL
   ```

2. **Start the Backend**
   Navigate to the `server/` directory, install dependencies, and start the development server.

   ```bash
   cd server
   bun install
   bun start
   ```

3. **Start the Mobile App**
   Open a new terminal, navigate to the `mobile/` directory, install dependencies, and start Expo.

   ```bash
   cd mobile
   bun install
   bun start
   ```

   _Use the Expo Go app on your physical device or run it on an iOS Simulator / Android Emulator._

   > [!TIP]
   > **Smart Local Networking:** The mobile app automatically routes to your local backend server! It uses `localhost` for iOS Simulators and automatically maps to `10.0.2.2` for Android Emulators out of the box.
   >
   > **Using a Physical Device?** Expo Go on a real phone cannot access your computer's `localhost`. Create an `.env` file in the `mobile/` directory and set `EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_WIFI_IP>:8000/api`.

## 🏗 System Architecture

_This repository is structured as a monorepo containing both the backend service and the mobile client._

- **`/server`**: The Bun/Express API that acts as the source of truth for all users, groups, and expenses.
- **`/mobile`**: The Expo React Native application offering a premium interface to interact with the API and the Solana blockchain.
