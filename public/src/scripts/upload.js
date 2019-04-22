require('./app.js');
const ipfsClient = require('ipfs-http-client');
const buffer = require('buffer');

$(document).ready(function () {
    $('#uploadForm').on('submit', function (event) {
        event.preventDefault();

        const ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001')

        var formData = new FormData($(this)[0]);

        // Get artwork details
        const imgName = web3.utils.asciiToHex(formData.get('name'), 32);
        const imgAuthor = web3.utils.asciiToHex(formData.get('author'), 16);
        const imgDescription = web3.utils.asciiToHex(formData.get('description'));
        const imgFile = formData.get('file');

        var reader = new FileReader();
        reader.onloadend = () => {
            const buf = buffer.Buffer(reader.result);
            const ipfsFile = {
                path: '/uploads/' + imgName,
                content: buf
            };

            // Retrieve IPFS Hash of the image
            const ipfsOperation = ipfs.add(ipfsFile, { onlyHash: true });

            ipfsOperation.then((results) => {
                const imgHash = results[0].hash

                App.submitArtwork(imgHash, imgName, imgAuthor, imgDescription, (err,result) => {
                    
                    if(err)
                    {
                        console.error(err);
                        return
                    }

                    console.log(result);
                    //Submit to IPFS
                    ipfs.add(ipfsFile).then((results) => {
                        console.log("Uploaded file to IPFS. Hash: " + imgHash);
                    })
                        .catch((err) => {
                            console.error(err);
                        });
                });
            })
                .catch((err) => {
                    console.error(err);
                });
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

preview = function (event) {
    var src = URL.createObjectURL(event.target.files[0]);
    $('#artPreview').attr('src', src);
    $('#artPreview').parent().children().first().removeClass('d-none');
};