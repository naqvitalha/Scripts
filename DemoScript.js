var fileref = document.createElement("script");
fileref.setAttribute("type", "text/javascript");
fileref.setAttribute("src", "https://cdn.rawgit.com/naqvitalha/Scripts/master/fkext-browser-min.js");
var head = document.getElementsByTagName("head")[0];
head.insertBefore(fileref, head.firstChild);

var platform;
var moduleManager;
var permissions = ["user.email", "user.dob", "user.name", "user.gender", "user.phone"];
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
            console.log("lastTS: ", lastTime)
            if (lastTime) {
                var diff = new Date().getTime() - parseInt(lastTime);
                console.log("difff: ", diff)
                if(diff > 30000) {
                    console.log("diff: ", true);
                    window.localStorage.setItem("lastTS", new Date().getTime() + "");                     
                    moduleManager.getPermissionsModule().getToken(permissions);
                }
            }
            else {
                moduleManager.getPermissionsModule().getToken(permissions);                
                window.localStorage.setItem("lastTS", new Date().getTime() + ""); 
            }
        }
    }
}, 500);
