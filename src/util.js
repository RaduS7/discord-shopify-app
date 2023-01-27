function getShopId(url) {
    while (url.indexOf("\"") != -1 || url.indexOf("\'") != -1) {
        url = url.replace("\"", "");
        url = url.replace("\'", "");
    }

    var prefix1 = "//";
    var prefix2 = "://";
    var sufix = ".myshopify.com";
    var shopId;
    if (url.startsWith(prefix1) || url.indexOf(prefix2) != -1) {
        if (url.indexOf(prefix2) != -1) {
            shopId = url.substr(url.indexOf(prefix2) + prefix2.length, url.indexOf(sufix) - (url.indexOf(prefix2) + prefix2.length));
        } else if (url.startsWith(prefix1)) {
            shopId = url.substr(url.indexOf(prefix1) + prefix1.length, url.indexOf(sufix) - (url.indexOf(prefix1) + prefix1.length));
        }
    } else {
        shopId = url.substr(0, url.indexOf(sufix));
    }
    return shopId
}

//console.log(getShopId("\"\"\'gigi\'\"\'.fi\'fi.myshopify.com\""));

module.exports = getShopId