<p align="center">
  <a href="https://iex.ec/" rel="noopener" target="_blank"><img width="150" src="./logo-iexec.png" alt="iExec logo"/></a>
</p>

<h1 align="center">R3v3al Dapp</h1>

Project detail can be found at:
- https://excalidraw.com/#room=fccd6428eeae8c2777ba,rYoC6hiCpFSobiX7nPS4wA
- https://www.notion.so/r3v3al-ab1fe00c791449008e18f39a4ca956a8

## License

This project is licensed under the terms of the [Apache 2.0](/LICENSE).

Sure! Here is a sample README file that explains your application:

---

# Reward Distribution DApp

This DApp (Decentralized Application) is designed to manage and distribute rewards on the iExec platform. It securely combines two private keys to generate a unique wallet, which is then used to claim and distribute rewards based on specific coordinates.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Environment Variables](#environment-variables)
  - [Commands](#commands)
- [Functionality](#functionality)
  - [Combining Private Keys](#combining-private-keys)
  - [Reward Management](#reward-management)
- [File Structure](#file-structure)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/r3v3al-iexec/r3v3al-dapp.git
   cd dapp
   ```

2. Install the dependencies:
   ```sh
   npm ci
   ```

3. Local test
   ```sh
   ./local-test.sh
   ```

## Usage

### Environment Variables

Ensure you set the following environment variables in your `.env` file:

- `IEXEC_APP_DEVELOPER_SECRET`: Developer's secret JSON string containing the first half of the private key.
- `IEXEC_REQUESTER_SECRET_1`: Requester's secret JSON string containing the second half of the private key.
- `IEXEC_OUT`: Output directory path.

Example `.env` file:
```
IEXEC_APP_DEVELOPER_SECRET='{"MC_PVK":"0xYOUR_PRIVATE_KEY_PART_1"}'
IEXEC_REQUESTER_SECRET_1='{"PLAYER_PVK":"0xYOUR_PRIVATE_KEY_PART_2"}'
IEXEC_OUT='./output'
```

### Commands

The DApp can be executed with the following commands:

- `countReward`: Counts the number of rewards.
- `generateRewardKey`: Generates a reward key wallet address.
- `claimReward <player> <x> <y> <datasetId>`: Claims the reward if the specified coordinates match any reward coordinates.

Example:
```sh
node app.js generateRewardKey
```

## Functionality

### Combining Private Keys

The application combines two halves of a private key provided via environment variables. It then uses the combined key to generate a new Ethereum wallet:

1. Convert each half of the private key to a BigInt.
2. Add the two BigInt values together.
3. Ensure the combined private key has an even length.
4. Calculate the Keccak-256 hash of the combined key to generate a valid Ethereum private key.

### Reward Management

The DApp reads reward data from a JSON file (`protectedDataTest.json`) and performs various operations based on the provided command:

1. **Count Rewards**: Outputs the total number of rewards.
2. **Generate Reward Key**: Generates and outputs the reward key wallet address.
3. **Claim Reward**: Checks if the provided coordinates match any reward coordinates and, if found, triggers a transaction to distribute the reward.

## File Structure

- `app.js`: Main application script.
- `validateInputs.js`: Validates environment variables.
- `protectedDataTest.json`: Contains sample reward data for testing.
- `.env`: Environment variables file.

## Example JSON Data (`protectedDataTest.json`)

```json
{
  "rewardCount": 2,
  "rewards": [
    {
      "x": 135,
      "y": 807,
      "reward": 3.48,
      "boosted": false
    },
    {
      "x": 125,
      "y": 817,
      "reward": 3.36,
      "boosted": false
    }
  ]
}
```

## Notes

- Ensure you have the necessary dependencies installed and environment variables correctly set before running the DApp.
- The current implementation mocks the developer and requester secrets for testing purposes. Make sure to replace these with actual values in a production environment.

---

Replace any placeholder text with actual values specific to your repository and application. This README provides a comprehensive guide to your DApp, explaining its purpose, setup, and usage.