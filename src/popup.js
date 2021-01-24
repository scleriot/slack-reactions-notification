import Vue from "vue"

import App from './Popup.vue'

var app = new Vue({
    render: createElement => createElement(App)
}).$mount('#app');