import Vue from 'vue'
import './plugins/vuetify'

import App from './App.vue'
import router from './router'
// import './registerServiceWorker'

Vue.config.productionTip = false

import moment from 'moment'
window.moment = moment


import gConst from '@/views/const.js'
window.Const = gConst;

Vue.config.productionTip = false;

import Vuetify from 'vuetify'
Vue.use(Vuetify)

import VeeValidate,{ Validator } from 'vee-validate';
Vue.use(VeeValidate);
import zh_CN from 'vee-validate/dist/locale/zh_CN';
Validator.localize('zh_CN', zh_CN);

import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.min.css'

import 'font-awesome/css/font-awesome.css'

//文档样式
import 'github-markdown-css/github-markdown.css';
import 'markdown-it-highlight/dist/index.css';


import gToast from './services/toast.js'
window.Toast = gToast;

import gDialog from './services/dialog.js'
window.Dialog = gDialog;

import './doc-prev-fullscreen.js'
//https://material.io/icons/

import Loading from '@/views/_/Loading.vue'
import LoadingBar from '@/views/_/LoadingBar.vue'
import Nodata from '@/views/_/Nodata.vue'
Vue.component('LoadingBar',LoadingBar)
Vue.component('Loading',Loading)
Vue.component('Nodata',Nodata)

import '@/views/_/Icons/index.js'


//usage: await delay(1000)  // delay 1 second
window.delay = function(ms){
  return new Promise((a,b)=>{
    var tid = setTimeout(()=>{
      a(tid);
    }, ms)
  })
}
window.clone = function(s){
  return JSON.parse(JSON.stringify(s))
}

/**
 * @param id {String}  uniq
 * @param timeout {int}  ms
 * @param times {int}  超过次数也会调, 然后重新统计
 * @param fn {Function}  callback
 */
var mDelayCall = {};
window.delayRun = function (id, timeout, fn, times) {
  if (!mDelayCall[id]) mDelayCall[id] = {
    tid: '',
    c: 0
  };
  var n = mDelayCall[id];

  n.c++;
  console.log('delayRun count:', n.c, times)
  if (n.c >= times) {
    fn();
    n.c = 0;
  } else {
    clearTimeout(n.tid);
    n.tid = setTimeout(fn, timeout);
  }
}


window.onresize = function (){
  window.MyApp.$emit('window::resize', {
    width: document.documentElement.width,
    height: document.documentElement.height,
  });
}

window.openURL = function(url){
  return isElectron
  ?ASNode.openExternal(url)
  :window.open(url)
}


window.MyApp = new Vue({
  data(){
    //全局对象，使用 this.$root.xxx 访问， 如: this.$root.userInfo
    return {
      userInfo: null
    }
  },
  router,
  render: h => h(App)
}).$mount('#app')
