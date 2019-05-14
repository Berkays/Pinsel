require('particles.js');
particlesJS.load('particles-js', '../config/particlesjs-config2.json');

const ipfsURL = 'http://127.0.0.1:8080/ipfs/';

$(document).ready(async () => {

    await App.init();
    if (!App.isInit) {
        console.error("Metamask not initalized");
        showStatus("Metamask not initalized", true);
        return;
    }

    const account = await App.getAccount();
    $('#accountStatus').text('Signed account: ' + account);

    const ownedItems = await App.getOwnedArtworks();
    //hideLoaders();

    if(ownedItems.length > 0)
    {
        $('#ownedItemStatus').hide();
        populateList(ownedItems);
    }
    else
    {
        $('#ownedItemStatus').show();
    }
    
    console.log(ownedItems);
});

function hideLoaders() {
    $('.content-block-loader').remove();
};

function populateList(items) {
    items.forEach(item => {
        App.getArtworkDetails(item).then((details) => {

            details = convertArtworkDetails(item,details);

            const $li = $("<li>", { "class": "list-group-item d-flex justify-content-start" });
            const $img = $("<img>", { "class": "rounded shadow-sm" });
            const $h1 = $("<h1>", { "class": "display-6 ml-3 my-auto" });
            const $btn = $("<div>", { "class": "btn btn-light border border-dark ml-auto my-auto", "data-toggle": "modal", "data-target": "#artModal", "data-artwork": JSON.stringify(details) });
            
            $img.attr('src', details.image);
            $h1.text(details.name);
            $btn.text("View Details");
            
            const $el = $li.append($img).append($h1).append($btn);
            $('#ownedItemList').append($el);
        });
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

$('#artModal').on('show.bs.modal', async function (event) {
    var sender = $(event.relatedTarget);

    // Artwork Details
    var data = JSON.parse($(sender).attr('data-artwork'));
    console.log(data);
    var modal = $(this);

    modal.find('.modal-title').text(data.name);
    modal.find('h2').text(data.name);
    modal.find('#artModalDescription').text(data.description);
    modal.find('#artModalUploadDate').text("Uploaded At " + data.date);
    modal.find('#artModalAuthor').text("By " + data.author);
    modal.find('#artModalImage').attr('src', data.image);

    var artModalLimit = modal.find('#artModalLimit');
    var artModalFee = modal.find('#artModalFee');
    var artModalAverage = modal.find('#artModalAverage');

    const optionalFee = data.fee <= 0;
    const unlimited = data.transferLimit == 4294967295;

    if (unlimited)
        artModalLimit.text('Amount Left: No Limit');
    else
        artModalLimit.html('Amount Left: <b> &nbsp;' + data.transferLimit + '</b>');

    if (optionalFee) {
        artModalFee.hide();
        artModalAverage.show();

        artModalAverage.html("Average Transaction: <b> &nbsp;" + (data.avgTransfer) + " Ether</b>");
    }
    else {
        artModalFee.show();
        artModalAverage.hide();

        const etherValue = web3.utils.fromWei(data.fee, 'ether');
        artModalFee.html('Artwork Fee: <b> &nbsp;' + etherValue + ' Ether </b>');
    }
});