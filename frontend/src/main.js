
import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import Editor from 'vue-editor-js/src/index'
import hljs from 'highlight.js'
import minizincHighlighter from './3rdparty/mzn_highlight.js'
import { createProvider } from './vue-apollo'

Vue.config.productionTip = false

Vue.use(Editor)


hljs.registerLanguage('minizinc', minizincHighlighter)

Vue.use(hljs.vuePlugin);

new Vue({
  vuetify,
  router,
  apolloProvider: createProvider(),
  render: h => h(App),
}).$mount('#app')
