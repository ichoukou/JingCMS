var express = require('express');
var router = express.Router();
var url = require('url');

var Util = require('../util/Util');
var adminFunc = require('../service/adminFunc');
var adminUserFunc = require('../service/adminUserFunc');
var adminGroupFunc = require('../service/adminGroupFunc');
var articleFunc = require('../service/articleFunc');
var systemLogFunc = require('../service/systemLogFunc');
var noticeFunc = require('../service/noticeFunc');
var userFunc = require('../service/userFunc');

//文件操作
var PW = require('png-word');
var RW = require('../util/randomWord');
var rw = RW('abcdefghijklmnopqrstuvwxyz1234567890');
var pngword = new PW(PW.GRAY);

//数据校验
var validator = require('validator');
var shortid = require('shortid');

//系统配置
var settings = require("../models/settings");

var returnAdminRouter = function(io) {
    //管理员登录页面
    router.get('/', function(req, res, next) {
        req.session.vnum = rw.random(4);
        res.render('manage/adminLogin', { title: settings.SITETITLE , description : 'JingCMS后台管理登录'});
    });

    //管理员登录验证码
    router.get('/vnum',function(req, res){
        var word = req.session.vnum;
        pngword.createPNG(word,function(word){
            res.end(word);
        })
    });

    // 管理员登录提交请求
    router.post('/doLogin', function(req, res, next) {
        var userName = req.body.userName;
        var password = req.body.password;
        var vnum = req.body.vnum;
        var newPsd = Util.encrypt(password,settings.encrypt_key);

        console.log("doLogin");
        console.log(userName+password);

        if(vnum != req.session.vnum){
            req.session.vnum = rw.random(4);
            console.log("验证码有误！");
            res.end('验证码有误！');
        }else{
            if(validator.isUserName(userName) && validator.isPsd(password)){
                adminFunc.auth(userName,password,function (err, user) {
                    if(err){
                        res.end(err);
                    }
                    if(user.length>1){
                        console.log("存在重复用户");
                    }
                    if(user) {
                        console.log("登录成功");
                        //req.session.adminPower = user.group.power;
                        req.session.adminLogined = true;
                        req.session.adminUser = user[0];
                        req.session.adminUserInfo = user;

                        //获取管理员通知信息
                        // adminFunc.getAdminNotices(req,res,function(noticeObj){
                        //     req.session.adminNotices = noticeObj;
                        //     // 存入操作日志
                        //     SystemOptionLog.addUserLoginLogs(req,res,adminFunc.getClienIp(req));
                        //     res.end("success");
                        // });
                req.session.adminNotices = "";
                res.end("success");
            }else{
                console.log("登录失败");
                res.end("用户名或密码错误");
            }
        });
}else{
    res.end(settings.system_illegal_param)
}
}
});

    // 管理员退出
    router.get('/logout', function(req, res, next) {
        req.session.adminLogined = false;
        req.session.adminPower = '';
        req.session.adminUserInfo = '';
        res.redirect("/admin");
    });

    //后台用户起始页
    router.get('/manage', function(req, res, next) {
        res.render('manage/main', adminFunc.setPageInfo(req,res,settings.SYSTEMMANAGE));
    });

    //对象列表查询
    router.get('/manage/getDocumentList/:defaultUrl',function(req,res,next){
        //var currentPage = req.params.defaultUrl;
        //TODO:check permission
        if(true){
            var params = url.parse(req.url,true);
            var keywords = params.query.searchKey;
            var area = params.query.area;
            var limit = Number(params.query.limit);
            var currentPage = Number(params.query.currentPage);
            var startNum = (currentPage - 1)*limit + 1;

            articleFunc.search(keywords,startNum,limit,function (docs) {
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

    router.get('/manage/adminUser/del?:defaultUrl', function(req, res, next) {
        var params = url.parse(req.url,true);
        var ids = [];
        var id = params.query.id;
        if(id){
            var ss = id.split(',');
            for(var i in ss){
                ids.push(ss[i]);
            }
        }
        console.log(ids);
        adminUserFunc.del(ids,function (err) {
            if(err){
                res.end(err);
            }else{
                res.end("success");
            }
        });
    });

    //系统管理员列表
    router.get('/manage/adminUser/list?:defaultUrl', function(req, res, next) {
        //TODO:check permission
        if(true){
            var params = url.parse(req.url,true);
            var keywords = params.query.searchKey;
            var limit = Number(params.query.limit);
            var currentPage = Number(params.query.currentPage);
            var startNum = (currentPage - 1)*limit ;

            adminFunc.searchAdminUser(keywords,startNum,limit,function (docs) {
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
    //系统用户管理（list）
    router.get('/manage/adminUser', function(req, res, next) {
        adminFunc.renderToManagePage(req, res,'manage/adminUsersList',settings.ADMINUSERLIST);
    });


    router.post("/manage/adminUser/save/",function (req,res,next) {
        //TODO check power
        var content = req.body;
        adminFunc.saveAdminUser(content,function (err) {
            if(err){
                res.end(err);
            }else{
                res.end("success");
            }
        });     
    });

    router.get("/manage/adminUser/get/:key",function (req,res,next) {
        var targetId = parseInt(req.params.key);
        if(targetId>=0){
            adminFunc.getAdminUser(targetId,function (err,data) {
                if(err){
                    res.next(err);
                }else{
                    console.log(data);
                    return res.json(data);
                }
            });
        }else{
            res.end(settings.system_illegal_param);
        }
    });


//------------------------------------------系统用户管理结束



//------------------------------------------用户组管理面开始
    router.get('/manage/adminGroup/del?:defaultUrl', function(req, res, next) {
        var params = url.parse(req.url,true);
        var ids = [];
        var id = params.query.id;
        if(id){
            var ss = id.split(',');
            for(var i in ss){
                ids.push(ss[i]);
            }
        }
        adminGroupFunc.del(ids,function (err) {
            if(err){
                res.end(err);
            }else{
                res.end("success");
            }
        });
    });


//系统用户组管理（list）
router.get('/manage/adminGroup', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/adminGroup',settings.ADMINGROUPLIST);
});

//系统管理员用户组列表
router.get('/manage/adminGroup/list?:defaultUrl',function (req,res,next) {    
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        adminFunc.searchAdminGroup(keywords,startNum,limit,function (docs) {
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

router.post("/manage/adminGroup/save",function (req,res,next) {
    //TODO check power
    var content = req.body;
    content['power']=content['power'].toString();

    adminFunc.saveAdminGroup(content,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });     
});

router.get("/manage/adminGroup/get/:key",function (req,res,next) {
    var targetId = parseInt(req.params.key);

    if(targetId>=0){
        adminFunc.getAdminGroup(targetId,function (err,group) {
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
//------------------------------------------用户组管理面结束




//------------------------------------------文件管理器开始

//文件管理界面（list）
router.get('/manage/filesList', function(req, res, next) {

    adminFunc.renderToManagePage(req, res,'manage/filesList',settings.FILESLIST);

});

//------------------------------------------文件管理器结束


//------------------------------------------数据管理开始

router.get('/manage/dataManage/m/backUpData', function(req, res, next) {

    adminFunc.renderToManagePage(req, res,'manage/backUpData',settings.BACKUPDATA);

});


//备份数据库执行
router.get('/manage/backupDataManage/backUp', function(req, res, next) {
    if(adminFunc.checkAdminPower(req,settings.BACKUPDATA[0] + '_backup')) {
        system.backUpData(res, req);
    }else{
        res.end('对不起，您无权执行该操作！');
    }
});
//------------------------------------------数据管理结束


//------------------------------------------系统日志管理开始

router.get('/manage/systemLog', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/systemLogs',settings.SYSTEMLOGS);
});

router.get('/manage/systemLog/del?:defaultUrl', function(req, res, next) {
    var params = url.parse(req.url,true);
    var ids = [];
    var id = params.query.id;
    if(id){
        var ss = id.split(',');
        for(var i in ss){
            ids.push(ss[i]);
        }
    }
    systemLogFunc.del(ids,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
});
router.get('/manage/systemLog/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        systemLogFunc.list(startNum,limit,function (docs) {
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

//------------------------------------------系统日志管理结束

//----------------文章管理开始-------------------
router.get('/manage/article', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/article',settings.CONTENTLIST);
});

router.get('/manage/article/del?:defaultUrl', function(req, res, next) {
    var params = url.parse(req.url,true);
    var ids = [];
    var id = params.query.id;
    if(id){
        var ss = id.split(',');
        for(var i in ss){
            ids.push(ss[i]);
        }
    }
    articleFunc.del(ids,function (err) {
        if(err){
            res.end(err);
        }else{
            res.end("success");
        }
    });
});
router.get('/manage/article/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        articleFunc.list(startNum,limit,function (docs) {
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


//文档留言管理（list）
    router.get('/manage/articleComment', function(req, res, next) {
        adminFunc.renderToManagePage(req, res,'manage/articleComment',settings.MESSAGEMANAGE);
    });

    //文档留言管理（list）
    router.get('/manage/articleComment/list?:defaultUrl', function(req, res, next) {
        //TODO:check permission
        if(true){
            var params = url.parse(req.url,true);
            var keywords = params.query.searchKey;
            var area = params.query.area;
            var limit = Number(params.query.limit);
            var currentPage = Number(params.query.currentPage);
            var startNum = (currentPage - 1)*limit ;

            articleFunc.listComment(startNum,limit,function (docs) {
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


//管理员回复用户
    function replyMessage(req,res){
        var errors;
        var contentId = req.body.contentId;
        var contentTitle = req.body.contentTitle;
        var adminAuthorId = req.session.adminUserInfo._id;
        var replyId = req.body.replyId;
        var replyEmail = req.body.replyEmail;
        var content = req.body.content;
        var utype = req.body.utype;
        var relationMsgId = req.body.relationMsgId;

        if(!shortid.isValid(contentId) || !contentTitle){
            errors = settings.system_illegal_param;
        }
        if(!adminAuthorId || !replyId){
            errors = settings.system_illegal_param;
        }
        if(replyEmail && !validator.isEmail(replyEmail)){
            errors = settings.system_illegal_param;
        }


        if(errors){
            res.end(errors);
        }else{

            req.body.adminAuthor = new AdminUser({_id : adminAuthorId , userName : req.session.adminUserInfo.userName});
            req.body.replyAuthor = new User({_id : replyId , email : replyEmail});
            var newMsg = new Message(req.body);
            newMsg.save(function(){

//              更新评论数
                Content.updateCommentNum(contentId,'add',function(){
//                给用户发送提醒邮件
                    system.sendEmail(settings.email_notice_user_contentMsg,newMsg,function(err){
                        if(err){
                            res.end(err);
                        }
                    });

                    res.end("success");
                });

            });

        }
    }
//------------------------------------------文档留言结束



//------------------------------------------文档分类管理开始
    //文档类别列表页面
    router.get('/manage/articleCategory', function(req, res, next) {
        adminFunc.renderToManagePage(req, res,'manage/articleCategory',settings.CONTENTCATEGORYS);
    });

    //文档添加类别
    router.post('/manage/articleCategory/addCate', function(req, res, next) {
        console.log("articleCategory/addCate");
        articleFunc.saveCate(req,function(err){
            if(err){
                res.end(err);
            }else{
                res.end("success");
            }
        });
    });

    //文档
    router.post('/manage/articleCategory/getCate', function(req, res, next) {
        var params = url.parse(req.url,true);
        var id = params.query.id;
        console.log("articleCategory/getCate");
        articleFunc.getCate(id,function(cate){
            if(cate){
                res.json(cate);
            }else{
                res.json({});
            }
        });
    });

    //文章类别列表
    router.get('/manage/articleCategory/list?:defaultUrl', function(req, res, next) {
        articleFunc.listCate(function(cates){
            if(cates){
                res.json(cates);
            }else{
                res.json({});
            }
        });
    });

//------------------------------------------文档标签开始

//文档标签管理（list）
router.get('/manage/articleTag', function(req, res, next) {
    adminFunc.renderToManagePage(req, res,'manage/articleTag',settings.CONTENTTAGS);
});

//所有标签列表
router.get('/manage/articleTag/list', function(req, res, next) {
    if(adminFunc.checkAdminPower(req,settings.CONTENTTAGS[0] + '_view')){
        Util.findAll(ContentTags,req, res,"request ContentTags List")
    }else{
        return res.json({});
    }

});
//------------------------------------------文档标签结束


//------------------------------------------文档模板开始



    //--------------------消息管理开始---------------------------
    //管理员公告列表页面
    router.get('/manage/noticeManage/m/adminNotice', function(req, res, next) {
        req.query.area = 'announce';
        adminFunc.renderToManagePage(req, res,'manage/adminNotice',settings.SYSTEMNOTICE);
    });

    router.get('/manage/notice/list?:defaultUrl',function (req,res,next) {
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        noticeFunc.list(startNum,limit,function (docs) {
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


    //管理员公告编辑页面
    router.get('/manage/adminNotice/edit/:noticeId', function(req, res, next) {

        res.render('manage/addNotice', adminFunc.setPageInfo(req,res,settings.SYSTEMNOTICE));

    });

    //管理员公告新增页面
    router.get('/manage/adminNotice/add', function(req, res, next) {

        res.render('manage/addNotice', adminFunc.setPageInfo(req,res,settings.SYSTEMNOTICE));

    });

    //用户消息管理列表
    router.get('/noticeManage/m/userNotice', function(req, res, next) {

        adminFunc.renderToManagePage(req, res,'manage/userNotice',settings.USERNOTICE);

    });


    function addOneNotice(req,res){
        req.body.type = '1';
        req.body.adminSender = new AdminUser({_id : req.session.adminUserInfo._id});
        var notify = new Notify(req.body);
        notify.save(function(err){
            if(err){
                res.end(err);
            }else{
                User.find({},'_id',function (err,users) {
                    if(err){
                        res.end(err);
                    }else{
                        if(users.length > 0){
                            for(var i=0;i<users.length;i++){
                                var userNotify = new UserNotify();
                                userNotify.user = users[i]._id;
                                userNotify.notify = notify;
                                userNotify.save(function(err){
                                    if(err){
                                        res.end(err);
                                    }
                                });
                            }
                        }
                        res.end('success');
                    }
                });
            }
        });
    }

    //系统消息列表
    router.get('/manage/noticeManage/m/systemNotice', function(req, res, next) {
        req.query.area = 'systemNotice';
        adminFunc.renderToManagePage(req, res,'manage/systemNotice',settings.SYSTEMBACKSTAGENOTICE);

    });

    //设置为已读消息
    router.get('/userNotify/setHasRead',function(req,res){
        var params = url.parse(req.url,true);
        var currentId = params.query.msgId;

        if(adminFunc.checkAdminPower(req,settings.SYSTEMBACKSTAGENOTICE[0] + '_modify')){
            if(currentId){
                UserNotify.setHasRead(currentId,function(err){
                    if(err){
                        res.end(err);
                    }else{
                        adminFunc.getAdminNotices(req,res,function(noticeObj){
                            req.session.adminNotices = noticeObj;
                            res.end('success');
                        });

                    }
                });
            }else{
                res.end(settings.system_illegal_param);
            }
        }else{
            res.end('对不起，您无权执行该操作！');
        }

    });

//--------------------消息管理结束--------------------------


//--------------------用户管理-----------------------------

    //文档列表页面
    router.get('/manage/user', function(req, res, next) {
        adminFunc.renderToManagePage(req, res,'manage/user',settings.CONTENTLIST);
    });

    //文档列表
    router.get('/manage/user/list?:defaultUrl',function (req,res,next) {
        var params = url.parse(req.url,true);
        var keywords = params.query.searchKey;
        var area = params.query.area;
        var limit = Number(params.query.limit);
        var currentPage = Number(params.query.currentPage);
        var startNum = (currentPage - 1)*limit ;

        userFunc.list(startNum,limit,function (docs) {
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

    router.get("/manage/user/get/:key",function (req,res,next) {
        var targetId = parseInt(req.params.key);
        if(targetId>=0){
            userFunc.get(targetId,function (err,data) {
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


    //文档添加页面(默认)
    router.post('/manage/user/save/', function(req, res, next) {
        var user = req.body;
        userFunc.save(user,function(err){
            console.log(err);
            if(err){
                res.end("error");
            }else{
                res.end("success");
            }
        });
    });


//--------------------用户管理结束-------------------------


//--------------------系统管理首页开始---------------------------
//获取系统首页数据集合
router.get('/manage/getMainInfo', function(req, res, next) {
    adminFunc.setMainInfos(req, res);
});

return router;
};

module.exports = returnAdminRouter;
