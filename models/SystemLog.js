/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('systemlog', {
	    type : String,
	    log : String,
        date: { type: "date", default: Date.now },
	});
    return cb();
};
