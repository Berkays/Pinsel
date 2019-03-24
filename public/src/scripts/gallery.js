var Web3 = require('web3');
var contract = require('truffle-contract');

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
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
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
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function () {
        /*
         * Replace me...
         */

        return App.bindEvents();
    },

    bindEvents: function () {
        // $(document).on('click', '.btn-adopt', App.handleAdopt);
    }
};

$(function () {
    $(window).on('load', () => {
        App.init();
    });
});