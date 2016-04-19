module.exports = function (db, cb) {
    db.define('admin_user', {
        name : String,
        password: String,
        logo: { type: "text", default: "/upload/images/defaultlogo.png" },
        email : String,
	    phoneNum : Number,
	    comments : String,
    });
    return cb();
};