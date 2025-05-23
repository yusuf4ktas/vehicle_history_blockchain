module.exports = {
  networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",
      gas: 12000000,     // 12 M   ⇐ matches Ganache limit
      gasPrice: 2000000000  // 2 gwei (anything low is fine for local)      // Any network (default: none)
     },
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.21",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {optimizer: {enabled: true,runs: 200}}
    }
  },
};
