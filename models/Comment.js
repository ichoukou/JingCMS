/**
 * 留言管理
 */
 module.exports = function (db, cb) {
    db.define('comment', {
        content:String,
        date: { type: "date", default: Date.now }, // 留言时间
    });
    return cb();
};

