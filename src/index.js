// 'app/index.js'

import { registerRootComponent } from "expo";
import { Buffer } from "buffer";
import { install } from "react-native-quick-crypto";

// Set polyfills as first thing, before everyting else.
global.Buffer = Buffer;
install();

console.log("########################################################## \n index.js \n################################################################")

import App from "./App";
registerRootComponent(App);

//### END #####################################################################
