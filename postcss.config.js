const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    // Only run PurgeCSS in production
    ...(process.env.NODE_ENV === 'production' ? [
      purgecss({
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './public/index.html',
        ],
        defaultExtractor: content => {
          // Capture as liberally as possible, including things like `h-(screen-1.5)`
          const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
          
          // Capture classes within other delimiters like .block(class="w-1/2") in Pug
          const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
          
          return broadMatches.concat(innerMatches);
        },
        safelist: [
          // Bootstrap classes that might be added dynamically
          /^btn/,
          /^nav/,
          /^navbar/,
          /^dropdown/,
          /^modal/,
          /^fade/,
          /^show/,
          /^collapse/,
          /^collapsing/,
          /^carousel/,
          /^active/,
          /^disabled/,
          /^sr-only/,
          
          // FontAwesome classes
          /^fa/,
          /^fas/,
          /^far/,
          /^fab/,
          
          // Custom classes that might be added dynamically
          /^loading/,
          /^error/,
          /^success/,
          /^optimized-image/,
          /^image-/,
          
          // Animation classes
          /^fade/,
          /^slide/,
          /^spin/,
          
          // React Router classes
          'active',
          
          // Bootstrap responsive classes
          /^d-/,
          /^flex-/,
          /^justify-/,
          /^align-/,
          /^text-/,
          /^bg-/,
          /^border-/,
          /^rounded/,
          /^shadow/,
          /^p-/,
          /^m-/,
          /^w-/,
          /^h-/,
        ],
        // Remove unused keyframes
        keyframes: true,
        // Remove unused font faces
        fontFace: true,
        // Remove unused CSS variables
        variables: true,
      })
    ] : []),
    
    // Add autoprefixer for better browser support
    require('autoprefixer'),
  ],
};
