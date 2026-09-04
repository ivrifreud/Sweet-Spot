// app.config.js
export default ({ config }) => {
  const isProd = process.env.APP_ENV === "production";

  return {
    ...config,
    scheme: isProd ? "sweetspot" : "sweetspot-preprod",
    plugins: [...(config.plugins ?? []), "expo-asset"],
    android: {
      ...config.android,
      package: isProd
        ? "com.sweetspotbaam.myexpoapp"
        : "com.sweetspotbaam.myexpoapp.preprod",
    },
    ios: {
      ...config.ios,
      bundleIdentifier: isProd
        ? "com.sweetspotbaam.myexpoapp"
        : "com.sweetspotbaam.myexpoapp.preprod",
    },
  };
};