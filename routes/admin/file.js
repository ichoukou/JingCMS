var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../../config/settings");
var adminFunc = require('../../service/adminFunc');
var system = require('../../util/system');
//------------------------------------------文件管理器开始
//文件管理界面（list）
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/file',settings.FILESLIST);
});


//文件夹列表查询
router.get('/list?:defaultUrl', function(req, res, next) {
    var params = url.parse(req.url,true);
    var path = params.query.filePath;
    if(!path){
        path =  settings.UPDATEFOLDER;
    }

    if(true){
        var filePath = system.scanFolder(path);
        //对返回结果做初步排序
        filePath.sort(function(a,b){return a.type == "folder" ||  b.type == "folder"});
        return res.json({
            rootPath : settings.UPDATEFOLDER,
            pathsInfo : filePath
        });
    }else{
        return res.json({});
    }
});


//文件删除
router.get('/del', function(req, res, next) {
    var params = url.parse(req.url,true);
    var path = params.query.filePath;
    if(true){
        if(path){
            system.deleteFolder(req, res, path,function(){
                res.end('success');
            });

        }else{
            res.end('您的请求不正确，请稍后再试');
        }
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});

//文件重命名
router.post('/rename', function(req, res, next) {
    var newPath = req.body.newPath;
    var path = req.body.path;
    if(true){
        if(path && newPath){
            system.reNameFile(req,res,path,newPath);
        }else{
            res.end('您的请求不正确，请稍后再试');
        }
    }else{
        res.end('对不起，您无权执行该操作！');
    }

});

//修改文件内容读取文件信息
router.get('/getFileInfo', function(req, res, next) {

    if(true){
        var params = url.parse(req.url,true);
        var path = params.query.filePath;
        if(path){
            system.readFile(req,res,path);
        }else{
            res.end('您的请求不正确，请稍后再试');
        }
    }else{
        return res.json({
            fileData : {}
        })
    }
});

//修改文件内容更新文件信息
router.post('/updateFileInfo', function(req, res, next) {
    var fileContent = req.body.code;
    var path = req.body.path;
    if(true){
        if(path){
            system.writeFile(req,res,path,fileContent);
        }else{
            res.end('您的请求不正确，请稍后再试');
        }
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});

//------------------------------------------文件管理器结束

module.exports = router;
