export const CONTRACT_CONFIG = {
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
  rpcUrl: "https://soroban-testnet.stellar.org",
  explorerBaseUrl: "https://stellar.expert/explorer/testnet",
  contractId: "CAPAJLC2WT435RDYVHB5M6UTM3YTOS3ZZ3RXDM4H7QW5TZ363UEZ5KN7",
  deployedAt: "Stellar Testnet",
};

export const hasDeployedContract =
  CONTRACT_CONFIG.contractId.startsWith("C") &&
  CONTRACT_CONFIG.contractId.length > 20;

export const getContractExplorerUrl = () =>
  CONTRACT_CONFIG.explorerBaseUrl + "/contract/" + CONTRACT_CONFIG.contractId;

export const getTransactionExplorerUrl = (hash: string) =>
  CONTRACT_CONFIG.explorerBaseUrl + "/tx/" + hash;