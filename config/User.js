/**
 * Created by Administrator on 2015/4/11.
 */
 module.exports = function (db, cb) {
    db.define('user', {
        name:  String,
        userName : String,
        password:   String,
        email : String,
        qq : Number,
        phoneNum : Number,
        comments : { type: "text", default: "这个人很懒，什么都没有留下..." },
        position : String, // 职位
        company : String,  // 大学或公司
        website : String, // 个人站点
        date: { type: "date", default: Date.now },
        logo: { type: "text", default: "/upload/images/defaultlogo.png" },
        group: { type: "text", default: "0" },
        gender : String,
        province : String, // 所在省份
        city : String, // 所在城市
        year : Number, // 出生年
        openid : String,   // 针对qq互联
        retrieve_time : {type: "number"} // 用户发送激活请求的时间
    });
    return cb();
};
