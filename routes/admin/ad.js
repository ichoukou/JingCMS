var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../../config/settings");
var adminFunc = require('../../service/adminFunc');

//----------------文章管理开始-------------------
//广告管理列表页面
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/ad',settings.ADSLIST);
});

//广告添加页面
router.get('/add', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/editAd',settings.ADSLIST);
});

//广告编辑页面
router.get('/edit/:content', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/editAd',settings.ADSLIST);
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
    global.db.del("ad",ids,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
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

        global.db.list("ad",startNum,limit,function (docs) {
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

//--------------------文章管理结束-----------------------------

module.exports = router;
