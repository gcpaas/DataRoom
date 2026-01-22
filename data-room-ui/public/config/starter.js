(function(window) {
  window.SITE_CONFIG = {
    demoEnv:false,
    starter:{
      title: 'DataRoom大屏设计器',
      version: 'v2.1.0',
      // 登陆页面描述
      description: '<h5>大屏设计器</h5>' +
        '<ul>' +
        '<li>基于Vue+ElementUI+SpringBoot技术栈开发</li>' +
        '<li>提供100+种组件、可视化拖拉拽</li>' +
        '<li>支持9种常见数据集接入，包括MySQL、PostgreSQL、Oracle等</li>' +
        '<li><div style="display: inline-flex; align-items: center; gap: 8px;">' +
        '使用简单，完全免费，代码开源' +
        '<img alt="stars" src="https://gitee.com/gcpaas/DataRoom/badge/star.svg?theme=dark">' +
        '<img alt="forks" src="https://gitee.com/gcpaas/DataRoom/badge/fork.svg?theme=dark">' +
        '</div></li>' +
        '<li>商业版与社区版功能对比详情请见 <a href="http://gcpaas.gccloud.com/#/pricing" target="_blank" style="color: #ffffff">方案说明</a>' +
        '</li>' +
        '</ul>',
      // 底部html设置
      footer: {
        copyright: '大屏设计器 V2.1.0 <a href="http://www.kdgcsoft.com/" target="_blank" class="no-decoration">生态平台PBU</a> 2026  |  版权所有 © <a href="http://www.gccloud.com/" target="_blank">科大国创云网科技有限公司</a>',
      },
      login:{
        // 账号登陆时 验证码间隔
        account: {
          interval: 10
        },
        welcome: {
          title: "欢迎",
          template: "您好，欢迎访问大屏设计器"
        }
      }
    }
  }
})(window);

/**
 * 对象属性合并，与 Object.assign 语法不同
 * @param target
 * @param source
 * @returns {{}}
 */
function configDeepMerge(target, source) {
  var merged = {};
  for (var each in source) {
    if (target.hasOwnProperty(each) && source.hasOwnProperty(each)) {
      if (typeof target[each] == "object" && typeof source[each] == "object") {
        merged[each] = configDeepMerge(target[each], source[each]);
      } else {
        merged[each] = source[each];
      }
    } else if (source.hasOwnProperty(each)) {
      merged[each] = source[each];
    }
  }
  for (var each in target) {
    if (!(each in source) && target.hasOwnProperty(each)) {
      merged[each] = target[each];
    }
  }
  return merged;
}
