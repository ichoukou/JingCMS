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

        db.load('./Comment',function (err) {
            console.log(err);
        });

        //系统操作日志
        db.load('./SystemLog',function (err) {
            if(err)
                console.log(err);
            db.models.systemlog.sync(function () {});
        });

        var User    = db.models.user;
        var Article = db.models.article;
        var Comment = db.models.comment;

        //define relationships
        Article.hasOne('author', User);
        Comment.hasOne('author', User);
        Comment.hasOne('article', Article);

        User.sync(function () {});

        Article.sync(function () {
        });

        Comment.sync(function () {
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

