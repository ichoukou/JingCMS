/**
 * Created by Administrator on 2015/12/9.
 * doraCMS自定义控制器
 */
var jingApp = angular.module('adminApp',[]);

jingApp.factory('pageData',function(){
    return {
        bigCategory : $("#currentCate").val()
    }
});

jingApp.factory('getItemService',['$http',function($http){
    //获取单个对象信息
    var getItemRequest = function(currentPage,targetId){
        var requestPath = "/admin/manage/"+currentPage+"/item?uid="+targetId;
        return $http.get(requestPath)
    };
    return {
        itemInfo : function(currentPage,targetId){
            return getItemRequest(currentPage,targetId);
        }
    }
}]);


//管理主界面
jingApp.controller("mainPanel",['$scope','$http',function($scope,$http){
    $http.get("/admin/manage/getMainInfo").success(function(result){
        $scope.mainData = result;
    });
}]);


//文档列表
jingApp.controller('article',['$scope','$http',function($scope,$http){
    $scope.url='/admin/manage/article/';
    $scope.formData = {};
    //获取文档列表信息
    initPagination($scope,$http);
    //删除文档
    initDelOption($scope,$http,'您确认要删除选中的文档吗？');
    // 文章推荐
    $scope.topContent = function(id,m){
        angularHttpGet($http,"/admin/manage/ContentList/topContent?uid="+id+"&isTop="+m,function(){
            initPagination($scope,$http);
        });
    };
}]);

//管理员用户列表
jingApp.controller("adminUserList",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};

    //获取管理员列表信息
    $scope.url="/admin/manage/adminUser/";
    
    initPagination($scope,$http);

    //删除用户
    initDelOption($scope,$http,'您确认要删除选中的管理员吗？');
    //logo上传
    initUploadFyBtn('uploadULogoImg','images',"userlogo",function(data){
        $.tipsShow({
            message : '上传成功',
            type : 'success' ,
            callBack : function(){
                $("#userLogo").attr("src",data);
                $scope.formData.logo = data;
            }
        });

    });
    // 修改用户
    $('#addNewAdminUser').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editId = obj.data('whatever');
        // 如果不为空则为编辑状态
        if(editId){
            //getItemService.itemInfo(pageData.bigCategory,editId).success(function(result){
            $http.get($scope.url+'get/'+editId).success(function(result){
                $scope.formData = result;
                $scope.targetID = editId;
                //initTreeDataByType($scope,$http,'adminGroup');
                initDropList($scope,$http);
            })
        }else{
            $scope.formData = {};
            //initTreeDataByType($scope,$http,'adminGroup');
            initDropList($scope,$http);
        }

    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    //添加新用户或修改用户
    $scope.processForm = function(isValid){
        if(!$scope.formData.group){
            $.tipsShow({
                message : '请选择用户组',
                type : 'warning' ,
                callBack : function(){
                    return;
                }
            });
        }else{
            angularHttpPost($http,isValid,$scope.url+'save/',$scope.formData,function(data){
                initPagination($scope,$http);
            });
        }
    };

}]);


//管理员用户组列表
jingApp.controller("adminGroup",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    $scope.formData.power = {};
    $scope.checkInfo = {};

    $scope.url="/admin/manage/adminGroup/";
 
    //获取管理员用户组列表
    initPagination($scope,$http);
    //初始化管理栏目列表
    initPowerList($scope);
    //删除用户
    initDelOption($scope,$http,'您确认要删除选中的用户组吗？');

    // 修改用户组
    $('#addAdminGroup').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editId = obj.data('whatever');
        var modalTitle = $(this).find('.modal-title');
        // 如果不为空则为编辑状态
        if(editId){
            modalTitle.text("编辑用户组");

        $http.get($scope.url+'get/'+editId).success(function(result){
                $scope.formData.id=result.id;
                $scope.formData.name = result.name;
                if(result.power){
                    $scope.formData.power = JSON.parse(result.power);
                    // 回选checkbox
                    var powerTreeObj = eval(result.power);
                    for(var i=0;i<powerTreeObj.length;i++){
                        var checkedId = powerTreeObj[i].split(':')[0];
                        var treeObj = $.fn.zTree.getZTreeObj("groupPowerTree");
                        var node = treeObj.getNodeByParam("id", checkedId, null);
                        if(node){
                            node.checked = true;
                            treeObj.updateNode(node);
                        }
                    }
                }
                $scope.targetID = editId;
            })
        }else{
            modalTitle.text("添加新用户组");
            cancelTreeCheckBoxSelect("groupPowerTree");
            $scope.formData = {};
        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        cancelTreeCheckBoxSelect("groupPowerTree");
        clearModalData($scope,$(this));
    });

    // 添加新用户组
    $scope.processForm = function(isValid){
        var groupData = {
            id:$scope.formData.id,
            name : $scope.formData.name,
            power : JSON.stringify($scope.formData.power)
        };
        angularHttpPost($http,isValid,$scope.url+"save/",groupData,function(data){
            initPagination($scope,$http,listurl);
        });
    }
}]);


//广告列表
jingApp.controller("ad",['$scope','$http',function($scope,$http){
    $scope.formData = {};
    $scope.url="/admin/manage/ad/";
 
    //获取邮件模板列表信息
    initPagination($scope,$http);
    // 删除广告
    initDelOption($scope,$http,'您确认要删除选中的广告吗？');

}]);


//广告编辑/添加
jingApp.controller("editAd",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    $scope.formData.type = "0";
    $scope.formData.content = {};
    $scope.formData.content.link = "http://www.doramart.com";
    $scope.formData.content.title = "默认链接标题";
    $scope.formData.contentItem = {};

    $scope.selectTarget = [
        {name:'_blank',value : '_blank'},
        {name:'_self',value : '_self'}
    ];

    $scope.formData.contentItem.target = '_blank';
    var contentArray = [];
    var editArrImg = [];
    // 初始化上传按钮
    initUploadFyBtn('uploadAdsImg','images','',function(data){
        $("#myImg").attr("src",data);
        $scope.formData.contentItem.sImg = data;
    });

    // 广告类型选项卡切换
    $('a[data-toggle="tab"]').on("show.bs.tab",function(e){
        var txt = $(this).text();
        $("#adsType").text(txt);
        $scope.formData.type = $(this).attr("dropValue");
    });
    // 添加图片信息窗口
    $('#addNewAdImg').on('show.bs.modal', function (event) {
        $scope.formData.contentItem = {}
    }).on('hidden.bs.modal', function (e) {
        clearModalData($scope,$(this));
    });

    $scope.targetID = window.location.href.split("/")[7];
    if($scope.targetID){
        $http.get($scope.url+'get/'+$scope.targetID).success(function(result){
            $scope.formData = result;

            if(result.type === "0"){ //文字广告
                $("#adsType").text("文字");
                $("#tab_2").removeClass("in active");
                $("#tab_1").addClass("in active");
                $("#imgAdsType").addClass("hide");
                $scope.formData.content = JSON.parse(result.content);

            }else{
                $("#adsType").text("图片");
                $("#tab_1").removeClass("in active");
                $("#tab_2").addClass("in active");
                $("#txtAdsType").addClass("hide");

                var imgInfos = $scope.formData.content;
                editArrImg = imgInfos.replace(/},/g,"};").split(";");
                contentArray = editArrImg;
                for(var i=0;i<editArrImg.length;i++){
                    var item = JSON.parse(editArrImg[i]);
                    var newItem = getImgInfo(item.sImg,item.link,item.width,item.height,item.target,item.discription);
                    $("#imgInfolist").append(newItem);
                    //  添加关闭按钮的监听事件
                    initCloseBtn($scope,contentArray);
                }
            }
        })
    }


    $scope.processImgForm = function(isValid){
        contentArray.push(JSON.stringify($scope.formData.contentItem));
        $("#addNewAdImg").modal("hide");
        $scope.formData.content = contentArray.join();
        // 获取demo下元素个数
        var demoLength = $('#imgInfolist').children('.alert').length;
        // 在demo树下添加元素
        var newItem = getImgInfo($scope.formData.contentItem.sImg,$scope.formData.contentItem.link,$scope.formData.contentItem.width,$scope.formData.contentItem.height,$scope.formData.contentItem.target,$scope.formData.contentItem.discription);
        $("#imgInfolist").append(newItem);
        // 添加关闭按钮的监听事件
        initCloseBtn($scope,contentArray);
    };

    // 添加或修改广告
    $scope.processForm = function(isValid){

        var currentContent = $scope.formData.content;
        if($scope.formData.type === "0"){
            currentContent = JSON.stringify($scope.formData.content);
        }
        var groupData = {
            mkey : $scope.formData.mkey,
            title : $scope.formData.title,
            category : $scope.formData.category,
            type : $scope.formData.type,
            content : currentContent,
            state : $scope.formData.state
        };

        angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),groupData,function(data){
            window.location = "/admin/manage/ad";
        });

    }
}]);


//文件管理器
jingApp.controller("filesList",['$scope','$http',function($scope,$http){
    $scope.formData = {};
    $scope.mdFormData = {};
    $scope.fileData = {};
    $scope.url="/admin/manage/file/";

    // 初始化显示方式
    $scope.listView = true;
    getFolderList($scope,$http,"");

    // 监听确认删除弹窗，传递参数
    $scope.delFilesItem = function(filePath){
        initCheckIfDo($scope,'','您确认要删除该文件吗？',function(path){
            angularHttpGet($http,$scope.url+"del?filePath="+filePath,function(){
                getFolderList($scope,$http,$scope.rootPath +$scope.currentPath);
            });
        });
    };

    // 重命名弹窗参数传递
    $('#reNameFile').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editPath = obj.data('whatever');
        // 如果不为空则为编辑状态
        if(editPath){
            $scope.formData.oldName = (editPath.split(","))[0];
            $scope.formData.path = (editPath.split(","))[1];
            $scope.targetID = (editPath.split(","))[1];
        }else{

        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    // 修改html代码参数传递
    $('#modifyFile').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editPath = obj.data('whatever');
        // 如果不为空则为编辑状态
        if(editPath){
            $scope.mdFormData.name = (editPath.split(","))[0];
            $scope.mdFormData.path = (editPath.split(","))[1];
            $scope.targetID = (editPath.split(","))[1];
            $http.get($scope.url+"getFileInfo?filePath="+$scope.mdFormData.path).success(function(result){
                $scope.mdFormData.code = result.fileData;
            })
        }else{

        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        $scope.mdFormData = {};
        clearModalData($scope,$(this));
    });

    $scope.processForm = function(isValid){
        var curentUrl = $scope.url+"addFolder";
        if($scope.targetID)
        {
            $scope.formData.newPath = $scope.rootPath +$scope.currentPath +"/"+ $scope.formData.newName;
            curentUrl = $scope.url+"rename";
        }
        angularHttpPost($http,isValid,curentUrl,$scope.formData,function(data){
            getFolderList($scope,$http,$scope.rootPath +$scope.currentPath);
        });
    };

    // 提交更新后的文件
    $scope.processMdForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+'updateFileInfo',$scope.mdFormData,function(data){
            getFolderList($scope,$http,$scope.rootPath +$scope.currentPath);
        });

    };

    $scope.newFolder  = function(){
        alert("开发中...")
    };
    // 列表或缩略图切换
    $scope.listViewShow = function(){
        $scope.listView = true;
    };

    $scope.thumbnailViewShow = function(){
        $scope.listView = false;
    };

    // 进入点击的目录
    $scope.getFiles = function(type,name,path){
        if(type === "folder"){
            // 记录前一路径
            getFolderList($scope,$http,path);
        }else if(type === "image" && $scope.listView){

        }
    };

    $scope.getAllFiles = function(){
        getFolderList($scope,$http,"")
    };

    // 进入上级目录
    $scope.getPrePath = function(){
        // 找到上级目录
        var currentPathArr = ($scope.currentPath).split("/");
        if(currentPathArr.length > 0){
            var currentFolderLength = (currentPathArr[currentPathArr.length-1]).length + 1;
            var prePath = ($scope.currentPath).substring(0,($scope.currentPath).length - currentFolderLength);
            $scope.prePath = $scope.rootPath + prePath;
        }
        getFolderList($scope,$http,$scope.prePath);
    }

}]);

//数据管理
jingApp.controller("backUpData",['$scope','$http',function($scope,$http){
    //初始化名称和权限
    $scope.formData = {};
    $scope.url="/admin/manage/backup/";

    //获取备份数据列表
    initPagination($scope,$http);
    //删除备份数据
    $scope.delDataItem = function(id,path){
        initCheckIfDo($scope,id,'您确认要删除该条备份数据吗？',function(currentID){
            angularHttpGet($http,$scope.url+"del?uid="+currentID+"&filePath="+path,function(){
                initPagination($scope,$http);
            });
        });
    };

    //恢复数据库
    $scope.restore = function(id,name){
        initCheckIfDo($scope,id,'您确认要恢复该备份数据吗？',function(currentID){
            angularHttpGet($http,$scope.url+"restore?uid="+currentID+"&name="+name,function(){
                $.tipsShow({
                    message : '数据恢复成功',
                    type : 'success' ,
                    callBack : function(){
                    }
                });
            });
        });
    };

    $scope.backUpData = function(){
        initCheckIfDo($scope,'','确认执行备份操作？数据库操作请谨慎处理',function(currentID){
            angularHttpGet($http,$scope.url+"backUp",function(){
                $.tipsShow({
                    message : '数据备份成功',
                    type : 'success' ,
                    callBack : function(){
                        initPagination($scope,$http);
                    }
                });
            });
        });
    };
}]);


//系统日志
jingApp.controller("systemLogs",['$scope','$http',function($scope,$http){
    $scope.url="/admin/manage/systemLog/";
 
    // 初始化名称和权限
    $scope.formData = {};
    //获取日志数据列表
    initPagination($scope,$http);
    //删除日志数据
    initDelOption($scope,$http,'确定删除选定的日志吗？');

}]);


//文档新增/编辑
jingApp.controller("addContent",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    // 初始化文章分类
    initTreeDataByType($scope,$http,"contentCategories");
    // 初始化文章标签
    initContentTags($scope,$http);
    // 初始化上传按钮
    initUploadFyBtn('uploadContentImg','images',"ctTopImg",function(data){
        $.tipsShow({
            message : '上传成功',
            type : 'success' ,
            callBack : function(){
                $("#myImg").attr("src",data);
                $scope.formData.sImg = data;
            }
        });

    });
    // 通过访问地址获取文章id
    $scope.targetID = window.location.href.split("/")[8];
    if($scope.targetID){
        getItemService.itemInfo(pageData.bigCategory,$scope.targetID).success(function(result){
            $scope.formData = result;
            initTreeDataByType($scope,$http,"contentCategories");
            initContentTags($scope,$http);
            $("#myImg").attr("src",$scope.formData.sImg)
        })
    }
    // 添加或修改文章
    $scope.processForm = function(isValid){
        $scope.formData.state = true;
        if(!$scope.formData.category){
            $.tipsShow({
                message : '请选择文档类别',
                type : 'warning' ,
                callBack : function(){
                    return;
                }
            });
        }else{
            angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
                window.location = "/admin/manage/article/";
            });
        }

    };
    //  存草稿
    $scope.saveAsDraft = function(){
        $scope.formData.state = false;
        var errors;
        if(!$scope.formData.title){
            errors = '文档标题必须填写';
        }
        if(!$scope.formData.category){
            errors = '文档类别必须选择';
        }
        if(errors){
            $.tipsShow({
                message : errors,
                type : 'warning' ,
                callBack : function(){
                    return;
                }
            });
        }else{
            angularHttpPost($http,true,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
                window.location = "/admin/manage/article/list";
            });
        }

    };

    $scope.getContentState = function(){
        if(!$scope.formData.state && $scope.targetID){
            return true;
        }else if($scope.targetID == undefined){
            return true;
        }else{
            return false;
        }
    }
}]);

//插件新增/编辑
jingApp.controller("addPlugs",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    // 初始化插件分类
    initTreeDataByType($scope,$http,"contentCategories");
    // 初始化上传按钮
    initUploadFyBtn('uploadPlugImg','images','plugTopImg',function(data){
        $.tipsShow({
            message : '上传成功',
            type : 'success' ,
            callBack : function(){
                $("#myImg").attr("src",data);
                $scope.formData.sImg = data;
            }
        });
    });
    // 通过访问地址获取插件id
    $scope.targetID = window.location.href.split("/")[8];
    if($scope.targetID){
        getItemService.itemInfo(pageData.bigCategory,$scope.targetID).success(function(result){
            $scope.formData = result;
            initTreeDataByType($scope,$http,"contentCategories");
            $("#myImg").attr("src",$scope.formData.sImg)
        })
    }
    // 添加或修改插件
    $scope.processForm = function(isValid){
        $scope.formData.type = "plug";
        if(!$scope.formData.category){
            $.tipsShow({
                message : '请选择插件类',
                type : 'warning' ,
                callBack : function(){
                    return;
                }
            });
        }else{
            angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
                window.location = "/admin/manage/article/list";
            });
        }
    }
}]);


//类别管理
jingApp.controller('articleCategory',['$scope','$http','pageData','getItemService', function ($scope,$http,pageData,getItemService) {
    // 初始化系统模板树
    initTreeDataByType($scope,$http,"tempTree");
    // 数据初始化
    $scope.warningInfo = {};
    $scope.formData = {};
    $scope.formData.parentID = "0";

    getCategoryData($scope,$http);
    //删除用户
    $('#checkIfDel').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        $scope.targetID = obj.data('whatever');
    }).on('hide.bs.modal', function (event) {
        $scope.targetID ="";
    });
    //确认执行删除
    $scope.delCategoryItem = function () {

        if(checkIfParent()){
            $('#checkIfDel').modal("hide");
            $scope.warningInfo.title = "警告";
            $scope.warningInfo.message = "失败！没有选中节点或该节点下有子节点！";
            $('#askifdo').modal("show");
        }else{
            var currentID =  $scope.targetID;
            angularHttpGet($http,"/admin/manage/articleCategory/del?id="+currentID,function(){
                getCategoryData($scope,$http);
            });
        }
    };

    // 修改类别
    $('#addContentCategory').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        console.log(obj);
        var editId = obj.data('whatever');
        var sortPath = obj.data('array');
        // 继承父类的文件路径
        var homePage = obj.data('homepage');
        //  继承父类内容模板
        var contentTemp = obj.data('contenttemp');
        var modalTitle = $(this).find('.modal-title');
        //  如果不为空则为编辑状态
        if(editId){
            // 子类不用设置模板，继承父类大类模板
            $("#setCateTemp").addClass("hide");
            $("#defaultUrl").addClass("hide");

            var opt = editId.substring(0,6);
            var currentID = editId.substring(7,editId.length);
            // 判断是编辑还是添加子类
            if(opt === "addSub"){
                $("#defaultUrl").removeClass("hide");
                modalTitle.text("添加子类");
                $scope.formData.parentID = currentID;
                $scope.formData.sortPath = sortPath;
                $scope.formData.defaultUrl = homePage;
                $scope.formData.contentTemp = contentTemp;
                $scope.targetID = "";
            }
            else if(opt === "editNc"){
                modalTitle.text("编辑分类");
                var requestPath = "/admin/manage/articleCategory/get?id="+currentID;
                $http.get(requestPath).success(function(result){
                    $scope.formData = result;
                    $scope.targetID = currentID;
                    // 针对顶级分类可以修改模板
                    if(result.sortPath.split(',').length == 2){
                        initTreeDataByType($scope,$http,"tempTree");
                        $("#setCateTemp").removeClass("hide");
                    }
                })
            }
        }else{
            $("#setCateTemp").removeClass("hide");
            $("#defaultUrl").removeClass("hide");

            modalTitle.text("添加文档类别");
            $scope.formData = {};
            $scope.formData.parentID = "0";
            $scope.formData.sortPath = "0";
        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    //添加类别
    $scope.processForm = function(isValid){
        // angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
        //     getCategoryData($scope,$http);
        // });
        angularHttpPost($http,isValid,'/admin/manage/articleCategory/addCate',$scope.formData,function(data){
            getCategoryData($scope,$http);
        });
    }
}]);

//文档标签
jingApp.controller("articleTag",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    //初始化名称和权限
    $scope.formData = {};
    $scope.url = "/admin/manage/articleTag/";

    //获取标签列表
    initPagination($scope,$http);
    //删除标签
    initDelOption($scope,$http,'您确认要删除选中的标签吗？');

    // 修改标签
    $('#addContentTags').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editId = obj.data('whatever');
        var modalTitle = $(this).find('.modal-title');
        // 如果不为空则为编辑状态
        if(editId){
            modalTitle.text("编辑文章标签");
            var requestPath = $scope.url+ "get?id="+editId;
            $http.get(requestPath).success(function(result){
                $scope.formData = result;
                $scope.targetID = editId;
            })
        }else{
            modalTitle.text("添加新标签");
            $scope.formData = {};
        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    // 添加新标签
    $scope.processForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+"save",$scope.formData,function(data){
            initPagination($scope,$http);
        });
    }
}]);


//模板列表
jingApp.controller("articleTemplate",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){

    // 初始化名称和权限
    $scope.formData = {};
    $scope.url = "/admin/manage/articleTemplate/";

    // 获取模板列表
    initPagination($scope,$http);
    // 删除模板单元
    $scope.delTempItem = function(id){
        initCheckIfDo($scope,id,'您确认要删除选中的模板单元吗？',function(currentID){
            angularHttpGet($http,$scope.url+"delTemplateItem?uid="+currentID,function(){
                initPagination($scope,$http);
            });
        });
    };

    // 修改模板
    $('#addContentTemps').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editId = obj.data('whatever');
        var defaultTemp = obj.data('defaulttemp');
        var modalTitle = $(this).find('.modal-title');
        // 如果不为空则为编辑状态
        if(editId){
            modalTitle.text("编辑文章模板");

            var requestPath = $scope.url+ "get?id="+editId;
            $http.get(requestPath).success(function(result){
                //getItemService.itemInfo(pageData.bigCategory,editId).success(function(result){
                $scope.formData = result;
                $scope.targetID = editId;
                initTreeDataByType($scope,$http,"tempForderTree")
            })
        }else{
            modalTitle.text("添加模板单元");
            $scope.formData = {};
            $scope.formData.defaultTemp = defaultTemp;
            initTreeDataByType($scope,$http,"tempForderTree")
        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    // 添加新模板单元
    $scope.processForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+"addNewTemplateItem?defaultTemp="+$scope.formData.defaultTemp,$scope.formData,function(data){
            initPagination($scope,$http);
        });
    };

    // 启用模板
    $scope.enableThisTemp = function(tempId,alias){
        $http.get($scope.url+'/enableTemplate?tempId='+tempId+'&alias='+alias).success(function(result){
            showMessage($scope,$http,result,'恭喜，您已成功启用该模板！');
        })
    };
    // 卸载模板初始化
    initDelOption($scope,$http,'该操作无法撤销，确认要执行吗？');

}]);

//系统模板管理
jingApp.controller("systemTemps",['$scope','$http',function($scope,$http){
    // 初始化系统模板
    initApiPagination($scope,$http);
    //初始化上传模板按钮
    initUploadFyBtn('uploadCmsTemp','zip',"cmsTemp",function(data){
        if(data.indexOf('success') >= 0){
            var tempId = data.split('&')[1];
            $.block({
                message : $('#sys-progress-bar'),
                mask : true
            });
            $http.get('/admin/manage/chekcIfUnzipSuccess?tempId='+tempId).success(function(result){
                if(result && result === 'has'){
                    $http.get('/admin/manage/initTempData?tempId='+tempId).success(function(result){
                        $.unblock();
                        showMessage($scope,$http,result,'恭喜，您已成功上传该模板！');
                        window.location.reload();
                    })
                }else if(result && result === 'imperfect'){
                    $.unblock();
                    $.tipsShow({ message : '压缩包内文件不完整', type : 'warning' });
                }else if(result && result === 'nopower'){
                    $.unblock();
                    $.tipsShow({ message : '对不起，您无权执行该操作！', type : 'warning' });
                }
            })

        }else{
            $.tipsShow({ message : data, type : 'warning' });
        }
    });
    // 安装模板
    $scope.installTheme = function(tempId){
        $.block({
            message : $('#sys-progress-bar'),
            mask : true
        });
        $http.get('/admin/manage/articleTemplate/installTemplate?tempId='+tempId).success(function(result){
            setTimeout(function(){
                $.unblock();
                showMessage($scope,$http,result,'恭喜，您已成功安装该模板！');
                window.location.reload();
            },8000)
        })

    };
}]);

//模板编辑
jingApp.controller("articleTemplateEdit",['$scope','$http',function($scope,$http){
    $scope.formData = {};
    $scope.url = "/admin/manage/articleTemplate/";
    initTreeDataByType($scope,$http,"allThemeFolderTree");
    initSystemTempData($scope,$http);

    // 提交更新后的文件
    $scope.processMdForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+'updateFileInfo',$scope.formData,function(data){
            $.tipsShow({ message : '更新成功！', type : 'success' });
        });
    };

}]);


//留言管理
jingApp.controller("articleComment",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    // 初始化名称和权限
    $scope.formData = {};
    $scope.repFormData = {};
    $scope.url = "/admin/manage/articleComment/";

    //获取留言列表
    initPagination($scope,$http);
    //删除留言
    $scope.delMsgsItem = function(id){
        initCheckIfDo($scope,id,'您确认要删除该条留言吗？',function(currentID){
            angularHttpGet($http,$scope.url+"del?uid="+currentID,function(){
                initPagination($scope,$http);
            });
        });
    };

    // 查看留言详情
    $('#getMsgDetails').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var msgObj = obj.data('whatever');

        $('#showMsgDetail').html(msgObj.content);
        $scope.repFormData.relationMsgId = msgObj._id;
        $scope.repFormData.contentId = msgObj.contentId;
        $scope.repFormData.contentTitle = msgObj.contentTitle;
        $scope.repFormData.utype = '1';

        if(msgObj.author){
            $scope.repFormData.replyId = msgObj.author._id;
            $scope.repFormData.replyEmail = msgObj.author.email;
        }

    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        $('#showMsgDetail').html("");
        clearModalData($scope,$(this));
    });

    // 留言回复
    $scope.repMsgForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+"addOne",$scope.repFormData,function(data){
            initPagination($scope,$http);
        });
    }

}]);

//公告管理
jingApp.controller("contentnotices",['$scope','$http',function($scope,$http){
    // 初始化名称和权限
    $scope.formData = {};
    $scope.url="/admin/manage/articleComment/";

    //获取公告列表
    initPagination($scope,$http);

    //删除公告
    initDelOption($scope,$http,'您确认要删除选中的公告吗？');
}]);

//添加新公告
jingApp.controller("addNotice",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    // 通过访问地址获取文章id
    $scope.targetID = window.location.href.split("/")[7];
    if($scope.targetID){
        getItemService.itemInfo(pageData.bigCategory,$scope.targetID).success(function(result){
            $scope.formData = result;
        })
    }
    // 添加新公告
    $scope.processForm = function(isValid){
        angularHttpPost($http,isValid,getTargetPostUrl($scope,pageData.bigCategory),$scope.formData,function(data){
            window.location = "/admin/manage/noticeManage/m/adminNotice";
        });
    }
}]);


//系统通知
jingApp.controller("contentnotices",['$scope','$http',function($scope,$http){
    // 初始化名称和权限
    $scope.formData = {};
    $scope.url="/admin/manage/notice/";
    //获取公告列表
    initPagination($scope,$http);
    //删除公告
    initDelOption($scope,$http,'您确认要删除选中的消息吗？');
    //设为已读
    $scope.batchIsRead = function(){
        var targetIds = $('#targetIds').val();
        if(targetIds && targetIds.split(',').length > 0){
            angularHttpGet($http,"/admin/userNotify/setHasRead?msgId="+targetIds,function(){
                setNoticesRead(targetIds);
            });
        }else{
            $.tipsShow({ message : '请至少选择一项', type : 'warning' });
        }
    };
}]);

//会员管理
jingApp.controller("user",['$scope','$http','pageData','getItemService',function($scope,$http,pageData,getItemService){
    $scope.formData = {};
    $scope.url="/admin/manage/user/";
    //获取注册用户列表信息
    initPagination($scope,$http);
    //删除用户
    initDelOption($scope,$http,'您确认要删除选中的会员吗？');
    // 修改用户
    $('#addNewRegUser').on('show.bs.modal', function (event) {
        var obj = $(event.relatedTarget);
        var editId = obj.data('whatever');
        // 如果不为空则为编辑状态
        if(editId){
            //getItemService.itemInfo(pageData.bigCategory,editId).success(function(result){
            $http.get($scope.url+'get/'+editId).success(function(result){
                console.log(result);
                $scope.formData = result;
                $scope.targetID = editId;
            })
        }else{
            $scope.formData = {};
        }
    }).on('hidden.bs.modal', function (e) {
        // 清空数据
        clearModalData($scope,$(this));
    });

    // 添加新用户或修改用户
    $scope.processForm = function(isValid){
        angularHttpPost($http,isValid,$scope.url+"save/",$scope.formData,function(data){
            initPagination($scope,$http);
        });
    };

}]);

//用户通知
jingApp.controller("usernotices",['$scope','$http',function($scope,$http){
    // 初始化名称和权限
    $scope.formData = {};
    //获取公告列表
    initPagination($scope,$http);
    //删除公告
    initDelOption($scope,$http,'您确认要删除选中的消息吗？');

}]);