const Web3 = require('web3');
const contract = require('truffle-contract');
const artworkControllerArtifact = require('../../../build/contracts/ArtworkController.json');

App = {
    web3Provider: null,
    contracts: {},

    init: async function () {
        return await App.initWeb3();
    },

    initWeb3: async function () {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                console.log("Requesting Access...");
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
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            console.log("Using Ganache...");
            App.onMetamaskNotFound();
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function () {
        App.contracts.ArtworkController = contract(artworkControllerArtifact);
        App.contracts.ArtworkController.setProvider(App.web3Provider);
        return App.bindEvents();
    },

    bindEvents: function () {

    },

    getArtworks: function () {
        return web3.eth.getAccounts(function (error, accounts) {
            if (error)
                console.log(error);

            var account = accounts[0];

            return App.contracts.ArtworkController.deployed().then((instance) => {
                artworkControllerInstance = instance;
                return artworkControllerInstance.getArtworks({ from: account });
            });
        });
    },

    getArtworkCount: function () {
        return web3.eth.getAccounts(function (error, accounts) {
            if (error)
                console.log(error);

            var account = accounts[0];

            return App.contracts.ArtworkController.deployed().then((instance) => {
                artworkControllerInstance = instance;
                return artworkControllerInstance.getArtworksLength({ from: account });
            });
        });
    },

    getArtworkDetails: function (imageHash) {
        return web3.eth.getAccounts(function (error, accounts) {
            if (error)
                console.log(error);

            var account = accounts[0];

            return App.contracts.ArtworkController.deployed().then((instance) => {
                artworkControllerInstance = instance;
                return artworkControllerInstance.getArtworkDetails(imageHash, { from: account });
            });
        });
    },


    submitArtwork: function (imageHash, imageName, imageAuthor, imageDescription, cb) {
        return web3.eth.getAccounts().then(accounts => {
            var account = accounts[0];

            return App.contracts.ArtworkController.deployed().then((instance) => {
                artworkControllerInstance = instance;
                artworkControllerInstance.addArtwork(imageHash, imageName, imageAuthor, imageDescription, { from: account }).then((result) => cb(undefined, result));
            }).catch((err) => cb(err, undefined));

        });
    },

    licenseArtwork: function (imageHash, value) {
        return web3.eth.getAccounts(function (error, accounts) {
            if (error)
                console.log(error);

            var account = accounts[0];

            return App.contracts.ArtworkController.deployed().then((instance) => {
                artworkControllerInstance = instance;
                return artworkControllerInstance.license(imageHash, { from: account, value: value });
            });
        });
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
        $('#accessStatusText').children().text('Connnected to the network.');
        $('#metamask .spinner').hide();
        setTimeout(() => {
            $('#metamask').hide();
        }, 1500);
    }
};

$(function () {
    $(window).on('load', () => {
        setTimeout(() => {
            App.init();
        }, 1000);
    });
});