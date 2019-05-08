const Web3 = require('web3');
const contract = require('truffle-contract');
const artworkControllerArtifact = require('../../../build/contracts/ArtworkController.json');
const accountControllerArtifact = require('../../../build/contracts/AccountController.json');

App = {
    web3Provider: null,
    contracts: {},
    isInit: false,

    init: async function () {
        if (App.isInit)
            return;
        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Modern dapp browsers...

        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                console.log("Requesting Access...");
                App.onMetamaskRequire();
                await window.ethereum.enable();
                console.log("Access given.");
                App.onMetamaskEnable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
                App.onAccessDenied();
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            console.log("Legacy Dapp Browser Deteced...");
            window.web3 = new Web3(currentProvider);
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            console.log("Using Ganache...");
            App.onMetamaskNotFound();
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        const network = await web3.eth.net.getNetworkType();
        console.log(network);
        if (network == 'private') {
            App.snackNotify("Connected to private network",2500);
        }
        else if (network == 'main') {
            App.snackNotify("Connected to main network",2500);
        }
        else if (network == 'ropsten') {
            App.snackNotify("Connected to ropsten network",2500);
        }
        else if (network == 'kovan') {
            App.snackNotify("Connected to kovan network",2500);
        }

        window.ethereum.on('accountsChanged', function (accounts) {
            location.reload();
        })

        return await App.initContract();
    },

    initContract: function () {
        App.contracts.ArtworkController = contract(artworkControllerArtifact);
        App.contracts.ArtworkController.setProvider(App.web3Provider);

        App.contracts.AccountController = contract(accountControllerArtifact);
        App.contracts.AccountController.setProvider(App.web3Provider);

        App.isInit = true;
    },

    getAccount: async function () {
        var accounts = await web3.eth.getAccounts();
        return accounts[0];
    },

    getDeployed: async function (contract) {
        return await contract.deployed();
    },

    getArtworks: async function () {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.ArtworkController);
        return contract.getArtworks({ from: account });
    },

    getArtworkCount: async function () {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.ArtworkController);
        return contract.getArtworksLength({ from: account });
    },

    getArtworkDetails: async function (imageHash) {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.ArtworkController);
        return contract.getArtworkDetails(imageHash, { from: account });
    },

    submitArtwork: async function (imageHash, imageName, imageAuthor, imageDescription, imageTransferLimit, imageFee) {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.ArtworkController);

        const uploadDate = new Date();

        return contract.addArtwork(imageHash, imageName, imageAuthor, imageDescription, uploadDate.getTime(), imageTransferLimit, imageFee, { from: account });
    },

    licenseArtwork: async function (imageHash, value) {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.ArtworkController);
        return contract.license(imageHash, { from: account, value: value });
    },

    getOwnedArtworks: async function () {
        var account = await App.getAccount();
        var contract = await App.getDeployed(App.contracts.AccountController);
        return contract.getOwnedArtworks({ from: account });
    },

    onMetamaskRequire: function () {
        $('#metamask').show();
        $('#accessStatusText').children().text('Requesting Metamask Access.');
        $('#metamask .spinner').show();
        $('#failure').hide();
    },

    onMetamaskNotFound: function () {
        $('#accessStatusText').children().text('Metamask not enabled. Install Metamask extension.');
        $('#metamask .spinner').hide();
        $('#failure').show();
    },

    onAccessDenied: function () {
        $('#accessStatusText').children().text('Access Denied.\nRefresh page and allow Metamask extension.');
        $('#metamask .spinner').hide();
        $('#failure').show();
    },

    onMetamaskEnable: function () {
        setTimeout(() => {
            $('#metamask .spinner').hide();
            $('#metamask').hide();
            $('#accessStatusText').children().text('Connnected to the network.');
        }, 1500);
    },

    snackNotify: function (text, duration = 0) {
        $('#snackbar').find('h1').text(text);
        $('#snackbar').addClass('slide-in-bottom');
        if (duration > 0) {
            setTimeout(() => {
                $('#snackbar').removeClass('slide-in-bottom');
            }, duration);
        }
    }
};