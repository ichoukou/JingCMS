var express = require('express');
var router = express.Router();
var url = require('url');

var Util = require('../../util/Util');
var adminFunc = require('../../service/adminFunc');

//文件操作
var PW = require('png-word');
var RW = require('../../util/randomWord');
var rw = RW('abcdefghijklmnopqrstuvwxyz1234567890');
var pngword = new PW(PW.GRAY);

//数据校验
var validator = require('validator');
var shortid = require('shortid');

//系统配置
var settings = require("../../config/settings");

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


//------------------------------------------文件管理器开始

//文件管理界面（list）
router.get('/manage/filesList', function(req, res, next) {

    adminFunc.renderToManagePage(req, res,'manage/filesList',settings.FILESLIST);

});

//------------------------------------------文件管理器结束



//------------------------------------------系统日志管理结束

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



//--------------------系统管理首页开始---------------------------
//获取系统首页数据集合
router.get('/manage/getMainInfo', function(req, res, next) {
    adminFunc.setMainInfos(req, res);
});

return router;
};

module.exports = returnAdminRouter;
