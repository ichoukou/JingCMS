/**
 */
 //广告位管理
module.exports = function (db, cb) {
    db.define('ad', {
        mkey : String, //广告位标识
        title:  String,
        category:  String, // friendlink表示友情链接，默认default为广告
        state : { type: "text", default: "1" }, // 广告状态，是否显示
        type: { type: "text", default: "0" }, // 展示形式 0文字 1图片
        date: { type: "date", default: Date.now },
        content: String, // 内容
    });
    return cb();
};


