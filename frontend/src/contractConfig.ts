export const NETWORK = "testnet";

export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

export const RPC_URL = "https://soroban-testnet.stellar.org";

export const CONTRACT_ID =
  "CB67IGMBGF6BEWRS5CZKIVXH7DQC4CYQLH5SRLZMLTMCYK3EOYW2UUAS";

export const EXPLORER_CONTRACT_URL = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;

export const explorerTxUrl = (hash: string) =>
  `https://stellar.expert/explorer/testnet/tx/${hash}`;