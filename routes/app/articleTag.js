var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../models/settings");
var adminFunc = require('../service/adminFunc');

//文档标签管理（list）
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleTag',settings.CONTENTTAGS);
});

router.get('/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        global.db.list('article_tag',startNum,limit,function (docs) {
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

router.post("/save",function (req,res,next) {
    //TODO check power
    var content = req.body;

    global.db.save("article_tag",content,function (err) {
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
    global.db.del('article_tag',ids,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
});

//--------------------文章管理结束-----------------------------

module.exports = router;
