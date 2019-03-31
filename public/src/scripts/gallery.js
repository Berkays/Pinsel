var Web3 = require('web3');
var contract = require('truffle-contract');

require('particles.js');
particlesJS.load('particles-js', './scripts/particlesjs-config.json');

require('owl.carousel/dist/owl.carousel');


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
                onMetamaskEnable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
                onAccessDenied();
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
            onMetamaskNotFound();
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
        console.log("123");
        setTimeout(() => {
            //App.init();
        },3000);
    });
});

$(document).ready(() => {
    initImages();

    // Modal Test
    $('#modalTest').click();
});

function initImages() {
    $('.owl-carousel').owlCarousel({
        center: true,
        items: 3,
        loop: true,
        margin: 200,
        autoWidth: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
    });
}

function onMetamaskNotFound() {
    $('#accessStatusText').children().text('Metamask not enabled. Install Metamask extension.');
    $('#metamask .spinner').hide();
    $('#failure').show();
}

function onAccessDenied() {
    $('#accessStatusText').children().text('Access Denied.\nRefresh page and allow Metamask extension.');
    $('#metamask .spinner').hide();
    $('#failure').show();
}

function onMetamaskEnable() {
    // $('#accessStatusText').hide();
    // $('#metamask .spinner').hide();
    // $('#failure').hide();
    $('#metamask').hide();
}

$('#exampleModalCenter').on('show.bs.modal', function (event) {
    var sender = $(event.relatedTarget); // Button that triggered the modal

    var imgSrc = $(sender).children().attr('src');
    console.log(imgSrc);

    
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    
    var modal = $(this);
    modal.find('#artimage').attr('src',imgSrc);
})