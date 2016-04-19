var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../../config/settings");

var adminFunc = require('../../service/adminFunc');

//系统用户组管理（list）
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/adminGroup',settings.ADMINGROUPLIST);
});

router.post("/save",function (req,res,next) {
    //TODO check power
    var content = req.body;
    content['power']=content['power'].toString();

    global.db.save("admin_group",content,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });     
});

router.get('/del?:defaultUrl', function(req, res, next) {
    var params = url.parse(req.url,true);
    var ids = [];
    var id = params.query.id;
    if(id){
        var ss = id.split(',');
        for(var i in ss){
            ids.push(ss[i]);
        }
    }
    global.db.del("admin_group",ids,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
});

router.get("/get/:key",function (req,res,next) {
    var targetId = parseInt(req.params.key);

    if(targetId>=0){
        global.db.get("admin_group",function (err,group) {
            if(err){
                res.next(err);
            }else{
                console.log("success!");
            //group['power'] = JSON.parse(group['power']);
            return res.json(group);
            }
        });
    }else{
        res.end(settings.system_illegal_param);
    }
});

//系统管理员用户组列表
router.get('/list?:defaultUrl',function (req,res,next) {    
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keyword = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        global.db.search("admin_group","name",keyword,startNum,limit,function (docs) {
            var pageInfo = {
                "totalItems" : docs.length,
                "currentPage" : currentPage,
                "limit" : limit,
                "startNum" : startNum,
            };
            return res.json({
                docs : docs,
                pageInfo : pageInfo
            });
        });
    }else{
        return res.json({});
    }
});

module.exports = router;
