import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VRM from '../../../src/index.js'

Vue.config.productionTip = false

Vue.use(VRM, {
  router,
  redirect: '403'
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
