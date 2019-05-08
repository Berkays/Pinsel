var ArtworkController = artifacts.require("./ArtworkController.sol");
var AccountController = artifacts.require("./AccountController.sol");

const adminAccount = "0xC7D45a6C84D0C40fE8c851A92f3Dc88295FD9169"; // Only this account can withdraw ArtworkController Funds.

module.exports = function (deployer) {
    deployer.deploy(AccountController).then(() => {
        return deployer.deploy(ArtworkController, AccountController.address, adminAccount);
    });
};