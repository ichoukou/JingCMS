var express = require('express');
var router = express.Router();
var url = require('url');
var http = require('http');
var request = require('request');
var fs = require('fs');
var shortid = require('shortid');

//系统缓存
var cache = require("../../util/cache");

//系统配置
var settings = require("../../config/settings");
var adminFunc = require('../../service/adminFunc');
var system = require('../../util/system');

//模板配置
router.get('/', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleTemplate',settings.CONTENTTEMPSCONFIG);
});

//可用主题
router.get('/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        global.db.find('article_template',{using:1},startNum,limit,function (docs) {
            console.log(docs);
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

//获取已安装的所有模板
router.get('/tempFolderList', function(req, res, next) {
    if(true){
        global.db.all('article_template',function (docs) {
            return res.json(docs);
        });

        /*ContentTemplate.find({}).sort({using : -1}).populate('items').exec(function(err,docs){
            if(err){
                res.end(err);
            }else{
                return res.json(docs);
            }
        });*/
    }else{
        return res.json({});
    }

});

//读取模板文件夹信息
router.get('/folderList', function(req, res, next) {
    var params = url.parse(req.url,true);
    var targetForder = params.query.defaultTemp;
    var filePath = system.scanJustFolder(settings.SYSTEMTEMPFORDER + targetForder);
    var newFilePath = [];
    for(var i=0;i<filePath.length;i++){
        var fileObj = filePath[i];
        if(fileObj.name.split('-')[1] == 'stage'){
            newFilePath.push(fileObj);
        }
    }
    //对返回结果做初步排序
    newFilePath.sort(function(a,b){return a.type == "folder" ||  b.type == "folder"});

    return res.json(newFilePath);
});

//安装模板 包含1、从服务器下载安装包 2、解压缩到本地目录 3、入库
router.get('/installTemplate',function(req,res,next){
    if(true){
        // App variables
        var params = url.parse(req.url,true);
        var tempId = params.query.tempId;

        var tpl_url = settings.DORACMSAPI + '/system/template/getItem?tempId=' + tempId;
        request(tpl_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var tempObj = JSON.parse(body);
                console.log(body);

                var file_url = tempObj.filePath;
                var file_targetForlder = tempObj.alias;
                var DOWNLOAD_DIR = settings.SYSTEMTEMPFORDER + file_targetForlder.trim()+'/';
                var target_path = DOWNLOAD_DIR + url.parse(file_url).pathname.split('/').pop();

                if( fs.existsSync(DOWNLOAD_DIR) ) {
                    res.end('您已安装该模板');
                }

                fs.mkdir(DOWNLOAD_DIR,0777,function(err){
                    if(err){
                        console.log(err);
                    }
                    else {
                        download_file_httpget(file_url,function(){
                            console.log("开始下载");
                            //下载完成后解压缩
                            var extract = unzip.Extract({ path:  DOWNLOAD_DIR });
                            extract.on('error', function(err) {
                                console.log(err);
                                //解压异常处理
                            });
                            extract.on('finish', function() {
                                console.log("解压完成!!");

                                var ti = {
                                    folder:"2-stage-default",
                                    name:'默认模板',
                                    isDefault:true,
                                };
                                global.db.models.article_template_item.create(ti,function(err,ti){
                                    if(err){res.end(err);}
                                    tempObj.item=[];
                                    tempObj.item.push(ti);
                                    global.db.models.article_template.create(tempObj,function(err,tpl){
                                         if(err){res.end(err);}
                                         else{
                                            res.end('success');
                                         }
                                    });
                                });
                            });
                            fs.createReadStream(target_path).pipe(extract);
                        });
                    }
                });

                var download_file_httpget = function(file_url,callBack) {
                    var options = {
                        host: url.parse(file_url).host,
                        port: 80,
                        path: url.parse(file_url).pathname
                    };

                    var file_name = url.parse(file_url).pathname.split('/').pop();
                    var file = fs.createWriteStream(DOWNLOAD_DIR + file_name);

                    http.get(options, function(res) {
                        res.on('data', function(data) {
                            file.write(data);
                        }).on('end', function() {
                            file.end();
                            callBack(DOWNLOAD_DIR);
                        });
                    });
                };
            }
            else{
                res.end("网络出错"+error);
            }
        });
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});

//启用模板
router.get('/enableTemplate',function(req,res){
    var params = url.parse(req.url,true);
    var tempId = params.query.tempId;
    var alias = params.query.alias;

    if(true){
        var tempPath = system.scanJustFolder(settings.SYSTEMTEMPFORDER + alias);
        var distPath = false;
        for(var i=0;i<tempPath.length;i++){
            var fileObj = tempPath[i];
            if(fileObj.name == 'dist'){
                distPath = true;
                break;
            }
        }

        //服务器配置不同解压缩时间有所差异，暂时用该办法控制
        if(!distPath){
            res.end('服务器正在解压缩，请10s后重试！')
        }else{
            ContentTemplate.setTempState('',false,function(err){
                if(err){
                    res.end(err);
                }else{
                    ContentTemplate.setTempState(tempId,true,function(err1,doc){
                        if(err1){
                            res.end(err1);
                        }else{
                            //复制静态文件到公共目录
                            var fromPath = settings.SYSTEMTEMPFORDER + doc.alias + '/dist/';
                            var targetPath = settings.TEMPSTATICFOLDER + doc.alias;
                            system.copyForder(fromPath,targetPath);
                            ContentTemplate.getDefaultTemp(function(temp){
                                if(temp){
                                    cache.set(settings.session_secret + '_siteTemplate', temp , 1000 * 60 * 60 * 24); // 修改默认模板缓存
                                }
                                //重置类别模板
                                ContentCategory.update({},{$set:{contentTemp:''}},{multi : true},function(err2){
                                    if(err2){
                                        res.end(err2);
                                    }else{
                                        res.end('success');
                                    }
                                });

                            });
                        }
                    })
                }
            })
        }
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});

//添加模板单元
router.post('/addNewTemplateItem',function(req,res){
    var params = url.parse(req.url,true);
    var defaultTemp = params.query.defaultTemp;

    if(true){
        global.db.save('article_template_item',req.body,function(err,item){
            if(err){
                res.end(err);
            }else{
                global.db.find('article_template',{alias:defaultTemp},0,1000,function(doc){
                    console.log(doc);
                    
                    //设置template
                    item.setTemplate(doc);
                    global.db.save('article_template_item',item,function(err){
                        if(err)console.log(err);
                    });

                    //设置template item
                    if(doc){
                        if(doc.length>1){
                            doc=doc[0];
                        }
                        doc.items.push(item);
                        doc.save(function(err1){
                            if(err1){
                                res.end(err1);
                            }else{
                                 // 修改默认模板缓存
                                cache.set(settings.session_secret + '_siteTemplate', doc , 1000 * 60 * 60 * 24);
                                res.end('success');
                            }
                        });
                    }else{
                        res.end(settings.system_illegal_param);
                    }
                });
            }
        });
    }else{
        res.end('对不起，您无权执行该操作！');
    }

});
//删除模板单元
router.get('/delTemplateItem?:defaultUrl',function(req,res){
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;
    console.log(targetId);
    if(parseInt(targetId)>0){
        global.db.find('article_template_item',{id : targetId},0,10000,function(item){
            console.log(item);
            var tmpid=item[0].template?item[0].template.id:item[0].template_id;
            console.log("template_id:"+tmpid);
            global.db.find('article_template',{id : tmpid},0,10000,function(temp){
            console.log("find:"+temp);
                if(temp){
                    temp=temp[0];
                    temp.getItems(function(err,items){
                        console.log("err:"+err)
                        console.log("getItems:"+items);
                        //var items = temp.items;
                        
                        for(var i=0;i<items.length;i++){
                            console.log(items[i]);
                            if(items[i].id == targetId){
                                items[i].remove(function(err){
                                    if(err)console.log(err);
                                });
                                items.splice(i,1);
                                break;
                            }
                        }
                        console.log("before save items"+temp);
                        temp.items = items;

                        temp.save(function(err){
                            if(err){
                                res.end(err);
                            }else{
                                // 修改默认模板缓存
                                //cache.set(settings.session_secret + '_siteTemplate', temp , 1000 * 60 * 60 * 24); 
                                res.end("success");
                            }
                        });


                    });
                }
            });
        });
    }else{
        res.end(settings.system_illegal_param);
    }
});


//删除指定模板
router.get('/del?:defaultUrl',function(req,res){
    var params = url.parse(req.url,true);
    var targetId = params.query.uid;

    if(parseInt(targetId)>0){
        global.db.find('article_template',{'id':targetId},function(err,doc){
            if(err){
                res.end(err);
            }else{
                if(doc){
                    /*
                    var items = doc.items;
                    items.foreach(function(item){
                        item.remove(function (err) {
                            if(err)
                                console.log(err);
                            else
                                console.log("removed!");
                        });
                    });
                    */

                    //删除模板文件夹
                    var tempPath = settings.SYSTEMTEMPFORDER + doc.alias;
                    var tempStaticPath = settings.TEMPSTATICFOLDER + doc.alias;

                    console.log(tempPath);
                    console.log(tempStaticPath);

                    global.db.del('article_template',{'id':targetId},function(err){
                        if(err){
                            res.end(err);
                        }else{
                            console.log("del folder");
                             res.end('success');
                            /*delete folder
                            system.deleteFolder(req, res,tempPath,function(){
                                system.deleteFolder(req, res,tempStaticPath,function(){
                                    res.end('success');
                                });
                            });
                            */
                        }
                    });
                }else{
                    res.end(settings.system_illegal_param);
                }
            }
        })

    }else{
        res.end(settings.system_illegal_param);
    }
});


//模板编辑
router.get('/edit', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleTemplateEdit',settings.CONTENTTEMPSEDIT);
});


router.get('/tempListByFolder', function(req, res, next) {
    var params = url.parse(req.url,true);
    var targetTemp = params.query.targetTemp;
    if(true){
        if(targetTemp == 'undefined'){
            //ContentTemplate.getDefaultTemp(function(temp){
            global.db.find("article_template",{using:true},0,100000,function(temp){
                if(temp){
                    console.log(temp);
                    temp=temp[0];
                    var tempTree = setTempData(temp.alias);
                    return res.json(tempTree);
                }else{
                    return res.json({});
                }
            });
        }else{
            var tempTree = setTempData(targetTemp);
            return res.json(tempTree);
        }

    }else{
        return res.json({});
    }

});

function setTempData(targetTemp){
    console.log("targetTemp:"+targetTemp);
    var tempTree = [];
    tempTree.push({
        id : 'public',
        pId:0,
        name:"公用模块",
        open:false
    });
    tempTree.push({
        id : 'users',
        pId:0,
        name:"用户模块",
        open:true
    });
    tempTree.push({
        id : 'styles',
        pId:0,
        name:"模板样式",
        open:true
    });
    tempTree.push({
        id : 'js',
        pId:0,
        name:"模板js",
        open:true
    });
    //读取ejs模板
    var defaultfolder = settings.SYSTEMTEMPFORDER + targetTemp;

    var newPubPath = adminFunc.setTempParentId(system.scanFolder(defaultfolder + "/public"),'public');
    var newUserPath = adminFunc.setTempParentId(system.scanFolder(defaultfolder + "/users"),'users');
    newPubPath = newPubPath.concat(newUserPath);
    //读取静态文件
    if( fs.existsSync(settings.TEMPSTATICFOLDER + targetTemp) ) {
        var newStylePath = adminFunc.setTempParentId(system.scanFolder(settings.TEMPSTATICFOLDER + targetTemp + "/css"),'styles');
        var newJsPath = adminFunc.setTempParentId(system.scanFolder(settings.TEMPSTATICFOLDER + targetTemp + "/js"),'js');
        newPubPath = newPubPath.concat(newStylePath).concat(newJsPath)
    }
    //读取模板单元
    var filePath = system.scanJustFolder(settings.SYSTEMTEMPFORDER + targetTemp);
    var tempUnit = [];
    tempUnit.push({
        id : 'tempUnit',
        pId:0,
        name : '模板单元',
        open:true
    });
    for(var i=0;i<filePath.length;i++){
        var fileObj = filePath[i];
        if(fileObj.name.split('-')[1] == 'stage'){
            tempUnit.push({
                id : fileObj.name,
                pId: 'tempUnit',
                name : fileObj.name,
                open:true
            });
            var unitArr = system.scanFolder(settings.SYSTEMTEMPFORDER + targetTemp + '/' + fileObj.name);
            var newUnitArr = adminFunc.setTempParentId(unitArr,fileObj.name);
            tempUnit = tempUnit.concat(newUnitArr);
        }
    }
    if(tempUnit.length > 0){
        newPubPath = newPubPath.concat(tempUnit);
    }

    //读取根目录下的所有文件
    var rootArr = system.scanFolder(settings.SYSTEMTEMPFORDER + targetTemp);
    var newRootArr = [];
    for(var j=0;j<rootArr.length;j++){
        var rootObj = rootArr[j];
        if(rootObj.type == 'ejs'){
            var rootFile = adminFunc.setTempParentId(rootObj,0);
            newRootArr.push(rootFile);
        }
    }
    if(newRootArr.length > 0) {
        newPubPath = newPubPath.concat(newRootArr);
    }

    tempTree = tempTree.concat(newPubPath);
    tempTree.sort();
    return tempTree;
}


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

//--------------------文章管理结束-----------------------------

module.exports = router;
