var express = require('express');
var router = express.Router();
var url = require('url');
var moment = require('moment');
var fs = require("fs");
var unzip = require("unzip");

//系统配置
var settings = require("../../config/settings");
var adminFunc = require('../../service/adminFunc');
var system = require('../../util/system');
var child = require('child_process');
var archiver = require('archiver');
var unzip = require('unzip');

//---------------------备份管理器开始-------------------
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/backup',settings.BACKUPDATA);
});

router.get('/list?:defaultUrl', function(req, res, next) {
    var params = url.parse(req.url,true);
    var keywords = params.query.searchKey;
    var area = params.query.area;
    var limit = Number(params.query.limit);
    var currentPage = Number(params.query.currentPage);
    var startNum = (currentPage - 1)*limit ;

    if(true){
        var filePath = system.scanFolder(settings.BACKUPDIR);

        //对返回结果做初步排序
        filePath.sort(function(a,b){return a.type == "folder" ||  b.type == "folder"});
        
        //对返回结果做分页
        var pageInfo = {
            "totalItems" : filePath.length,
            "currentPage" : currentPage,
            "limit" : limit,
            "startNum" : startNum,
        };
        filePath=filePath.slice(startNum, startNum+limit);

        return res.json({
            docs : filePath,
            pageInfo : pageInfo
        });
    }else{
        return res.json({});
    }
});

//恢复数据库
router.get('/restore', function(req, res, next) {
    if(true) {
        var params = url.parse(req.url,true);
        var name = params.query.name;
        var zipfile = settings.BACKUPDIR+name;
        var sqlfile = name.substr(0,name.length-4);
        var sqldir = "./restore/";
        fs.createReadStream(zipfile).pipe(unzip.Extract({ path: sqldir }));
        var cmdstr = "mysqldump -u"+settings.USERNAME+" -p"+settings.PASSWORD+" "+settings.DB+"<"+sqldir+sqlfile;

        child.exec(cmdstr,function (error, stdout, stderr) {
            if (error !== null) {
                console.log('exec error: ' + error);
                res.end("恢复备份出错:"+error);
            }else{
                system.deleteFolder(req,res,sqldir,function(){
                    res.end('success');
                });
            }
        });

    }else{
        res.end('对不起，您无权执行该操作！');
    }
});



//备份数据库执行
router.get('/backup', function(req, res, next) {
    if(true) {
        var date = new Date();
        var ms = moment(date).format('YYYYMMDDHHmmss').toString();
        var dataPath = settings.BACKUPDIR+ms+".sql";

        var cmdstr = "mysqldump -u"+settings.USERNAME+" -p"+settings.PASSWORD+" "+settings.DB+" >"+dataPath;
        
        if(!fs.existsSync(settings.BACKUPDIR)){
            fs.mkdirSync(settings.BACKUPDIR);
        }
        if (fs.existsSync(dataPath)) {
            res.end('已经创建过备份了');
        } else {
            child.exec(cmdstr,function (error, stdout, stderr) {
                if (error !== null) {
                    console.log('exec error: ' + error);
                    res.end("备份出错:"+error);
                }else{
                    //生成压缩文件
                    var output = fs.createWriteStream(dataPath +'.zip');
                    var archive = archiver('zip');

                    archive.on('error', function(err){
                        console.log("archiver error");
                        throw err;
                    });

                    archive.pipe(output);
                    archive.append(fs.createReadStream(dataPath),{'name': ms+".sql"});
                    archive.finalize();
                    system.deleteFolder(req, res,dataPath,function(){
                        res.end('success');
                    });
                }
            });
        }
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});

//备份数据记录删除
router.get('/del', function(req, res, next) {
    var params = url.parse(req.url,true);
    var forderPath = params.query.filePath;
    var targetId = params.query.uid;
    if(true){
        if(true){
            if(forderPath){
                system.deleteFolder(req, res,forderPath,function(){
                    res.end('success');
                });
            }else{
                res.end("删除出错");
            }
        }else{
            res.end('对不起，您无权执行该操作！');
        }
    }else{
        res.end(settings.system_illegal_param);
    }
});

//------------------数据备份结束------------------
module.exports = router;
