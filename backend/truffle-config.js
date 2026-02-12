module.exports = {
  networks: {
    // Local development network (Ganache)
    development: {
      host: "127.0.0.1",     // Ganache RPC server
      port: 8545,            // Ganache port
      network_id: "*",       // Match any network id
    },
  },

  // Mocha testing framework configuration
  mocha: {
    timeout: 100000
  },

  // Solidity compiler configuration
  compilers: {
    solc: {
      version: "0.8.21",      // Use Solidity 0.8.21
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Truffle DB (disabled by default)
  db: {
    enabled: false
  }
};
