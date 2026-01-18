// app.config.ts
import { ExpoConfig, ConfigContext } from "expo/config";
import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Kuvali",
  slug: "kuvali",
  version: packageJson.version, // Syncing from package.json
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  scheme: "kuvali",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.anonymous.kuvali",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./src/assets/images/android-icon-foreground.png",
      backgroundImage: "./src/assets/images/android-icon-background.png",
      monochromeImage: "./src/assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    package: "com.kuvali.kuvali",
  },
  web: {
    output: "static",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-dev-client",
    "expo-secure-store",
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
        organization: "kuvaliLLC",
        project: "kuvaliApp",
        uploadSourceMaps: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
