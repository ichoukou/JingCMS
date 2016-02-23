var orm = require('orm');

module.exports =  {
    list: function (startNum,limit,cb) {
        var searchKey='';
        global.db.models.article.find({content:orm.like("%"+searchKey+"%")}).limit(limit).offset(startNum).run(function (err, docs) {
        	if(err)
        		console.log(err);
        	cb(docs);
		});
    },
    save:function (content,cb) {
    	global.db.models.article.create({content:content},cb);
    },
    saveCate:function (req,cb) {
    	var content = req.body;
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
    listComment:function (startNum,limit,cb) {
        var searchKey='';
        global.db.models.articlecomment.find({content:orm.like("%"+searchKey+"%")}).limit(limit).offset(startNum).run(function (err, docs) {
            if(err)
                console.log(err);
            cb(docs);
        });
    },

};
