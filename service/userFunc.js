var orm = require('orm');

module.exports =  {
    list: function (startNum,limit,cb) {
        global.db.models.user.find({}).limit(limit).offset(startNum).run(function (err, docs) {
        	if(err)
        		console.log(err);
        	cb(docs);
		});
    },
    del:function (ids,cb) {
        global.db.models.user.find({id:ids}).remove(cb);
    },
    save:function (content,cb) {
        content['date']=Date.now();
        if(content['id']!="undefined"){
            global.db.models.user.get(content['id'],function (err,ag) {
                for(var p in content)
                    ag[p]=content[p];
                ag.save(function (err) {
                    cb(err);
                });
            });
        }
        else{
            global.db.models.user.create(content,cb);
        }
    },
    get:function (id,cb) {
       global.db.models.user.get(id,cb);
    },
};
