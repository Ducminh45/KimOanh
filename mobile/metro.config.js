const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.transformer = {
  ...config.transformer,
  // Enable minification in production
  minifierConfig: {
    keep_classnames: false,
    keep_fnames: false,
    mangle: {
      toplevel: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      drop_console: true, // Remove console logs in production
      dead_code: true,
      loops: true,
      unused: true,
    },
  },
};

// Asset optimization
config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'db', 'sqlite'],
};

// Enable inline requires for better performance
config.transformer.enableBabelRCLookup = false;
config.transformer.enableBabelRuntime = true;

module.exports = config;
