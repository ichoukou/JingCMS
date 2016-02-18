/**
 * Created by Administrator on 2015/4/15.
 */

module.exports = function (db, cb) {
    db.define('article', {
        title:String,
        content:String,
        create_time:Date,
        update_time:Date,
        tags:String,
        state:{type:"boolean",default:true}, //是否在前台显示，默认显示
        recommend_num:Number,//根据推荐值进行排序
        from : { type: "number", default: '0' }, // 来源 0为原创 1为转载
    });

    return cb();
};


