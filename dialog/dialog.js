/**
 * Author: 简炽明
 * Date: 13-2-19
 * Time: 下午2:22
 */

function Dialog(opt) {

    var _self = this,
        _config = {
            vendor: [] //浏览器内核标记，格式如:["webkit", "-webkit-"] [可选]
        },
        _tplConfig = {
            content: "",  //内容
            button: [false, false],  //按钮，格式如：[{value: "确定", onclick: function() {}}, {}]
            style: "",
            className: "",
            title: "",
            titleStyle: "",
            titleClassName: "",
            contentStyle: "",
            contentClassName: "",
            buttonStyle: "",
            buttonClassName: ""
        },
        _tpl = '<div id="dialog" class="<#=className#>" style="<#=style#>">\
            <div id="dialogTitle" class="<#=titleClassName#>" style="<#=titleStyle#>"><#=title#></div>\
            <div id="dialogContent" class="<#=contentClassName#>" style="<#=contentStyle#>"><#=content#></div>\
            <div id="dialogButton" class="<#=buttonClassName#>" style="<#=buttonStyle#>">\
               <#if(button[0]){#><input type="button" id="dialogBtnConfirm" value="<#=(button[0].value||"确定")#>" /><#}#>\
               <#if(button[1]){#><input type="button" id="dialogBtnCancel" value="<#=(button[1].value||"取消")#>" /><#}#>\
            </div>\
        </div><div id="dialogMask"></div>';

    function isFunction(value) {
        return {}.toString.call(value) == "[object Function]";
    }

    function isObject(value) {
        return value instanceof Object;
    }

    function extend(target){
        [].slice.call(arguments, 1).forEach(function(source) {
            for (key in source) {
                source[key] !== undefined && (target[key] = source[key]);
            }
        });
        return target;
    }

    function Template(template) {
        this._fn = new Function("obj", "var _=[];with(obj){_.push('" +
            template.replace(/[\r\t\n]/g, " ")
                .replace(/'(?=[^#]*#>)/g, "\t")
                .split("'").join("\\'")
                .split("\t").join("'")
                .replace(/<#=(.+?)#>/g, "',$1,'")
                .split("<#").join("');")
                .split("#>").join("_.push('")
            + "');}return _.join('');");
    }

    extend(Template.prototype, {
        apply: function (data) {
            var arr = [],
                div = document.createElement(div);
            div.innerHTML = this.applyToStr(data);

            var children = div.children;
            while(children.length) {
                arr.push(div.removeChild(children[0]));
            }
            return arr;
        },
        applyToStr: function (data) {
            var text = this._fn(data);
            return text;
        }
    });

    function init(opt) {
        isObject(opt) && extend(_config, opt);

        if(_config.vendor.length == 0) {
            _config.vendor = function() {
                var obj = {
                        webkit: "webkitTransform",
                        Moz: "MozTransition",
                        O: "OTransform"
                    },
                    style = document.body.style;
                for(key in obj) {
                    if(obj[key] in style) {
                        return [key, "-" + key.toLowerCase() + "-"];
                    }
                }
            }();
        }

        //创建模板
        _tpl = new Template(_tpl);

        //弹出对话框
        _self.show = function(opt, callback) {
            var cg = {};
            extend(cg, _tplConfig);
            extend(cg, opt);

            var dialog = _tpl.apply(cg),
                scrollTop = document.body.scrollTop;
            for(var i = 0, len = dialog.length; i < len; i++) {
                document.body.appendChild(dialog[i]);
            }

            dialog = dialog[0];

            var dialogMask = document.querySelector("#dialogMask"),
                dialogBtnConfirm = dialog.querySelector("#dialogBtnConfirm"),
                dialogBtnCancel = dialog.querySelector("#dialogBtnCancel");

            dialogMask.style.top = scrollTop + "px";
            dialogMask.addEventListener('touchmove', function(e) { e.preventDefault(); }, false);

            if(dialogBtnConfirm && isFunction(cg.button[0].onclick)) {
                dialogBtnConfirm.addEventListener("click", cg.button[0].onclick, false);
            }
            if(dialogBtnCancel) {
                dialogBtnCancel.addEventListener("click", function(){
                    _self.hide();
                    cg.button[1].onclick && isFunction(cg.button[1].onclick) && cg.button[1].onclick.call(this);
                }, false);
            }
            dialog.style.left = ((innerWidth - dialog.clientWidth) / 2) + "px";
            dialog.style.top = ((innerHeight - dialog.clientHeight) / 2 + scrollTop) + "px";
            setTimeout(function () {
                dialog.style[_config.vendor[0] + "Transform"] = 'scale(1)';
                isFunction(callback) && callback.call(dialog);
            }, 0);
        };

        //隐藏对话框
        _self.hide = function () {
            var dialog = document.querySelector("#dialog");
            dialog.style[_config.vendor[0] + "Transform"] = 'scale(0)';
            setTimeout(function () {
                var dialogMask = dialog.nextElementSibling;
                document.body.removeChild(dialogMask);
                document.body.removeChild(dialog);
            }, 80);
        };

    }

    init(opt);
}
