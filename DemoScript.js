var fileref = document.createElement("script");
fileref.setAttribute("type", "text/javascript");
fileref.setAttribute("src", "https://cdn.rawgit.com/naqvitalha/Scripts/master/fkext-browser-min.js");
var head = document.getElementsByTagName("head")[0];
head.insertBefore(fileref, head.firstChild);

var platform;
var moduleManager;
setInterval(function() {
    if (platform) {
        if (window.location.href.startsWith("https://www.makemytrip.com/pwa/flight-traveller-details")) {
            var item = document.getElementsByClassName("continue_btn");
            if (item.length > 0) {
                item[0].onclick = function() {
                    moduleManager.getNavigationModule().startPayment("PN00171130103626313a84c6429d458fe8ce7d96e9600154_v1_UNCRN");
                };
            }
        }
    } else {
        if (window.FKExtension) {
            platform = FKExtension.newPlatformInstance("mmt");
            moduleManager = platform.getModuleHelper();
            var lastTime = window.localStorage.getItem("lastTS");

            if (lastTime) {
                var diff = new Date().getTime() - parseInt(lastTime);
                if(diff > 60000) {
                    moduleManager.getPermissionsModule().getToken(["user.email"]);
                }
            }
            else {
                moduleManager.getPermissionsModule().getToken(["user.email"]);                
            }
            window.localStorage.setItem("lastTS", new Date().getTime() + "");
        }
    }
}, 500);
