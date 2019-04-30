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

    if(ownedItems.length > 0)
    {
        $('#ownedItemStatus').hide();
        populateList(ownedItems);
    }
    
    console.log(ownedItems);
});

function populateList(items) {
    items.forEach(item => {
        App.getArtworkDetails(item).then((details) => {
            const $li = $("<li>", { "class": "list-group-item d-flex justify-content-start" });
            const $img = $("<img>", { "class": "rounded shadow-sm" });
            const $h1 = $("<h1>", { "class": "display-6 ml-3 my-auto" });
            const $btn = $("<div>", { "class": "btn btn-light border border-dark ml-auto my-auto", "data-toggle": "modal", "data-target": "#artModal", "data-artwork":JSON.stringify(item) });
            
            $img.attr('src', ipfsURL + item);
            $h1.text(web3.utils.hexToUtf8(details[0]));
            $btn.text("View Details");
            
            const $el = $li.append($img).append($h1).append($btn);
            $('#ownedItemList').append($el);
        });
    });
};