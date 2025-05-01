// migrations/3_grant_roles.js
const VehicleHistory = artifacts.require("VehicleHistory");

module.exports = async function (deployer, network, accounts) {
  /*
      accounts[0] – deployer  (DMV / DEFAULT_ADMIN_ROLE)
      accounts[1] – insurer
      accounts[3] – service centre
      (adjust the indexes or hard-code addresses if you prefer)
  */
  const vh = await VehicleHistory.deployed();

  await vh.grantRole(await vh.INSURER_ROLE(), accounts[1], { from: accounts[0] });
  await vh.grantRole(await vh.SERVICE_ROLE(),  accounts[3], { from: accounts[0] });

  console.log("✅  Grant-role migration executed");
};
