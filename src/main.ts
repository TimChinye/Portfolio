import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


import * as icons from './fa-icons';
library.add(icons);

createApp(App)
.component('font-awesome-icon', FontAwesomeIcon)
.mount('#site')