export const CONTRACT_CONFIG = {
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  explorerBaseUrl: "https://stellar.expert/explorer/testnet",
  contractId: "CCNXI62IYT6H2CWOWAOH2DQJ3DOUWM5FRQWB5E6EAS4HNSZ3WOQNUTZ5",
  deployedAt: "Stellar Testnet",
};

export const hasDeployedContract =
  CONTRACT_CONFIG.contractId.startsWith("C") &&
  CONTRACT_CONFIG.contractId.length > 20;

export const getContractExplorerUrl = () =>
  CONTRACT_CONFIG.explorerBaseUrl + "/contract/" + CONTRACT_CONFIG.contractId;

export const getTransactionExplorerUrl = (hash: string) =>
  CONTRACT_CONFIG.explorerBaseUrl + "/tx/" + hash;