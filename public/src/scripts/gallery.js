require('owl.carousel/dist/owl.carousel');

const ipfsURL = 'http://127.0.0.1:8080/ipfs/';
var artModalClone;
var incModalClone;

$(document).ready(async () => {
    artModalClone = $('#artModal').clone();
    incModalClone = $('#incentiveModal').clone();

    await App.init();

    // Return IPFS hashes of uploaded images.
    const artworkHashes = await App.getArtworks();

    // Populate gallery
    for (let index = 0; index < artworkHashes.length; index++) {
        const hash = artworkHashes[index];
        var details = await App.getArtworkDetails(hash);
        details = convertArtworkDetails(hash, details);
        addArtworkElement(details);
    }

    // Start gallery slideshow
    initSlideshow();
});

function hideLoaders() {
    $('.content-block-loader').remove();
};

function initSlideshow() {
    hideLoaders();

    $('.owl-carousel').owlCarousel({
        center: false,
        items: 3,
        loop: true,
        margin: 100,
        autoWidth: true,
        autoplay: true,
        autoplayTimeout: 4000,
        autoplayHoverPause: true,
    });
};

function convertArtworkDetails(hash, details) {
    artName = web3.utils.hexToUtf8(details[0]);
    artAuthor = web3.utils.hexToUtf8(details[1]);
    artDescription = web3.utils.hexToUtf8(details[2]);

    var d = new Date();
    d.setTime(details[3].toNumber());
    artUploadDate = d.toJSON().slice(0, 10);
    artTransactionFee = details[4][0];
    artAvgTransfer = web3.utils.fromWei(details[4][1], 'ether');
    artTransferLimit = parseInt(details[4][2]);

    artImage = ipfsURL + hash;

    const _details = {
        name: artName,
        author: artAuthor,
        description: artDescription,
        date: artUploadDate,
        fee: artTransactionFee,
        avgTransfer: artAvgTransfer,
        transferLimit: artTransferLimit,
        image: artImage,
        hash: hash
    };

    return _details;
};

function addArtworkElement(details) {
    const $divContainer = $("<div>", { "class": "slide-img-container d-flex justify-content-center align-items-center" });
    const $div = $("<div>", { "class": "slide-img" });
    const $a = $("<a>", { "id": "modalTest", "data-toggle": "modal", "data-target": "#artModal", "data-artwork": JSON.stringify(details) });
    const $img = $("<img>", { "class": "rounded-lg shadow-lg", "src": "#" });
    const $span = $("<span>", { "class": "p-2 text-center" });
    const $br = $("<br>", { "class": "mt-1" });
    const $small = $("<small>");
    const $i = $("<i>");


    $img.attr('src', details.image);
    $span.text(details.name);
    $i.text('From ' + details.author);

    const $el = $divContainer.append($div.append($a.append($img).append($span.append($br).append($small.append($i)))));
    $('#featured').append($el);
};

function setIncentive() {
    console.log('hello');
    var incentiveModal = $('#incentiveModal');
    var incentiveModalNextBtn = incentiveModal.find('#nextBtn');

    var imageSet = [];

    $.ajax({
        url: 'http://localhost:3000/gallery/requestImageClass',
        method: 'GET'
    }).done((res) => {
        if (res) {
            imageSet = res;

            var fieldsets = incentiveModal.find('fieldset');
            for (let index = 0; index < fieldsets.length; index++) {
                const element = $(fieldsets[index]);
                const imageItem = imageSet[index];

                // Set Image
                element.find('img').attr('src', imageItem.img);

                // Find Labels
                const labels = element.find('label');

                for (let labelIndex = 0; labelIndex < labels.length; labelIndex++) {
                    const label = $(labels[labelIndex]);

                    // Set Label
                    label.text(imageItem.choices[labelIndex]);
                }
            }
        } else {
            console.warn(res);
        }
    });

    incentiveModal.modal('show');
    incentiveModal.attr('data-valid', 0);

    incentiveModalNextBtn.on('click', () => {
        currentFieldset = incentiveModal.find('fieldset.current');
        nextFieldset = currentFieldset.next();
        currentFieldset.removeClass('current')
        nextFieldset.addClass('current')
        if (nextFieldset.next()[0] == undefined) {
            // End of form
            incentiveModalNextBtn.text('Submit');
            incentiveModalNextBtn.unbind('click');
            incentiveModalNextBtn.on('click', () => {
                $.ajax({
                    url: 'http://localhost:3000/gallery/validateClassificationTask',
                    method: 'POST',
                    data: $(incentiveModal.find('form')[0]).serialize(),
                    statusCode: {
                        200: () => {
                            incentiveModal.attr('data-valid', 1);
                            incentiveModal.modal('hide');
                        },
                        406: () => {
                            incentiveModal.attr('data-valid', -1);
                            incentiveModal.modal('hide');
                        }
                    }
                });

            });
        }
    });
};

$(document).on('show.bs.modal', '#artModal', async function (event) {
    var sender = $(event.relatedTarget);

    // Artwork Details
    var data = JSON.parse($(sender).attr('data-artwork'));

    var modal = $(this);

    modal.find('.modal-title').text(data.name);
    modal.find('h2').text(data.name);
    modal.find('#artModalDescription').text(data.description);
    modal.find('#artModalUploadDate').text("Uploaded At " + data.date);
    modal.find('#artModalAuthor').text("By " + data.author);
    modal.find('#artModalImage').attr('src', data.image);
    modal.find('#sponsorValid').val(0);

    var ownStatus = modal.find('#artModalOwned');
    var artModalLimit = modal.find('#artModalLimit');
    var artModalFee = modal.find('#artModalFee');
    var artModalInputFee = modal.find('#artModalInputFee');
    var artModalAverage = modal.find('#artModalAverage');
    var sendBtn = modal.find('#applyTransactionBtn');

    const isOwned = await App.isArtworkOwned(data.hash);
    const optionalFee = data.fee <= 0;
    const unlimited = data.transferLimit == 4294967295;

    if (isOwned) {
        ownStatus.show();
        sendBtn.attr("disabled", true);
    }
    else {
        ownStatus.hide();
        sendBtn.attr("disabled", false);
    }

    if (unlimited)
        artModalLimit.text('Amount Left: No Limit');
    else
        artModalLimit.html('Amount Left: <b> &nbsp;' + data.transferLimit + '</b>');

    if (optionalFee) {
        artModalFee.hide();
        artModalInputFee.show();
        artModalAverage.show();

        artModalAverage.html("Average Transaction: <b> &nbsp;" + (data.avgTransfer) + " Ether</b>");
    }
    else {
        artModalFee.show();
        artModalInputFee.hide();
        artModalAverage.hide();

        const etherValue = web3.utils.fromWei(data.fee, 'ether');
        artModalFee.html('Artwork Fee: <b> &nbsp;' + etherValue + ' Ether </b>');
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


    sendBtn.on('click', async () => {
        if (isOwned)
            return;

        sendBtn.text('Processing...');

        let feeInput = 0;
        let applyComission = modal.find('#sponsorValid').val() != 1;
        console.log(applyComission);
        if (optionalFee) {
            feeInput = artModalInputFee.children().val();
            feeInput = web3.utils.toWei(feeInput, 'ether');
        }
        else {
            feeInput = data.fee;
        }
        const etherValue = web3.utils.toWei(feeInput, 'wei');
        const result = await App.licenseArtwork(data.hash, etherValue, applyComission);
        sendBtn.text('Done');
        console.log(result);
    });

    $('#incentiveBtn').on('click', setIncentive);

});

$(document).on('hidden.bs.modal','#artModal', function (e) {
    console.log('destroyed');
    $('#artModal').remove();
    var myClone = artModalClone.clone();
    $('body').append(myClone);
});

$(document).on('hidden.bs.modal', '#incentiveModal', function (e) {
    const valid = $('#incentiveModal').attr('data-valid');
    $('#artModal').find('#sponsorValid').val(valid);

    const listBtn = $($('.list-group').children('button')[0]);
    if (valid == 1) {
        $('#sponsorStatus').text('Current sponsor status: Applied');
        listBtn.addClass('bg-success text-white disabled');
    }
    else if (valid == 0) {
        $('#sponsorStatus').text('Current sponsor status: Not applied');
    }
    else {
        $('#sponsorStatus').text('Current sponsor status: Not applied. Task rejected');
        listBtn.addClass('bg-danger text-white');
    }

    $('#incentiveModal').remove();
    var myClone = incModalClone.clone();
    $('body').append(myClone);
});

$(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});