var url = require('url');
var settings = require("../models/settings");
var request = require('request');
var orm = require('orm');
var shortid = require('shortid');

var adminFunc = {
    auth:function (userName,password,cb) {
        global.db.models.adminuser.find({name: userName,password:password},cb);
    },

    siteInfos : function (description) {
        return {
            title : settings.SITETITLE,
            description : description,
            version : settings.SITEVERSION
        }
    },

    getClienIp : function(req){
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;
    },

    setMainInfos : function(req, res){
         global.db.models.adminuser.count(function (err,adminCount) {
             global.db.models.user.count(function (err,userCount) {
                 global.db.models.article.count(function (err,articleCount) {
                     global.db.models.articlecomment.count(function (err,commentCount) {
                         global.db.models.user.find({},["name", "Z"],function (err,users) {
                                return res.json({
                                    adminUserCount : adminCount,
                                    regUsersCount : userCount,
                                    contentsCount : articleCount,
                                    msgCount : commentCount,
                                    regUsers : users,
                                });
                        });
                    });
                });
            });
        });
    },

    setPageInfo : function(req,res,module,currentLink){
        var searchKey = '';
        //area是为了独立查询一个表其中的部分数据而设立的参数
        var area = '';
        if(req.url){
            var params = url.parse(req.url,true);
            searchKey = params.query.searchKey;
            area = req.query.area;
        }

        return {
            siteInfo : this.siteInfos(module[1]),
            bigCategory : module[0],
            searchKey : searchKey,
            area : area,
            currentLink : currentLink,
            layout : 'manage/public/adminTemp',
        }
    },

    setDataForInfo : function(infoType,infoContent){

        return {
            siteInfo : this.siteInfos('系统操作提示'),
            bigCategory : 'noticePage',
            infoType : infoType,
            infoContent : infoContent,
            area : '',
            layout: 'manage/public/adminTemp'
        }

    },

    setQueryByArea : function(req,keyPr,targetObj,area){
        var newKeyPr = keyPr;
        if(targetObj == UserNotify){
            if(area && area == 'systemNotice'){
                newKeyPr = {'systemUser' : req.session.adminUserInfo._id };
            }
        }else if(targetObj == Notify){
            if(area && area == 'announce'){
                newKeyPr = {'type' : '1' };
            }
        }
        return newKeyPr;
    },

    getAdminNotices : function (req,res,callBack) {

    },

    delNotifiesById : function(req,res,nid){

    },

    getTargetObj : function(currentPage){
    },

    checkAdminPower : function(req,key){
        var power = false;
        var uPower = req.session.adminPower;
        if(uPower){
            var newPowers = eval(uPower);
            for(var i=0;i<newPowers.length;i++) {
                var checkedId = newPowers[i].split(':')[0];
                if(checkedId == key && newPowers[i].split(':')[1]){
                    power = true;
                    break;
                }
            }
        }
        return power;
    },

    renderToManagePage : function(req,res,url,pageKey){
        //if(this.checkAdminPower(req,pageKey[0] + '_view')){
            res.render(url, this.setPageInfo(req,res,pageKey,'/admin/'+url));
        //}else{
        //    res.render("manage/public/notice", this.setDataForInfo('danger','对不起，您无权操作 <strong>'+pageKey[1]+'</strong> 模块！'));
        //}
    },

    checkTempInfo : function(tempInfoData,forderName,callBack){
    },

    authDoraCMS : function(req,res,callBack){
    },

    setTempParentId : function(arr,key){
        for(var i=0;i<arr.length;i++){
            var pathObj = arr[i];
            pathObj.pId = key;
        }
        return arr;
    },
    //create & update
    saveAdminGroup:function (content,cb) {
        if(content['id']!="undefined"){
            global.db.models.admingroup.get(content['id'],function (err,ag) {
                ag['name']=content['name'];
                ag['power']=content['power'];
                ag.save(function (err) {
                    cb(err);
                });
            });
        }
        else{
            global.db.models.admingroup.create(content,cb);
        }
    },
    getAdminGroup:function (gid,cb) {
        global.db.models.admingroup.get(gid,cb);
    },
    allAdminGroup:function (cb) {
        global.db.models.admingroup.find({},300,cb);
    },
    searchAdminGroup:function (keywords,startNum,limit,cb) {
        if (keywords=="undefined") {
            keywords="";
        };
        global.db.models.admingroup.find({}).limit(limit).offset(startNum).run(function (err, docs) {
            console.log(docs);
            if(err)
                console.log(err);
            cb(docs);
        });
    },
    searchAdminUser:function (keywords,startNum,limit,cb) {
        if (keywords=="undefined") {
            keywords="";
        };
        global.db.models.adminuser.find({}).limit(limit).offset(startNum).run(function (err, docs) {
            console.log(docs);
            if(err)
                console.log(err);
            cb(docs);
        });
    },
    //create & update user
    saveAdminUser:function (content,cb) {
        if(content['id']!="undefined"){
            global.db.models.adminuser.get(content['id'],function (err,ag) {
                for(var p in content)
                    ag[p]=content[p];
                ag.save(function (err) {
                    cb(err);
                });
            });
        }
        else{
            global.db.models.adminuser.create(content,cb);
        }
    },
    getAdminUser:function (id,cb) {
        global.db.models.adminuser.get(id,cb);
    },

};


module.exports = adminFunc;