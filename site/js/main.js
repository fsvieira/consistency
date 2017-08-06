const Navigo = require("navigo");

const router = new Navigo(null, true, '#!');

// const cache = {templates: {}};

const content = document.getElementById("content");

const gallery = require("./gallery");

const pages = [
    {id: 'play', 'url': '/play', html: 'site/pages/play.html'},
    {id: 'contribute', 'url': '/contribute', html: 'site/pages/contribute.html'},
    {id: 'credits', 'url': '/credits', html: 'site/pages/credits.html'},
    {id: 'pepperandcarrot', 'url': '/pepperandcarrot', html: 'site/pages/pepperandcarrot.html'},
    {id: 'root', 'url': '/', html: 'site/pages/about.html'}
];


function deselect () {
    pages.forEach(function (page) {
        if (page.el) {
           page.el.className = "hide"; 
           page.button.className = page.button.className.replace("selected", ""); 
        }
    });
}

function open (el, button) {
    el.className += "show";
    button.className += "selected";
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
        
        content.appendChild(el);
        
        router
            .on(page.url, function () {
                deselect();
                open(el, button);
            }).resolve();
    });
    
}

Promise.all(pages.map(setup)).then(gallery);
