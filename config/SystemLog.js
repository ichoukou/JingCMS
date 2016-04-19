/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('system_log', {
	    type : String,
	    log : String,
        date: { type: "date", default: Date.now },
	});
    return cb();
};
