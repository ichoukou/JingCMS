/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('admingroup', {
        name:  String,
        power: { type: "text", size: 10000 },
    });
    return cb();
};
