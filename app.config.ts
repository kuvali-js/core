// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";
import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Kuvali",
  slug: "kuvali",
  version: packageJson.version, // Syncing from package.json
  platforms: ["android", "ios"], // , "web"
  orientation: "portrait",
  scheme: "kuvali",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.cebulon.kuvali",
  },
  icon: "./src/assets/images/MirrorMirrorOval-WhiteBg.png",
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./src/assets/images/MirrorMirrorOval.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.cebulon.kuvali",
  },
  web: {
    output: "static",
    favicon: "./src/assets/images/MirrorMirrorOval-WhiteBg.png",
  },
  plugins: [
    "expo-dev-client",
    "expo-secure-store",
    [
      "expo-router",
      {
        root: "./src/app" // Expo-router root
      }
    ],
    [ 
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.1",
          extraPods: [
            {
              name: "simdjson",
              path: "../node_modules/@nozbe/simdjson",
              modular_headers: true,
            },
          ],
        },
        android: {
          minSdkVersion: 24,
        },
      },
    ],
    [ 
      "@sentry/react-native/expo",
      {
        organization: "Cebulon",
        project: "KuvaliApp",
        uploadSourceMaps: false,
      },
    ],
    [
      "react-native-bootsplash",
      {
        "assetsDir": "./src/assets/bootsplash",   // !!! important !!! otherwise bootsplash does not find the /src/bootsplash folder
        "logo": "./src/assets/images/MirrorMirrorOval.png",
        "logoWidth": 200,
        "backgroundColor": "#FFFFFF",
        "darkBackgroundColor": "#1A1A1A"
      }
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
