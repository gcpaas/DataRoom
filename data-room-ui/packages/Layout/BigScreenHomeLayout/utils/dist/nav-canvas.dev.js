"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NavCanvas = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var NavCanvas =
/*#__PURE__*/
function () {
  function NavCanvas(el, tabSelector) {
    var selectedTabIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    _classCallCheck(this, NavCanvas);

    this.j = 0.85;
    this.k = 10;
    this.l = 4;
    this.pattern = null;
    this.tabWidthList = [];
    this.tabHeight = 0;
    this.opt = {
      currentIndex: 0,
      nextIndex: 1,
      speed: 1,
      timer: 0,
      width: 200,
      height: 100,
      animating: false,
      curDisX: 0,
      distance: 0
    };
    this.canvas = document.getElementById(el);
    this.tabs = document.querySelectorAll(tabSelector);
    var opt = this.opt;
    this.calcTabs();
    this.initCanvas(this.canvas, opt.width, opt.height);
    this.createPattern(this.canvas);
    this.startDraw(0);
    this.toggle(selectedTabIndex);
  }

  _createClass(NavCanvas, [{
    key: "initCanvas",
    value: function initCanvas(canvas, width, height) {
      var ctx = canvas.getContext('2d');
      var _window = window,
          devicePixelRatio = _window.devicePixelRatio;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = "".concat(width, "px");
      canvas.style.height = "".concat(height, "px");
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
  }, {
    key: "calcTabs",
    value: function calcTabs() {
      var opt = this.opt,
          tabs = this.tabs;
      var ws = [];
      var totalWidth = 0;
      tabs.forEach(function (node) {
        ws.push(totalWidth);
        totalWidth += node.offsetWidth;
      });
      ws[0] = -20;
      ws.push(totalWidth);
      this.tabWidthList = ws;
      this.tabHeight = tabs[0].offsetHeight + 0;
      opt.height = this.tabHeight + 20;
      opt.width = window.innerWidth;
    }
  }, {
    key: "createPattern",
    value: function createPattern(canvas) {
      var w = 140;
      var h = 63;
      var r = 1;
      var imgCanvas = document.createElement('canvas');
      imgCanvas.width = w;
      imgCanvas.height = h;
      imgCanvas.style.width = "".concat(w / r, "px");
      imgCanvas.style.height = "".concat(h / r, "px");
      var ctx = imgCanvas.getContext('2d');
      ctx.scale(r, r);
      ctx.lineWidth = 0.4;

      for (var g = 3, _h = 0.8, j = 1; j < 30; j++) {
        ctx.strokeStyle = "RGBA(22, 120, 160, ".concat(_h, ")");
        ctx.beginPath();
        ctx.moveTo(0, j * g);
        ctx.lineTo(w, j * g);
        ctx.stroke();
        ctx.closePath();

        if (j > 10) {
          _h -= 0.1;
        }
      }

      this.pattern = canvas.getContext('2d').createPattern(imgCanvas, 'repeat-x');
    }
  }, {
    key: "calcAvgSpeed",
    value: function calcAvgSpeed(a) {
      var l = this.l,
          j = this.j,
          k = this.k;
      var b = (l * j * a + k * (1 - j) * a) / (k * l * 20);
      return Math.max(Math.abs(b), 2.5) * Math.sign(b);
    }
  }, {
    key: "getCurSpeed",
    value: function getCurSpeed(a, b) {
      var l = this.l,
          j = this.j,
          k = this.k,
          opt = this.opt;
      return Math.abs(a) > Math.abs(j * b) ? l * opt.speed : k * opt.speed;
    }
  }, {
    key: "calCurve",
    value: function calCurve(ctx, a, b, c, d, e) {
      ctx.bezierCurveTo(a + e, b, c - e, d, c, d);
    }
  }, {
    key: "drawHightlight",
    value: function drawHightlight(index) {
      var opt = this.opt;
      var ctx = this.canvas.getContext('2d');
      var d = 0.3;
      ctx.clearRect(0, 0, 2 * opt.width, 2 * opt.height);
      ctx.shadowColor = 'rgba(36, 131, 255, 1)';
      ctx.shadowBlur = 5;
      ctx.strokeStyle = '#004CB3';
      ctx.lineWidth = 0.8;
      ctx.fillStyle = 'none';
      this.draw(ctx, false);
      var gradient = ctx.createLinearGradient(0, 0, opt.width, opt.height);
      var f = index - d;
      gradient.addColorStop(Math.min(1, Math.max(0, 0 + f)), 'rgba(0,0,0,0)');
      gradient.addColorStop(Math.min(1, Math.max(0, 0 + f + 0.1)), '#8ed6ff');
      gradient.addColorStop(Math.min(1, 0 + f + d), '#8ed6ff');
      gradient.addColorStop(Math.min(1, 0 + f + d + 0.1), 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = gradient;
      ctx.fillStyle = this.pattern;
      this.draw(ctx, true);
    }
  }, {
    key: "startDraw",
    value: function startDraw(index) {
      var _this = this;

      this.drawHightlight(index);
      this.opt.timer = requestAnimationFrame(function () {
        _this.startDraw((index + 0.005) % 1.6);
      });
    }
  }, {
    key: "draw",
    value: function draw(ctx, trueorfalse) {
      var opt = this.opt,
          tabWidthList = this.tabWidthList,
          tabHeight = this.tabHeight;
      var navindex = opt.currentIndex;
      var tableHeight = tabHeight;
      var f = 0;
      var g = 40;
      var i = 20;
      var j = 0.5;
      var k = 2.5;
      var l = 0;
      ctx.beginPath();
      ctx.moveTo(-50, opt.height + 10);
      ctx.lineTo(-50, tableHeight + j);

      if (opt.animating) {
        var m = this.getCurSpeed(opt.curDisX, opt.distance);
        l = Math.min(Math.abs(opt.distance), Math.abs(opt.curDisX + m)) * Math.sign(m);
      }

      ctx.lineTo(f + tabWidthList[navindex] + l - g / 2, tableHeight + j);
      this.calCurve(ctx, f + tabWidthList[navindex] + l - g / 2, tableHeight + j, f + tabWidthList[navindex] + l + g / 2, k + j, i);

      if (opt.animating) {
        var o = tabWidthList[opt.nextIndex + 1] - tabWidthList[opt.nextIndex];
        ctx.lineTo(f + tabWidthList[navindex] + o + l - g / 2, k + j);
        this.calCurve(ctx, f + tabWidthList[navindex] + o + l - g / 2, k + j, f + tabWidthList[navindex] + o + l + g / 2, tableHeight + j, i);
      } else {
        ctx.lineTo(f + tabWidthList[navindex + 1] + l - g / 2, k + j);
        this.calCurve(ctx, f + tabWidthList[navindex + 1] + l - g / 2, k + j, f + tabWidthList[navindex + 1] + l + g / 2, tableHeight + j, i);
      }

      ctx.lineTo(opt.width + 10, tableHeight + j);
      ctx.lineTo(opt.width + 10, opt.height + 10);
      ctx.closePath();
      ctx.stroke();

      if (trueorfalse) {
        ctx.fill();
      }

      if (trueorfalse && opt.animating) {
        opt.curDisX = l;

        if (Math.abs(l) >= Math.abs(opt.distance)) {
          opt.animating = false;
          opt.currentIndex = opt.nextIndex;
        }
      }
    }
  }, {
    key: "toggle",
    value: function toggle(navindex) {
      var opt = this.opt,
          tabWidthList = this.tabWidthList;

      if (navindex !== opt.currentIndex && tabWidthList && tabWidthList.length && (!opt.animating || navindex !== opt.nextIndex)) {
        opt.animating = true;
        opt.distance = tabWidthList[navindex] - tabWidthList[opt.currentIndex];
        opt.speed = this.calcAvgSpeed(opt.distance);
        opt.curDisX = 0;
        opt.nextIndex = navindex;
      }
    }
  }, {
    key: "resize",
    value: function resize() {
      var opt = this.opt;

      if (opt.timer) {
        cancelAnimationFrame(opt.timer);
      }

      this.calcTabs();
      this.initCanvas(this.canvas, opt.width, opt.height);
      this.startDraw(0);
    }
  }]);

  return NavCanvas;
}();

exports.NavCanvas = NavCanvas;