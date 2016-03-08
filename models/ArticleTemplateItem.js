/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('article_template_item', {
	    name:  String,
	    forder : { type: "text" , default: "2-stage-default" }, //别名 指向模板文件夹
	    cateName: { type: "text" , default: "contentList" }, // 模板类型 大类列表
	    detailName: { type: "text" , default: "detail" }, // 模板类型 内容详情
	    isDefault : { type : "boolean" , default : false }, // 是否为默认模板
	    date: { type: "date", default: Date.now },
	    comment : String,// 小类模板描述
	    type : String,
	    log : String,
        date: { type: "date", default: Date.now },
	});
    return cb();
};

