import Vue from "vue"

import App from './Settings.vue'

var app = new Vue({
    render: createElement => createElement(App)
}).$mount('#app');