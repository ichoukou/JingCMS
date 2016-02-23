var orm = require("orm")
var settings = require("./settings");

module.exports = function (){
    return orm.connect(settings.MYSQL_URL, function(err, db) {
        if (err) return console.error('Connection error: ' + err);

        //管理员
        db.load('./AdminUser',function (err) {
            console.log(err);
        });
        //管理组
        db.load('./AdminGroup',function (err) {
            db.models.admingroup.sync(function(){});
        });

        db.load('./User',function (err) {
            console.log(err);
        });
        db.load('./Article',function (err) {
            console.log(err);
        });
        db.load('./ArticleCategory',function (err) {
            console.log(err);
        });

        db.load('./ArticleComment',function (err) {
            console.log(err);
        });

        //系统操作日志
        db.load('./SystemLog',function (err) {
            if(err)
                console.log(err);
            db.models.systemlog.sync(function () {});
        });

        //系统提醒
        db.load('./Notice',function (err) {
            if(err)
                console.log(err);
            db.models.notice.sync(function () {});
        });


        //用户评论关系
        db.models.articlecomment.hasOne("author", db.models.user);
        db.models.articlecomment.hasOne("article", db.models.article);
        db.models.articlecomment.hasOne("replayauthor", db.models.user);
        db.models.articlecomment.hasOne("adminauthor", db.models.adminuser);
        db.models.articlecomment.sync(function () {});


        var User    = db.models.user;
        var Article = db.models.article;

        //define relationships
        Article.hasOne('author', User);

        User.sync(function () {});

        Article.sync(function () {
        });

        db.models.adminuser.sync(function () {
        });
        db.models.article_category.sync(function () {
        });

        // var User = db.models.adminuser;
        // User.find({ name: "test" }, function (err, people) {
        //             if (err) throw err;
        //             console.log("People found: %d", people.length);
        //             console.log("First person: %s, age %d", people[0].name, people[0].password);
        //         });

        // User.sync(function () {
        //      // created tables for Person model
        // });

        // User.create({name: "test", password: "test" }, function(err) {
        //         if (err) throw err;
        //         User.find({ name: "test" }, function (err, people) {
        //             if (err) throw err;
        //             console.log("People found: %d", people.length);
        //             console.log("First person: %s, password %s", people[0].name, people[0].password);
        //         });
        //     });
        
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

