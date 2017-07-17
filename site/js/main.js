const Navigo = require("navigo");

const router = new Navigo(null, true, '#!');


function open (url) {
    const content = document.getElementById("content");
    
    fetch(url).then(function(response) {
        return response.text();
    }).then(function (html) {
        content.innerHTML = html;
    });
}

router
    .on("/play", function () {
        open('site/pages/play.html');
    })
    .on("/contribute", function () {
        open('site/pages/contribute.html');
    })
    .on("/credits", function () {
        open('site/pages/credits.html');
    })
    .on("/pepperandcarrot", function () {
        open('site/pages/pepperandcarrot.html');
    })
    .on("/", function () {
        open('site/pages/about.html');
    })
    .resolve();

router.navigate("/");


