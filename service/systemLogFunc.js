var orm = require('orm');

module.exports =  {
    listSystemLog: function (startNum,limit,cb) {
        global.db.models.systemlog.find({}).limit(limit).offset(startNum).run(function (err, docs) {
        	if(err)
        		console.log(err);
        	cb(docs);
		});
    },
    del:function (logid,cb) {
        global.db.models.systemlog.find({id:logid}).remove(cb);
    },
    save:function (content,cb) {
    	global.db.models.systemlog.create({content:content},cb);
    },
    saveCate:function (req,cb) {
    	var content = req.body;
        console.log(content);
        var artCate = new global.db.models.article_category(content);
    	artCate.save(cb);
    },
    listCate:function (cb) {
       global.db.models.article_category.all(function (err, cates) {
            if(err)
                console.log(err);
            cb(cates);
        });
    },
    getCate:function (id,cb) {
       global.db.models.article_category.find({id:id},function (err, cate) {
            if(err)
                console.log(err);
            cb(cate);
        });
    },
};
