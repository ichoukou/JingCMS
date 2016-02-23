/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('notice', {
        title     : {type: "text" },   // 消息的标题
        content     : {type: "text" },   // 消息的内容
        type        : {type: "text" , enum: ['1', '2', '3']},  // 消息的类型，1: 公告 Announce，2: 提醒 Remind，3：信息 Message
        target      : {type: "text" , ref : 'Content' },    // 目标的ID
        targetType  : {type: "text" },    // 目标的类型
        action      : {type: "text" },    // 提醒信息的动作类型
        sender      : {type: "text" , ref : 'User'},    // 发送者的ID
        adminSender : {type: "text" , ref : 'AdminUser'},    // 发送者的ID
        systemSender : {type: "text" }, // 系统消息发送者
        date   : { type: "date", default: Date.now }
    });
    return cb();
};
