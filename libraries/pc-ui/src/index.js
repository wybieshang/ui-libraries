import {
  installOptions,
  installDirectives,
  installComponents,
} from '@vusion/utils';
import Vue from 'vue';
import * as CloudUI from './main';

let installed = false;

function install(VueCtr) {
  if (installed) return;

  installed = true;
  // 一些初始化的操作;
  window.CloudUI = CloudUI;
  VueCtr.prototype.$env = VueCtr.prototype.$env || {};
  VueCtr.prototype.$env.VUE_APP_DESIGNER = String(process.env.VUE_APP_DESIGNER) === 'true';
  VueCtr.prototype.$at2 = function (obj, propertyPath) {
    if (propertyPath === '' && !this.$env.VUE_APP_DESIGNER) return obj;
    return this.$at(obj, propertyPath);
  };

  installOptions(VueCtr);
  installDirectives(VueCtr, CloudUI.directives);
  installComponents(VueCtr, CloudUI);

  VueCtr.mixin(CloudUI.MEmitter);
  VueCtr.mixin(CloudUI.MPubSub);
}

CloudUI.install = install;
export default CloudUI;

if (typeof window !== 'undefined') {
  install(Vue);
}
