(function(window) {
  window.SITE_CONFIG = {
    dataRoom:{}
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
