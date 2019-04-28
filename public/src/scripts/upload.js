const ipfsClient = require('ipfs-http-client');
const buffer = require('buffer');
const bsCustomFileInput = require('bs-custom-file-input');

require('particles.js');
particlesJS.load('particles-js', '../config/particlesjs-config2.json');

$(document).ready(function () {
    bsCustomFileInput.init()

    hideStatus();
    hideReceipt();

    $('#artOptionalFee').change(() => {
        const checked = $('#artOptionalFee').is(":checked");
        if(checked)
            $('#artFeeContainer').hide();
        else
            $('#artFeeContainer').show();
    });


    $('#uploadForm').on('submit', async function (event) {
        event.preventDefault();

        hideStatus();
        hideReceipt();
        // If metamask not initalized
        await App.init();
        if (!App.isInit) {
            console.error("Metamask not initalized");
            showStatus("Metamask not initalized", true);
            return;
        }

        var formData = new FormData($(this)[0]);

        // Get artwork details
        const imgName = web3.utils.asciiToHex(formData.get('name'), 32);
        const imgAuthor = web3.utils.asciiToHex(formData.get('author'), 16);
        const imgDescription = web3.utils.asciiToHex(formData.get('description'));
        const imgTransferLimit = web3.utils.numberToHex(formData.get('limit'));
        let imgFee = 0;
        if ($('#artOptionalFee').is(":checked"))
            imgFee = 0;
        else
            imgFee = web3.utils.toWei($('#artFee').val(), 'ether');
        const imgFile = formData.get('file');

        var reader = new FileReader();
        reader.onloadend = async () => {
            const fileContent = buffer.Buffer(reader.result);

            // Retrieve IPFS Hash of the image
            var imgHash = '';
            try {
                const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')
                var ipfsOperation = await ipfs.add(fileContent, { onlyHash: true });
                imgHash = ipfsOperation[0].hash;

                try {
                    showStatus('Waiting for contract...', false);
                    const result = await App.submitArtwork(imgHash, imgName, imgAuthor, imgDescription,imgTransferLimit,imgFee);
                    showStatus('Uploading artwork to IPFS...', false);
                    await ipfs.add(fileContent, { pin: true });
                    showStatus('Uploaded to IPFS', false);
                    showReceipt(result);
                }
                catch (e) {
                    console.log(e);
                    const msg = e.toString();
                    const err_msg = msg.slice(msg.indexOf('revert ') + 7, msg.Length);
                    showStatus(err_msg, true);
                }
            }
            catch (e) {
                console.error(e);
                showStatus("IPFS Connection error", true);
                return;
            }
        }

        reader.readAsArrayBuffer(imgFile);

        // Notify Server
        // $.ajax({
        //     url: 'http://localhost:3000/upload',
        //     method: 'POST',
        //     cache: false,
        //     contentType: false,
        //     processData: false,
        //     data: formData,
        // })
        //     .done((res) => {
        //         if (res.success) {
        //             console.log('File IPFS Hash', res);
        //             window.location.reload();
        //         } else {
        //             console.log(res);
        //         }
        //     });
    });
});

function showStatus(text, danger) {
    $('#statusBox').removeClass();
    if (danger)
        $('#statusBox').addClass('alert alert-danger');
    else
        $('#statusBox').addClass('alert alert-success');
    $('#statusBox').text(text);
    $('#statusBox').show();
};

function hideStatus() {
    $('#statusBox').hide();
};

function showReceipt(result) {
    const tx = result.tx;
    const block = result.receipt.blockHash;
    const blockNumber = result.receipt.blockNumber;
    const from = result.receipt.from;
    const to = result.receipt.to;
    const receipt = `Transaction: ${tx} \n
                     Block Hash: ${block} \n
                     Block Number: ${blockNumber} \n
                     From: ${from} \n
                     To: ${to} \n`;
    $('#receiptBox').removeClass('d-none');
    $('#receiptText').text(receipt);
}

function hideReceipt() {
    $('#receiptBox').addClass('d-none');
}

preview = function (event) {
    var src = URL.createObjectURL(event.target.files[0]);
    $('#artPreview').attr('src', src);
    $('#artPreview').parent().children().first().removeClass('d-none');
};