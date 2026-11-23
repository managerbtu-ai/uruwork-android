const fs = require("node:fs");

module.exports = ({ config }) => {
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
  if (!googleServicesFile) return config;
  if (!fs.existsSync(googleServicesFile)) {
    throw new Error("GOOGLE_SERVICES_JSON must point to a Firebase configuration file.");
  }

  return {
    ...config,
    android: { ...config.android, googleServicesFile },
    plugins: [...(config.plugins ?? []), "expo-notifications"],
    extra: { ...config.extra, androidVacancyAlerts: true },
  };
};
