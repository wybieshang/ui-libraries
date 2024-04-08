import {
  installOptions,
  installDirectives,
  installComponents,
} from '@vusion/utils';
import Vue from 'vue';
import * as CloudUI from './main';

if (typeof window !== 'undefined') {
  // 一些初始化的操作;
  window.CloudUI = CloudUI;
  Vue.prototype.$env = Vue.prototype.$env || {};
  Vue.prototype.$env.VUE_APP_DESIGNER = String(process.env.VUE_APP_DESIGNER) === 'true';
  Vue.prototype.$at2 = function (obj, propertyPath) {
    if (propertyPath === '' && !this.$env.VUE_APP_DESIGNER) return obj;
    return this.$at(obj, propertyPath);
  };

  installOptions(Vue);
  installDirectives(Vue, CloudUI.directives);
  installComponents(Vue, CloudUI);

  Vue.mixin(CloudUI.MEmitter);
  Vue.mixin(CloudUI.MPubSub);
}
