require('owl.carousel/dist/owl.carousel');

const ipfsURL = 'http://127.0.0.1:8080/ipfs/';

$(document).ready(async () => {
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
        margin: 100,
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

    var d = new Date();
    d.setTime(details[3].toNumber());
    artUploadDate = d.toJSON().slice(0,10); 
    artTransactionFee = details[4][0];
    artAvgTransfer = web3.utils.fromWei(details[4][1],'ether'); 
    artTransferLimit = parseInt(details[4][2]);

    artImage = ipfsURL + hash;

    const _details = {
        name:artName,
        author:artAuthor,
        description:artName,
        date: artUploadDate,
        fee: artTransactionFee,
        avgTransfer:artAvgTransfer,
        transferLimit: artTransferLimit,
        image:artImage,
        hash: hash
    };

    return _details;
}

function addArtworkElement(hash,details) {
    const $divContainer = $("<div>", { "class": "slide-img-container d-flex justify-content-center align-items-center" });
    const $div = $("<div>", { "class": "slide-img" });
    const $a = $("<a>", { "id": "modalTest", "data-toggle": "modal", "data-target": "#artModal", "data-artwork": JSON.stringify(details) });
    const $img = $("<img>", { "class": "rounded-lg shadow-lg", "src":"#" });
    const $span = $("<span>", { "class": "pt-1" });
    const $br = $("<br>", { "class": "mt-1" });
    const $i = $("<i>");


    $img.attr('src', details.image);
    $span.text(details.name);
    $i.text('From ' + details.author);

    const $el = $divContainer.append($div.append($a.append($img).append($span.append($br).append($i))));
    $('#featured').append($el);
}

$('#artModal').on('show.bs.modal', function (event) {
    var sender = $(event.relatedTarget); // Button that triggered the modal

    var data = JSON.parse($(sender).attr('data-artwork'));

    var modal = $(this);

    modal.find('.modal-title').text(data.name);
    modal.find('h2').text(data.name);
    modal.find('#artModalDescription').text(data.description);
    modal.find('#artModalUploadDate').text("Uploaded At " + data.date);
    modal.find('#artModalAuthor').text("By " + data.author);
    modal.find('#artModalImage').attr('src', data.image);
    modal.find('#artModalLimit').html('Amount Left: <b> &nbsp;' + data.transferLimit + '</b>');
    
    var artModalFee = modal.find('#artModalFee');
    var artModalInputFee = modal.find('#artModalInputFee');
    var artModalAverage = modal.find('#artModalAverage');

    const optionalFee = data.fee <= 0;
    if(optionalFee)
    {
        //Optional Fee
        artModalFee.hide();
        artModalInputFee.show();
        artModalAverage.show();

        artModalAverage.html("Average Transaction: <b> &nbsp;" + (data.avgTransfer) + " Ether</b>");
    }
    else
    {
        artModalFee.show();
        artModalInputFee.hide();
        artModalAverage.hide();
        

        const etherValue = web3.utils.fromWei(data.fee,'ether');
        artModalFee.html('Artwork Fee: <b> &nbsp;' + etherValue + '</b>');

    }

    var minLimit = (data.total_donation / data.donation_count) - 5;
    if (minLimit < 0.1)
        minLimit = 0.1;
    var maxLimit = (data.total_donation / data.donation_count) + 5;

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

    var sendBtn = modal.find('#applyTransactionBtn');

    sendBtn.on('click', async () => {
        let feeInput = 0;
        if(optionalFee)
        {
            feeInput = artModalInputFee.children().val();
            console.log(feeInput);
        }
        else
        {
            feeInput = data.fee;
        }
        const etherValue = web3.utils.toWei(feeInput, 'wei');
        const result = await App.licenseArtwork(data.hash,etherValue);
        console.log(result);
    });

});