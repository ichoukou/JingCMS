var orm = require('orm');

module.exports =  {
    list: function (startNum,limit,cb) {
        global.db.models.notice.find({}).limit(limit).offset(startNum).run(function (err, docs) {
        	if(err)
        		console.log(err);
        	cb(docs);
		});
    },
    del:function (ids,cb) {
        global.db.models.notice.find({id:ids}).remove(cb);
    },
    save:function (content,cb) {
    	global.db.models.notice.create({content:content},cb);
    },
};
