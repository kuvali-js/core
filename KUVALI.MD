// KUVALI.MD

# Kuvali - The React-Native Core Framework

This is an internal file with remarks about a lot of things.
It could help others to understand the framework and get fast up to date.


## Accounts - where to find the project

github: @kuvali-js  https://github.com/kuvali-js/core
npm:    @kuvali-js  https://www.npmjs.com/package/@kuvali-js/core
proton: kuvali-js   https://mail.proton.me/
                    mail: kuvali-js@proton.me


### Logging & Error Management

module: **LogLevel**
module: **BugSink**

With a custom plugin and using a decorator.
Which sends error entries to BugSink.


### SplashScreen

(LogRecket Create a SplashScreen descrition)[$https://blog.logrocket.com/building-splash-screens-react-native/]

module: **react-native-bootsplash**

Using bootsplash for the SplashScreen.
Removed the native Expo SplashScreen.

The screens are stored in the assests/bootsplash folder.

THe bootsplash can create all necessary resoultions
and files for ios and android.
Command: `npx react-native generate-bootsplash logo.png`
Resolution 2732 x 2732 px
Main area  1200 x 1200 px
100 DPI


### App Icon

Using Expo’s built-in image processing.
Just put the file in assets/icon.png and
Expo is caring for it.
Command: `npx expo prebuild` (`npx expo prebuild --clean`)
Resolution 1024x1024 px




//### END #################################################
