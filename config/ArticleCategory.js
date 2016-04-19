
module.exports = function (db, cb) {
    db.define('article_category', {
        uid : { type: "number", default: 0 },
        name:  String,
        keywords : String,
        sortId : { type: "number", default: 1 }, // 排序 正整数
        parentID : { type: "text", default: "0" },
        state : { type: "text", default: "1" },  //是否公开 默认公开
        date: { type: "date", default: Date.now },
        defaultUrl : { type: "text", default: "" }, // 父类别的默认目录
        homePage : { type: "text", default: "ui" }, // 必须唯一
        sortPath : { type: "text", default: "0" }, //存储所有父节点结构
        comments : String
    });

    return cb();
};


