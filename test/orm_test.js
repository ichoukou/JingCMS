var orm = require("orm")

var url = 'mysql://root:root@localhost/express';
db = orm.connect(url, function(err, db) {
        if (err) return console.error('Connection error: ' + err);

        // var User = db.define("user", {
        //     name : String,
        //     password : String
        // });

        // User.sync(function () {
        //         // created tables for Person model
        //     });

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

db.define("user", {
             name : String,
             password : String
         });

console.log(db);
console.log(db.models);