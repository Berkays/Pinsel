const jQuery = require('jquery');
window.$ = window.jQuery = jQuery;

const popper = require('popper.js');
const bootstrap = require('bootstrap');

window.onscroll = function () { navbarScroll() };

// OnScroll Navbar event
function navbarScroll() {
    if (document.body.scrollTop > 5 || document.documentElement.scrollTop > 5) {
        // On Scroll
        $(".navbar").addClass("shadow border-bottom border-dark navbar-scroll-color");
    } else {
        // On Start
        $(".navbar").removeClass("shadow border-bottom border-dark navbar-scroll-color");
    }
}