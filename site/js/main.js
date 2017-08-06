const Navigo = require("navigo");

const router = new Navigo(null, true, '#!');

// const cache = {templates: {}};

const content = document.getElementById("content");

const gallery = require("./gallery");

/*function getPage (url) {
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
}*/

const pages = [
    {id: 'play', 'url': '/play', html: 'site/pages/play.html'},
    {id: 'contribute', 'url': '/contribute', html: 'site/pages/contribute.html'},
    {id: 'credits', 'url': '/credits', html: 'site/pages/credits.html'},
    {id: 'pepperandcarrot', 'url': '/pepperandcarrot', html: 'site/pages/pepperandcarrot.html'},
    {id: 'root', 'url': '/', html: 'site/pages/about.html'}
];


function deselect () {
    pages.forEach(function (page) {
       page.el.className = "hide"; 
       page.button.className = page.button.className.replace("selected", ""); 
    });
    
/*    const el = document.querySelector(".selected");
    
    if (el) {
        el.className = el.className.replace("selected", "");
    }*/
}

function open (el) {
    el.className += "show";
}

function setup (page) {
    
    return fetch(page.html).then(function(response) {
        return response.text();
    }).then(function (html) {
        const el = document.createElement("div");
        const button = document.getElementById("button-" + page.id);

        el.className = "hide";
        el.innerHTML = html;
        
        page.el = el;
        page.button = button;
        
        document.getElementById("content").appendChild(el);
        
        router
            .on(page.url, function () {
                deselect();
        
                button.className += "selected";
                open(el);
            }).resolve();
    });
    
}

/*
function open (url) {
    return getPage(url).then((html) => {
        content.innerHTML = html;
        gallery();
    });
}*/


// TODO: we need to load pages on DOM, and just hide and show.
// preload pages,
/*
function deselect () {
    const el = document.querySelector(".selected");
    
    if (el) {
        el.className = el.className.replace("selected", "");
    }
}*/

Promise.all(pages.map(setup)).then(gallery);

/*
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
*/

