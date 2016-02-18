module.exports = function (db, cb) {
    db.define('adminuser', {
        name : String,
        password: String,
        logo: { type: "text", default: "/upload/images/defaultlogo.png" },
        email : String,
	    phoneNum : Number,
	    comments : String,
    });
    return cb();
};