import Vue from 'vue';
import {
  installOptions,
  installComponents,
} from '@vusion/utils';
import * as Vant from './main';

let installed = false;
function install(VueCtr) {
  if (installed) return;

  installed = true;
  VueCtr.prototype.$env = VueCtr.prototype.$env || {};
  VueCtr.prototype.$env.VUE_APP_DESIGNER = String(process.env.VUE_APP_DESIGNER) === 'true';
  VueCtr.prototype.$env = VueCtr.prototype.$env || {};
  VueCtr.prototype.$env.VUE_APP_DESIGNER = String(process.env.VUE_APP_DESIGNER) === 'true';
  VueCtr.prototype.$at2 = function (obj, propertyPath) {
    if (propertyPath === '' && !this.$env.VUE_APP_DESIGNER) return obj;
    return this.$at(obj, propertyPath);
  };

  // 梳理下来只有install被使用过
  window.CloudUI = {
    MEmitter: Vant.MEmitter,
    MPubSub: Vant.MPubSub,
  };

  installOptions(VueCtr);
  installComponents(VueCtr, Vant);

  VueCtr.mixin(Vant.MEmitter);
  VueCtr.mixin(Vant.MPubSub);
}

Vant.install = install;
export default Vant;

if (typeof window !== 'undefined') {
  install(Vue);
}
