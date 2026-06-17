const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable package exports resolution to correctly handle modern package ESM structures
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
