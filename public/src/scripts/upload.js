var bsCustomFileInput = require('bs-custom-file-input');
$(document).ready(function () {
    bsCustomFileInput.init()
});


preview = function (event) {
    var src = URL.createObjectURL(event.target.files[0]);
    $('#artPreview').attr('src',src);
    $('#artPreview').parent().children().first().removeClass('d-none');
};