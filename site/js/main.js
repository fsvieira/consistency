const Navigo = require("navigo");

const router = new Navigo(null, true, '#!');

const cache = {templates: {}};

const content = document.getElementById("content");

const gallery = require("./gallery");

function getPage (url) {
    const html = cache.templates[url];

    if (!html) {
        return fetch(url).then(function(response) {
            return response.text();
        }).then(function (html) {
            cache.templates[url] = html;
            return html;
        });
    }
    else {
        return Promise.resolve(html);
    }
}

function open (url) {
    return getPage(url).then((html) => {
        content.innerHTML = html;
        gallery();
    });
}


// TODO: we need to load pages on DOM, and just hide and show.
// preload pages,
[
    'site/pages/play.html',
    'site/pages/contribute.html',
    'site/pages/credits.html',
    'site/pages/pepperandcarrot.html',
    'site/pages/about.html'
].forEach(getPage);

function deselect () {
    const el = document.querySelector(".selected");
    
    if (el) {
        el.className = el.className.replace("selected", "");
    }
}

router
    .on("/play", function () {
        deselect();

        document.getElementById("play").className += "selected";
        open('site/pages/play.html');
    })
    .on("/contribute", function () {
        deselect();

        document.getElementById("contribute").className += "selected";
        open('site/pages/contribute.html');
    })
    .on("/credits", function () {
        deselect();

        document.getElementById("credits").className += "selected";
        open('site/pages/credits.html');
    })
    .on("/pepperandcarrot", function () {
        deselect();

        document.getElementById("pepperandcarrot").className += "selected";
        open('site/pages/pepperandcarrot.html');
    })
    .on("/", function () {
        deselect();
        
        document.getElementById("root").className += "selected";
        open('site/pages/about.html');
    })
    .resolve();

// router.navigate("/");


