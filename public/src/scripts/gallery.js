var Web3 = require('web3');
var contract = require('truffle-contract');

require('particles.js');
particlesJS.load('particles-js', './scripts/particlesjs-config.json');

require('owl.carousel/dist/owl.carousel');
var swal = require('sweetalert2');

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

$('#artModal').on('show.bs.modal', function (event) {
    var sender = $(event.relatedTarget); // Button that triggered the modal

    var data = JSON.parse($(sender).attr('data-artwork'));

    var modal = $(this);

    modal.find('#artModalTitle').text(data.name);
    modal.find('h2').text(data.name);
    modal.find('#artModalDescription').text(data.description);
    modal.find('#artModalUploadDate').text("Uploaded At " + data.upload_date);
    modal.find('#artModalAuthor').text("By " + data.author);
    modal.find('#artModalImage').attr('src',data.file);


    var minLimit = (data.total_donation / data.donation_count) - 5;
    if(minLimit < 0.1)
        minLimit = 0.1;
    var maxLimit = (data.total_donation / data.donation_count) + 5;

    modal.find('#artModalAverageDonation').text("Average Donation: " + (data.total_donation / data.donation_count));

    var donationSlider = modal.find('#donationSlider');
    var donationSliderLabel = $("label[for=donationSlider]");
    
    donationSlider.attr('min',minLimit);
    donationSlider.attr('max',maxLimit);
    donationSlider.attr('step', (data.total_donation / data.donation_count) / 50);
    
    donationSlider.on('input', () => {
        newVal = donationSlider.val();
        donationSliderLabel.html("Donation Amount: <b>" + newVal + " &nbspEther</b>");
    });

    donationSlider.val((maxLimit - minLimit) / 2);
    newVal = donationSlider.val();
    donationSliderLabel.html("Donation Amount: <b>" + newVal + " &nbspEther</b>");

    var sendDonation = modal.find('#sendDonation');

    sendDonation.unbind('click').on('click', (e) => {
        e.preventDefault();

        var body = {
            "name":data.name,
            "donation":donationSlider.val()
        }; 

        $.ajax({
            type: "POST",
            url: "/gallery/donate",
            data: body,
            cache: false,
            success: function (result) {
                //swal("Good job!", "You clicked the button!", "success");
                console.log("Success");
            }
        });
    });

})