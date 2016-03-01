/**
 * 留言管理
 */
module.exports = function (db, cb) {
    db.define('article_comment', {
        articleTitle : String, // 留言对应的内容标题
        utype : {type : "text" ,default : '0'}, // 评论者类型 0,普通用户，1,管理员
        relationMsgId : String, // 关联的留言Id
        date: { type: "date", default: Date.now }, // 留言时间
        praiseNum : {type : "number" , default : 0}, // 被赞次数
        hasPraise : {type : "boolean" , default : false}, //  当前是否已被点赞
        praiseMembers : String, // 点赞用户id集合
        content: { type : "text" , default : "输入评论内容..."}// 留言内容
    });

    return cb();
};


