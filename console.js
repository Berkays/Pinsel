var cont = await ArtworkController.at("0xe60BB98A3ec45eBc9CD02A9B6Ed213AFa2CAb94b")
await cont.addArtwork('image')
cont.license(0, { from: "0x5c020d448225B9a2af04dD2402538249a618ed0f", value: web3.utils.toWei('2', 'ether') })