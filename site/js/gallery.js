function clearSelections (images) {
    images.forEach(function (img) {
        img.className = img.className
                .replace("selected", "")
                .replace("back", "")
                .replace("next", "").trim();
    });
}


function toggleGallery (gallery) {
    if (gallery.className.indexOf("big") !== -1) {
        gallery.className = gallery.className.replace("big", "").trim();
    }
    else {
        gallery.className += " big";
    }
}

function gallery () {
    document.querySelectorAll(".gallery").forEach(function (gallery) {
        const images = gallery.querySelectorAll(".image");
        var selected = 0;

        gallery.onclick = function () {
            toggleGallery(gallery);
        };
        
        clearSelections(images);

        images[0].className += " selected";
        if (images.length > 1) {
            images[1].className += " next";
        }
        
        images.forEach(function (img, index) {
            img.onclick = function (event) {
                event.preventDefault();
                event.stopPropagation();
                
                if (index !== selected) {
                    clearSelections(images);

                    selected = index;
                    
                    if (index > 0) {
                        images[index-1].className += " back";    
                    }
                    
                    if (index < images.length-1) {
                        images[index+1].className += " next";
                    }
                    
                    img.className += " selected";                
                }
                else {
                    toggleGallery(gallery);
                }
            };
        });
    });
    
}

module.exports = gallery;


