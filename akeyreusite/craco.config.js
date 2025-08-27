const path = require('path');
const fs = require('fs');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Production optimizations
      if (env === 'production') {
        // Enable tree shaking
        webpackConfig.optimization = {
          ...webpackConfig.optimization,
          usedExports: true,
          sideEffects: false,
          
          // Split chunks for better caching
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              // Vendor chunk for third-party libraries
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                reuseExistingChunk: true,
              },
              
              // Common chunk for shared code
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
              },
              
              // React chunk
              react: {
                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                name: 'react',
                chunks: 'all',
                priority: 20,
              },
              
              // Bootstrap chunk
              bootstrap: {
                test: /[\\/]node_modules[\\/]bootstrap[\\/]/,
                name: 'bootstrap',
                chunks: 'all',
                priority: 15,
              },
              
              // FontAwesome chunk
              fontawesome: {
                test: /[\\/]node_modules[\\/]@fortawesome[\\/]/,
                name: 'fontawesome',
                chunks: 'all',
                priority: 15,
              }
            }
          },
          
          // Minimize bundle size
          minimize: true,
        };

        // Add bundle analyzer in production if ANALYZE=true
        if (process.env.ANALYZE === 'true') {
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              openAnalyzer: false,
              reportFilename: 'bundle-report.html'
            })
          );
        }
      }

      // Resolve aliases for cleaner imports
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      };

      // Optimize module resolution
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        'node_modules'
      ];

      return webpackConfig;
    },
    
    // Add custom plugins
    plugins: {
      add: [
        // Add any additional plugins here
      ]
    }
  },
  
  // Babel configuration
  babel: {
    plugins: [
      // Add babel plugins for optimization
      ...(process.env.NODE_ENV === 'production' ? [
        // Remove console.log in production
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ] : [])
    ]
  },
  
  // ESLint configuration
  eslint: {
    enable: process.env.NODE_ENV !== 'production',
    mode: 'extends',
    configure: {
      rules: {
        // Performance-related rules
        'no-unused-vars': 'warn',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
      }
    }
  },
  
  // Development server configuration
  devServer: {
    compress: true,
    hot: true,
    open: false,
    port: 3000,
    
    // Enable gzip compression
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  
  // Style configuration
  style: {
    sass: {
      loaderOptions: {
        // Sass loader options - only add if file exists
        ...(fs.existsSync(path.resolve(__dirname, 'src/styles/variables.scss')) ? {
          additionalData: `@import "src/styles/variables.scss";`
        } : {})
      }
    }
  }
};
