var crypto = require("crypto");
var validator = require("validator");


var Util = {
   encrypt : function(data,key){ // 密码加密
        var cipher = crypto.createCipher("bf",key);
        var newPsd = "";
        newPsd += cipher.update(data,"utf8","hex");
        newPsd += cipher.final("hex");
        return newPsd;
    },
    decrypt : function(data,key){ //密码解密
        var decipher = crypto.createDecipher("bf",key);
        var oldPsd = "";
        oldPsd += decipher.update(data,"hex","utf8");
        oldPsd += decipher.final("utf8");
        return oldPsd;
    }
};
//自定义校验扩展
validator.extend('isUserName', function (str) {
    return true;
    return /^[a-zA-Z][a-zA-Z0-9_]{4,11}$/.test(str);
});

validator.extend('isGBKName', function (str) {
    return /[\u4e00-\u9fa5]/.test(str);
});

validator.extend('isPsd', function (str) {
    return true;
    return /(?!^\\d+$)(?!^[a-zA-Z]+$)(?!^[_#@]+$).{3,}/.test(str);
});

validator.extend('isQQ', function (str) {
    return RegExp(/^[1-9][0-9]{4,9}$/).test(str);
});

//只能是英文
validator.extend('isEn', function (str) {
    return /^\S+[a-z A-Z]$/.test(str);
});

module.exports = Util;

