const ipfsClient = require('ipfs-http-client');
const buffer = require('buffer');

require('owl.carousel/dist/owl.carousel');

const ipfsURL = 'http://127.0.0.1:8080/ipfs/';

$(document).ready(async () => {
    const ipfs = initIPFS();
    await App.init();

    const artworkHashes = await App.getArtworks(); // Return IPFS hashes of uploaded images.
    
    for (let index = 0; index < artworkHashes.length; index++) {
        const hash = artworkHashes[index];
        var details = await App.getArtworkDetails(hash);
        details = convertArtworkDetails(hash,details);
        console.log(hash);
        addArtworkElement(hash, details);
    }

    initSlideshow();
});

function initSlideshow() {
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
};

function initIPFS() {
    return ipfsClient('/ip4/127.0.0.1/tcp/5001');
};

function convertArtworkDetails(hash,details) {
    artName = web3.utils.hexToUtf8(details[0]);
    artAuthor = web3.utils.hexToUtf8(details[1]); 
    artDescription = web3.utils.hexToUtf8(details[2]); 
    artAvgTransfer = details[4].toNumber(); 
    artTransferCount = details[5].toNumber();

    artImage = ipfsURL + hash;

    const _details = {
        name:artName,
        author:artAuthor,
        description:artName,
        avgTransfer:artAvgTransfer,
        transferCount:artTransferCount,
        image:artImage
    };

    return _details;
}

function addArtworkElement(hash,details) {
    const $div = $("<div>", { "class": "slide-img" });
    const $a = $("<a>", { "id": "modalTest", "data-toggle": "modal", "data-target": "#artModal", "data-artwork": JSON.stringify(details) });
    const $img = $("<img>", { "class": "rounded-lg shadow-lg", "src":"#" });
    const $span = $("<span>", { "class": "pt-1" });
    const $br = $("<br>", { "class": "mt-1" });
    const $i = $("<i>");


    $img.attr('src', details.image);
    $span.text(details.name);
    $i.text('From ' + details.author);

    const $el = $div.append($a.append($img).append($span.append($br).append($i)));
    $('#featured').append($el);
}

$('#artModal').on('show.bs.modal', function (event) {
    var sender = $(event.relatedTarget); // Button that triggered the modal
    console.log("clicked");
    var data = JSON.parse($(sender).attr('data-artwork'));

    var modal = $(this);

    modal.find('#artModalTitle').text(data.name);
    modal.find('h2').text(data.name);
    modal.find('#artModalDescription').text(data.description);
    modal.find('#artModalUploadDate').text("Uploaded At " + data.upload_date);
    modal.find('#artModalAuthor').text("By " + data.author);
    modal.find('#artModalImage').attr('src', data.image);


    var minLimit = (data.total_donation / data.donation_count) - 5;
    if (minLimit < 0.1)
        minLimit = 0.1;
    var maxLimit = (data.total_donation / data.donation_count) + 5;

    modal.find('#artModalAverageDonation').html("Average Transaction: <b>" + (data.total_donation / data.donation_count) + " Ether</b>");

    var donationSlider = modal.find('#donationSlider');
    var donationSliderLabel = $("label[for=donationSlider]");

    donationSlider.attr('min', minLimit);
    donationSlider.attr('max', maxLimit);
    donationSlider.attr('step', (data.total_donation / data.donation_count) / 50);

    donationSlider.on('input', () => {
        newVal = donationSlider.val();
        donationSliderLabel.html("Transaction Amount: <b>" + newVal + " Ether</b>");
    });

    donationSlider.val((maxLimit - minLimit) / 2);
    newVal = donationSlider.val();
    donationSliderLabel.html("Transaction Amount: <b>" + newVal + " Ether</b>");

    var sendDonation = modal.find('#sendDonation');

    sendDonation.unbind('click').on('click', (e) => {
        e.preventDefault();

        var body = {
            "name": data.name,
            "donation": donationSlider.val()
        };

        $.ajax({
            type: "POST",
            url: "/gallery/donate",
            data: body,
            cache: false,
            success: function (result) {
                console.log("Success");
            }
        });
    });

});