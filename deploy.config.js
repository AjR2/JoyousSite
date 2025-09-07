// JoyousSite Deployment Configuration
// This file contains deployment settings and environment-specific configurations

module.exports = {
  // Build settings
  build: {
    outputDir: 'build',
    sourceMap: process.env.NODE_ENV !== 'production',
    minify: process.env.NODE_ENV === 'production',
    
    // Files to copy to build directory
    staticFiles: [
      'robots.txt',
      'sitemap.xml',
      'favicon.ico',
      'manifest.json',
      'sw.js',
      'posts.json',
      'llms.txt'
    ],
    
    // Build commands for different environments
    commands: {
      development: 'npm run build',
      staging: 'NODE_ENV=staging npm run build',
      production: 'npm run build'
    }
  },

  // Deployment targets
  targets: {
    vercel: {
      name: 'Vercel',
      command: 'vercel',
      productionFlag: '--prod',
      previewFlag: '',
      requiresAuth: true,
      authCommand: 'vercel login',
      statusCommand: 'vercel whoami',
      configFile: 'vercel.json'
    },
    
    netlify: {
      name: 'Netlify',
      command: 'netlify deploy',
      productionFlag: '--prod',
      previewFlag: '',
      requiresAuth: true,
      authCommand: 'netlify login',
      statusCommand: 'netlify status',
      buildDirFlag: '--dir=build'
    },
    
    static: {
      name: 'Static Files',
      description: 'Generate static files for manual deployment',
      outputFormat: 'tar.gz'
    }
  },

  // Environment-specific settings
  environments: {
    development: {
      NODE_ENV: 'development',
      generateSourceMaps: true,
      minifyAssets: false
    },
    
    staging: {
      NODE_ENV: 'staging',
      generateSourceMaps: true,
      minifyAssets: true
    },
    
    production: {
      NODE_ENV: 'production',
      generateSourceMaps: false,
      minifyAssets: true
    }
  },

  // Pre-deployment checks
  checks: {
    // Required files that must exist
    requiredFiles: [
      'package.json',
      'public/index.html',
      'src/App.js'
    ],
    
    // Scripts to run before deployment
    preDeploymentScripts: [
      'posts:validate',
      'sitemap:generate'
    ],
    
    // Post-build validations
    buildValidations: [
      'vercel-build.js'
    ]
  },

  // Notification settings (for future enhancement)
  notifications: {
    slack: {
      enabled: false,
      webhook: process.env.SLACK_WEBHOOK_URL
    },
    
    email: {
      enabled: false,
      recipients: []
    }
  },

  // Rollback settings
  rollback: {
    enabled: true,
    keepVersions: 5
  }
};
