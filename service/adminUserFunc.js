var orm = require('orm');

module.exports =  {
    listSystemLog: function (startNum,limit,cb) {
        global.db.models.adminuser.find({}).limit(limit).offset(startNum).run(function (err, docs) {
        	if(err)
        		console.log(err);
        	cb(docs);
		});
    },
    del:function (ids,cb) {
        global.db.models.adminuser.find({id:ids}).remove(cb);
    },
    save:function (content,cb) {
    	global.db.models.adminuser.create({content:content},cb);
    },
};
