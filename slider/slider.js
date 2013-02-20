/**
 * Author: Maple Jan
 * Date: 13-1-15
 * Time: 上午11:51
 */

function Slider(opt) {
    var _self = this,
        config = {
            tab: null,  //标签容器对象 [必需]
            cont: null, //内容容器对象 [必需]
            curClass: "cur", //设置被选中tabs的类名，缺省值:"cur" [可选]
            vender: [], //浏览器内核标记，格式如:["webkit", "-webkit-"] [可选]
            isTouch: true,  //是否触摸设备，缺省值:true [可选]
            isPlay: true,   //是否自动播放，缺省值:true [可选]
            playInterval: 5000  //动画自动播放的切换间隔时间，缺省值:5000ms [可选]
        };

    function extend(target) {
        [].slice.call(arguments, 1).forEach(function(source) {
            for (key in source) {
                source[key] !== undefined && (target[key] = source[key]);
            }
        });
        return target;
    }

    extend(_self, {

        init: function(opt) {
            extend(config, opt);

            var windowCont = config.cont,
                slideBlocks = windowCont.querySelectorAll("li"),
                length = slideBlocks.length,
                slideBlocksWidth = 100 / length + "%";

            if(config.vender.length == 0) {
                config.vendor = function() {
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

            windowCont.style.width = length * 100 + "%";
            for(var i = 0; i < length; i++) {
                slideBlocks[i].style.width = slideBlocksWidth;
            }

            _self.event();
        },

        transform: function(elem, str) {
            elem.style[config.vendor[0] + "Transform"] = str;
            return elem;
        },

        transition: function(elem) {
            var str = "";
            if(arguments.length > 1) {
                str = [].slice.call(arguments, 1).join(",");
            }
            elem.style[config.vendor[0] + "Transition"] = str;
            return elem;
        },

        addClass: function(elem, name){
            var cls = elem.className,
                classList = [];
            name = name.split(/\s+/g);
            for(var i = 0, l = name.length; i < l; i++) {
                if (cls.indexOf(name[i]) == -1) {
                    classList.push(name[i]);
                }
            }
            classList.length && (elem.className += (cls ? " " : "") + classList.join(" "))
            return elem;
        },

        removeClass: function(elem, name){
            if (name === undefined) {
                elem.className = '';
                return elem;
            }
            var classList = elem.className;
            name = name.split(/\s+/g);
            for(var i = 0, l = name.length; i < l; i++) {
                var regx = new RegExp('(^|\\s)' + name[i] + '(\\s|$)');
                classList = classList.replace(regx, " ");
            }
            elem.className = classList.replace(/^\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ");
            return elem;
        },

        client: function(e, path) {
            var str = "client" + path;
            if(config.isTouch) {
                _self.client = function(e, path) {
                    var str = "client" + path;
                    return e.targetTouches[0][str];
                }
                return e.targetTouches[0][str];
            } else {
                _self.client = function(e, path) {
                    var str = "client" + path;
                    return e[str];
                }
                return e[str];
            }
        },

        event: function() {
            var startEvent = "touchstart";
            moveEvent = "touchmove";
            endEvent = "touchend";
            if(!config.isTouch) {
                startEvent = "mousedown";
                moveEvent = "mousemove";
                endEvent = "mouseup";
            }

            var windowCont = config.cont,
                tabBar = config.tab,
                slideBlocks = windowCont.querySelectorAll("li"),
                tabs = tabBar.querySelectorAll("li"),
                sliderNum = slideBlocks.length, //滑块数量
                percent = 100 / sliderNum,
                width = document.documentElement.clientWidth,
                slideDistance = width / 3, //有效滑动距离（触发滑块切换）
                cur = 0, //当前滑块标识
                x = 0,  //存储一次完整move的距离X
                y = 0,  //存储一次完整move的距离Y
                dX = 0, //触摸移动距离X
                dY = 0, //触摸移动距离Y
                sX = 0, //触摸起点X
                sY = 0, //触摸起点Y
                isXY = 0, //记录手指移动主方向，1为Y(上下)，-1为X(左右)，0为未初始化
                isBegin = false, //判断start事件是否开始
                isMove = false, //判断move事件是否开始
                SPEED = 0.3, //动画速度
                transitionStr = config.vendor[1] + "transform " + SPEED + "s ease-in";

            function windowContEffect() {
                _self.transition(windowCont, transitionStr);
                _self.transform(windowCont, "translate3d(" + (-cur * percent) + "%, 0, 0)");
            }

            var autoSlide = function() {
                if(config.isPlay) {
                    var interval = null; //循环播放 计时器对象
                    return {
                        play: function() {
                            this.stop();
                            interval = setInterval(function() {
                                _self.removeClass(tabs[cur], config.curClass);
                                ++cur < sliderNum || (cur = 0);
                                _self.addClass(tabs[cur], config.curClass);
                                windowContEffect();
                            }, config.playInterval);
                        },
                        stop: function() {
                            clearInterval(interval);
                        }
                    }
                } else {
                    return {
                        play: function() { console.log(1) },
                        stop: function() {}
                    }
                }
            }();

            tabBar.addEventListener("click", function(e) {
                if(!e.target.tagName == "LI" || e.target.className.match("cur")) {
                    return;
                }
                var self = e.target;
                _self.removeClass(tabs[cur], config.curClass);
                _self.addClass(self, config.curClass);
                for(var i = tabs.length; i--; ) {
                    if(tabs[i].className.match(config.curClass)) {
                        cur = i;
                        break;
                    }
                }
                windowContEffect();
            }, false);

            windowCont.addEventListener(startEvent, function(e) {
                isBegin = true;
                x = y = 0;
                isXY = 0;
                sX = _self.client(e, "X");
                sY = _self.client(e, "Y");
                _self.transition(this, "");
                autoSlide.stop();
            }, false);

            windowCont.addEventListener(moveEvent, function(e) {
                if (!isBegin) {
                    return;
                }
                isMove = true;
                var tempX = _self.client(e, "X"),
                    tempY = _self.client(e, "Y");
                dX = tempX - sX;
                dY = tempY - sY;
                sX = tempX;
                sY = tempY;
                x += dX;
                y += dY;
                isXY == 0 && (isXY = Math.abs(dX) > Math.abs(dY) ? -1 : 1);
                if(isXY == 1) {
                    isBegin = false;
                    return;
                }
                e.preventDefault();
                _self.transform(this, "translate3d(" + (x / width  - cur) * percent + "%, 0, 0)");
            }, false);

            windowCont.addEventListener(endEvent, function(e) {
                if(!isBegin) {
                    return isBegin = isMove = false;
                } else if(!isMove) {
                    autoSlide.play();
                    return isBegin = isMove = false;
                }

                _self.removeClass(tabs[cur], config.curClass);
                if (x > slideDistance) {
                    cur = cur === 0 ? 0 : cur - 1;
                } else if (x < -slideDistance) {
                    cur = cur === sliderNum - 1 ? sliderNum - 1 : cur + 1;
                }
                _self.addClass(tabs[cur], config.curClass);
                windowContEffect();
                autoSlide.play();
                isBegin = isMove = false;
            }, false);

            autoSlide.play();
        }

    });

    _self.init(opt);
}
