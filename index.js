// /index.js
import { registerRootComponent } from 'expo';
import { Buffer } from 'buffer';
import { install } from 'react-native-quick-crypto';

// Set polyfills as first thing, before everyting else.
global.Buffer = Buffer;
install();

import App from './App';
registerRootComponent(App);

//### END #####################################################################