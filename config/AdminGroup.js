/**
 * Created by Administrator on 2015/4/11.
 */
 //管理员组
 module.exports = function (db, cb) {
    db.define('admin_group', {
        name:  String,
        power: { type: "text", size: 10000 },
    });
    return cb();
};
