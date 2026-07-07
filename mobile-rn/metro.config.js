const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  config.resolver.sourceExts = [
    ...config.resolver.sourceExts,
    'css',
  ];

  config.resolver.assetExts = [
    ...config.resolver.assetExts,
    'wasm',
  ];

  return config;
})();
