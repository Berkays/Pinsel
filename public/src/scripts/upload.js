const ipfsClient = require('ipfs-http-client');
const buffer = require('buffer');
const bsCustomFileInput = require('bs-custom-file-input');

require('particles.js');
particlesJS.load('particles-js', '../config/particlesjs-config2.json');

$(document).ready(function () {
    bsCustomFileInput.init()

    $('#uploadForm').on('submit', async function (event) {
        event.preventDefault();

        hideStatus();
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
        const imgTransferLimit = formData.get('limit');
        const imgFee = formData.get('fee');
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
                    const contractOperation = await App.submitArtwork(imgHash, imgName, imgAuthor, imgDescription,imgTransferLimit);
                    showStatus('Uploading artwork to IPFS...', false);
                    ipfsOperation = await ipfs.add(fileContent, { pin: true });
                    showStatus('Uploaded to IPFS', false);
                    showReceipt(imgHash);
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

function showReceipt(hash) {
    $('#receiptBox').removeClass('d-none');
    $('#receiptText').text('IPFS Hash: ' + hash);
}

function hideReceipt() {
    $('#receiptBox').addClass('d-none');
}

preview = function (event) {
    var src = URL.createObjectURL(event.target.files[0]);
    $('#artPreview').attr('src', src);
    $('#artPreview').parent().children().first().removeClass('d-none');
};