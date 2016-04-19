var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../models/settings");
var adminFunc = require('../service/adminFunc');

//文档类别列表页面
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleCategory',settings.CONTENTCATEGORYS);
});

//文档添加类别
router.post('/addCate', function(req, res, next) {
    var content = req.body;
    global.db.save('article_Category',content,function(err){
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
});

//文档
router.post('/getCate', function(req, res, next) {
    var params = url.parse(req.url,true);
    var id = params.query.id;
    
    global.db.get('article_category',id,function(cate){
        if(cate){
            res.json(cate);
        }else{
            res.json({});
        }
    });
});

//文章类别列表
router.get('/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var limit=100;
        if(params.query.limit){
            limit=Number(params.query.limit);    
        }
        var currentPage=1;
        if(params.query.currentPage){
            currentPage=Number(params.query.currentPage);   
        } 
        var startNum = (currentPage - 1)*limit ;
        global.db.list('article_category',startNum,limit,function (docs) {
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

//------------------------------------------文档标签开始

module.exports = router;
