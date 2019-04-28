require('particles.js');
particlesJS.load('particles-js', '../config/particlesjs-config2.json');

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
    }
    
    console.log(ownedItems);
});