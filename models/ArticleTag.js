/**
 */
 //广告位管理
module.exports = function (db, cb) {
    db.define('article_tag', {
        name:  String,
        alias : String, //别名
        date: { type: "date", default: Date.now },
        comments : String
    });
    return cb();
};


