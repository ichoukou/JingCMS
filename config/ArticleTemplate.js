/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('article_template', {
	    name:  String,
	    alias : { type: "text" , default: "defaultTemp" }, //别名 指向模板文件夹
	    version : String,
	    sImg: { type: "text", default: '/stylesheets/backstage/img/screenshot.png' },
	    author: { type: "text" , default: "doramart" }, // 主题作者
	    using : { type : "boolean" , default : false }, // 是否被启用
	    date: { type: "date", default: Date.now },
	    comment : String // 主题描述
	});
    return cb();
};

