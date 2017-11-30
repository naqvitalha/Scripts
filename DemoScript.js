var fileref=document.createElement('script');
fileref.setAttribute("type","text/javascript");
fileref.setAttribute("src", "http://yourjavascript.com/101317231712/fkext-browser-min.js");
var head = document.getElementsByTagName('head')[0];
head.insertBefore(fileRef, head.firstChild);  


var doOnce = false;
setInterval(function() {
    if (window.location.href.startsWith("https://www.makemytrip.com/pwa/flight-traveller-details")) {
        var item = document.getElementsByClassName("continue_btn");
        if (item.length > 0) {
            item[0].onclick = function() {
                alert("Hello");
            };
        }
    }
    if(window.location.href === "https://www.makemytrip.com/"){

    }
}, 500);
