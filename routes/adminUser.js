var express = require('express');
var router = express.Router();
var url = require('url');

//系统配置
var settings = require("../models/settings");

var adminFunc = require('../service/adminFunc');
var adminUserFunc = require('../service/adminUserFunc');

//系统用户管理（list）
router.get('/', function(req, res, next) {
	adminFunc.renderToManagePage(req, res,'manage/adminUsersList',settings.ADMINUSERLIST);
});

router.post("/save/",function (req,res,next) {
    //TODO check power
    var content = req.body;
    global.db.save('admin_user',content,function (err) {
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
	global.db.del('admin_user',ids,function (err) {
		if(err){
			res.end(err);
		}else{
			res.end("success");
		}
	});
});

router.get("/get/:key",function (req,res,next) {
	var targetId = parseInt(req.params.key);
	if(targetId>=0){
		global.db.get("admin_user",targetId,function (err,data) {
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

//系统管理员列表
router.get('/list?:defaultUrl', function(req, res, next) {
    //TODO:check permission
    if(true){
    	var params = url.parse(req.url,true);
    	var keywords = params.query.searchKey;
    	var limit = Number(params.query.limit);
    	var currentPage = Number(params.query.currentPage);
    	var startNum = (currentPage - 1)*limit ;
    	global.db.search('admin_user','name',keywords,startNum,limit,function (docs) {
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
