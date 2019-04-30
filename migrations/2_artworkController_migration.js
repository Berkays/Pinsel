var ArtworkController = artifacts.require("./ArtworkController.sol");
var AccountController = artifacts.require("./AccountController.sol");

module.exports = function (deployer) {
    console.log(deployer);
    deployer.deploy(AccountController).then(() => {
        return deployer.deploy(ArtworkController,AccountController.address);
    });
};