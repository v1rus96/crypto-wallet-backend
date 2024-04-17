const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
require('dotenv').config();
const { ethers, JsonRpcProvider } = require("ethers");

const app = express();
const port = 8080;

// Initialize ethers provider
const provider = new JsonRpcProvider("https://sepolia.drpc.org");

const USDT_CONTRACT_ADDRESS = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0";
const USDT_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint8", name: "decimals", type: "uint8" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "EIP712_REVISION",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PERMIT_TYPEHASH",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "account", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
    ],
    name: "mint",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "value", type: "uint256" }],
    name: "mint",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "nonces",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "value", type: "uint256" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      { internalType: "uint8", name: "v", type: "uint8" },
      { internalType: "bytes32", name: "r", type: "bytes32" },
      { internalType: "bytes32", name: "s", type: "bytes32" },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

app.use(bodyParser.json());

app.post("/api/wallet/create", async (req, res) => {
  try {
    // Generate a wallet with a mnemonic
    const wallet = ethers.Wallet.createRandom();

    res.send({
      status: "Success",
      data: {
        address: wallet.address,
        privateKey: wallet.privateKey,
        recoveryPhrase: wallet.mnemonic.phrase, // Mnemonic phrase for wallet recovery
      },
    });
  } catch (error) {
    res.status(500).send({
      status: "Error",
      message: "Failed to create a new wallet",
      error: error.message,
    });
  }
});

app.post("/api/wallet/import", async (req, res) => {
  const { recoveryPhrase } = req.body;

  // Basic input validation
  if (!recoveryPhrase) {
    return res.status(400).send({
      status: "Error",
      message: "A recovery phrase is required.",
    });
  }

  try {
    // Using fromPhrase to create a wallet instance from the mnemonic
    // Include the provider if you're planning to interact with the blockchain
    const walletFromMnemonic = ethers.Wallet.fromPhrase(
      recoveryPhrase /*, provider*/
    );

    res.send({
      status: "Success",
      data: {
        address: walletFromMnemonic.address,
        privateKey: walletFromMnemonic.privateKey,
        // Consider omitting the privateKey in the actual response for security
      },
    });
  } catch (error) {
    console.error("Error importing wallet:", error);
    res.status(500).send({
      status: "Error",
      message: "Failed to import wallet from the provided recovery phrase.",
      error: error.toString(),
    });
  }
});

app.post("/api/wallet/balance", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).send({
      status: "Error",
      message: "Invalid Ethereum address provided.",
    });
  }

  try {
    const usdtContract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      provider
    );
    const balance = await usdtContract.balanceOf(address);

    // Since USDT uses 6 decimals, adjust the display accordingly
    const adjustedBalance = ethers.formatUnits(balance, 6);

    res.send({
      status: "Success",
      balance: adjustedBalance,
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).send({
      status: "Error",
      message: "Failed to retrieve wallet balance",
      error: error.toString(),
    });
  }
});

app.post("/api/wallet/transactions", async (req, res) => {
  const { address } = req.body;

  if (!address) {
    return res.status(400).send({
      status: "Error",
      message: "Invalid Ethereum address provided.",
    });
  }

  const apiKey = process.env.API_KEY;
  const contractAddress = "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0"; // USDT Contract Address
  const url = `https://api-sepolia.etherscan.io/api?module=account&action=tokentx&contractaddress=${contractAddress}&address=${address}&page=1&offset=100&sort=asc&apikey=${apiKey}`;
  const url2 = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=asc&apikey=${apiKey}`;

  try {
    const response = await axios.get(url2);
    const transactions = response.data.result;

    // Filter or process transactions as needed
    const processedTransactions = transactions.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.formatUnits(tx.value, 6), // Assuming USDT has 6 decimals
      timeStamp: tx.timeStamp,
    }));

    res.send({
      status: "Success",
      transactions: processedTransactions,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).send({
      status: "Error",
      message: "Failed to retrieve transaction history",
      error: error.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
