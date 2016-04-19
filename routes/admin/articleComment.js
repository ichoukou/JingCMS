var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../../config/settings");
var adminFunc = require('../../service/adminFunc');

router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleComment',settings.MESSAGEMANAGE);
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

        global.db.list('article_comment',startNum,limit,function (docs) {
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
