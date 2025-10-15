module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
      
      // Module resolver for cleaner imports
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@store': './src/store',
            '@utils': './src/utils',
            '@constants': './src/constants',
            '@hooks': './src/hooks',
            '@types': './src/types',
          },
        },
      ],
      
      // Inline imports for better performance
      [
        'transform-inline-environment-variables',
        {
          include: [
            'NODE_ENV',
            'API_URL',
            'SENTRY_DSN',
          ],
        },
      ],
      
      // Remove console logs in production
      ...(process.env.NODE_ENV === 'production'
        ? [
            [
              'transform-remove-console',
              {
                exclude: ['error', 'warn'],
              },
            ],
          ]
        : []),
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          'babel-plugin-transform-remove-debugger',
        ],
      },
    },
  };
};
