const VehicleHistory = artifacts.require("VehicleHistory");

module.exports = function(deployer) {
  // No constructor args!
  deployer.deploy(VehicleHistory);
};
