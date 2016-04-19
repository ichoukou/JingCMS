var orm = require("orm")
var settings = require("./settings");

module.exports = function (){
    orm.settings.set('connection.debug',true);
    return orm.connect(settings.MYSQL_URL, function(err, db) {
        if (err) 
            return console.error('Connection error: ' + err);

        //key:vale=文件名:数据库表名
        var models={
            AdminUser:"admin_user", //管理员
            AdminGroup:"admin_group", //管理组
            User:"user", //系统用户
            Article:"article", //文章
            ArticleCategory:"article_category", //分类
            ArticleComment:"article_comment", //评论
            ArticleTag:"article_tag", //评论
            ArticleTemplate:"article_template", //评论
            ArticleTemplateItem:"article_template_item", //评论
            Ad:"ad", //广告
            SystemLog:"system_log", //系统日志
            Notice:"notice", //系统消息
        };

        var model_dir="./"

        //--------------------加载模型---------------------------
        console.log("加载模型");
        for (var file in models){
            db.load(model_dir+file,function (err) {
                if(err) console.log(err);
            });
        }

        //--------------------定义模型关系-------------------------
        //评论与用户关系
        db.models.article_comment.hasOne("author", db.models.user);
        db.models.article_comment.hasOne("article", db.models.article);
        db.models.article_comment.hasOne("replayauthor", db.models.user);
        db.models.article_comment.hasOne("adminauthor", db.models.admin_user);

        //文章与用户关系
        db.models.article.hasOne('author', db.models.user);

        //文章模板与组件关系
        db.models.article_template_item.hasOne("template", db.models.article_template,{reverse:"items",autoFetch:true});

        //-------------同步模型---------------------
        for (var file in models){
            db.models[models[file]].sync(function () {});
        }


        //------------------功能测试代码-------------------
        var ti = {
            folder:"2-stage-default",
            name:'默认模板',
            isDefault:true,
        }
        //var tempObj = new db.models.article_template;
        var tempObj={"name":"doraGallery","alias":"doraGallery","version":"v1.0.0","author":"doramart","filePath":"http://7xkr1n.com1.z0.glb.clouddn.com/cmsSource20151231154844.zip","__v":0,"comment":"以前做的一款主题，适合做一些展示类的网站","downloadNum":211,"updateDate":"2015-12-31 07:49:16","state":true,"date":"2015-12-31 07:49:16","sImg":"http://7xkr1n.com1.z0.glb.clouddn.com/cmsSource20151231154837.jpg"}
        /*
        db.models.article_template_item.create(ti,function(err,ti){
            if(err){console.log(err);}
            tempObj.items=[];
            tempObj.items.push(ti);
            db.models.article_template.create(tempObj,function(err,tpl){
                 if(err){console.log(err);}
                 else{
                    console.log('success');
                 }
            });
        })
        */

        //--------------------定义常用方法---------------------------
        /**
        *根据column值进行检索
        */
        db.search=function (table,column,value,startNum,limit,cb) {
            var condition = {};
            condition[column]=orm.like("%"+value+"%");
            db.models[table].find(condition).limit(limit).offset(startNum).run(function (err, docs) {
                if(err)
                    console.log(err);
                cb(docs);
            });
        };

        db.find=function (table,condition,startNum,limit,cb) {
            db.models[table].find(condition).limit(limit).offset(startNum).run(function (err, docs) {
                if(err)
                    console.log(err);
                cb(docs);
            });
        };
        //db.search('user','name','t',0,100,function(docs){});

        db.get=function (table,id,cb) {
           db.models[table].get(id,cb);
        };

        db.list=function (table,startNum,limit,cb) {
            db.models[table].find({}).limit(limit).offset(startNum).run(function (err, docs) {
                if(err)
                    console.log(err);
                cb(docs);
            });
        };

        db.all=function (table,cb) {
            db.models[table].find({}).run(function (err, docs) {
                if(err)
                    console.log(err);
                cb(docs);
            });
        };

        db.del=function (table,condition,cb) {
            //{id:ids}
            db.models[table].find(condition).remove(cb);
        };

        db.save=function (table,content,cb) {
            if(content['id']){
                db.models[table].get(content['id'],function (err,ag) {
                    for(var p in content)
                        ag[p]=content[p];
                    ag.save(function (err) {
                        cb(err);
                    });
                });
            }
            else{
                db.models[table].create(content,cb);
            }
        };
        
        // db.drop(function () {
        //     User.create({name: "test", password: "test" }, function(err) {
        //         if (err) throw err;
        //         User.find({ name: "test" }, function (err, people) {
        //             if (err) throw err;
        //             console.log("People found: %d", people.length);
        //             console.log("First person: %s, age %d", people[0].name, people[0].password);
        //         });
        //     });
        // });
    });
}

