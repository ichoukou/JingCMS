var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../models/settings");
var adminFunc = require('../service/adminFunc');

//--------------------用户管理-----------------------------
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/user',new Array("manage_user","用户管理"));
});

//获得用户列表，分页
router.get('/list?:defaultUrl',function (req,res,next) {
    var params = url.parse(req.url,true);
    var keywords = params.query.searchKey;
    var area = params.query.area;
    var limit = Number(params.query.limit);
    var currentPage = Number(params.query.currentPage);
    var startNum = (currentPage - 1)*limit ;

    global.db.list('user',startNum,limit,function (docs) {
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
});

//获得用户信息
router.get("/get/:key",function (req,res,next) {
    var targetId = parseInt(req.params.key);
    if(targetId>=0){
        global.db.get('user',targetId,function (err,data) {
            if(err){
                console.log(err);
                res.end(err);
            }else{
                console.log(data);
                return res.json(data);
            }
        });
    }else{
        res.end(settings.system_illegal_param);
    }
});

//保存或者更新用户
router.post('/save/', function(req, res, next) {
    var user = req.body;
    global.db.save('user',user,function(err){
        console.log(err);
        if(err){
            res.end("error");
        }else{
            res.end("success");
        }
    });
});
//--------------------用户管理结束-----------------------------

module.exports = router;
