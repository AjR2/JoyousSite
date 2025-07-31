# Akeyreu Website

A modern React-based website for Akeyreu, a mental wellness company that integrates advanced neural technologies with mental wellness practices.

## 🚀 Features

- **Modern React Architecture**: Built with React 18 and React Router
- **🤖 Nimbus AI Integration**: Multi-agent AI system with GPT-4, Claude, and Grok
- **Serverless API**: Powered by Vercel serverless functions
- **Blog System**: Dynamic blog with JSON-based content management
- **Responsive Design**: Mobile-first design with Bootstrap integration
- **SEO Optimized**: Meta tags, schema markup, and sitemap
- **Contact Form**: EmailJS integration for contact functionality
- **Mental Wellness Tools**: Mindful breaks and wellness content
- **Admin Panel**: Integrated blog and AI management interface

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, Bootstrap 5
- **Backend**: Vercel Serverless Functions
- **Styling**: CSS3, Bootstrap, FontAwesome icons
- **Data**: JSON-based content management
- **Deployment**: Vercel
- **Email**: EmailJS

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd akeyreusite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Nimbus AI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
XAI_GROK_API_KEY=your_grok_api_key_here
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

This will start Vercel's development server with both the React app and serverless functions.

## 🤖 Nimbus AI Integration

The website includes a sophisticated multi-agent AI system called Nimbus AI. For detailed setup and usage instructions, see [NIMBUS_AI_INTEGRATION.md](./NIMBUS_AI_INTEGRATION.md).

### Quick Start
1. Configure AI API keys in `.env.local`
2. Access admin panel at `/admin`
3. Navigate to "🤖 Nimbus AI" tab
4. Test chat functionality and manage agents

### API Endpoints
- `/api/nimbus/chat` - Main chat interface
- `/api/nimbus/agents` - Agent management
- `/api/nimbus/health` - System health checks
- `/api/nimbus/collaborate` - Multi-agent collaboration

## 📝 Content Management

### Blog Posts

Blog posts are managed through JSON files and utility scripts:

```bash
# List all posts
npm run posts:list

# Add a new post
npm run posts:add "Post Title" "January 1, 2024" "Post content here"

# Remove a post
npm run posts:remove "Post Title"
npm run posts:remove 1  # by index

# Validate all posts
npm run posts:validate
```

### Manual Post Management

Posts are stored in `public/posts.json`. Each post should have:
- `title`: Post title
- `date`: Publication date (format: "Month DD, YYYY")
- `content`: Post content (use `<>` for paragraph breaks)

## 🏗️ Build & Deployment

### Build for production:
```bash
npm run build
```

### Deploy to Vercel:
```bash
npm run deploy
```

### Preview deployment:
```bash
npm run preview
```

## 📁 Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── posts/             # Blog post endpoints
│   ├── utils/             # Utility functions
│   ├── docs.js            # API documentation
│   └── search.js          # Search functionality
├── public/                # Static assets
│   ├── posts.json         # Blog post data
│   ├── sitemap.xml        # SEO sitemap
│   └── robots.txt         # SEO robots file
├── scripts/               # Utility scripts
│   └── manage-posts.js    # Blog post management
├── src/
│   ├── components/        # React components
│   ├── assets/           # Images and static files
│   ├── App.js            # Main app component
│   └── index.js          # App entry point
├── .env.example          # Environment variables template
├── .env.local            # Local environment variables
├── package.json          # Dependencies and scripts
└── vercel.json           # Vercel configuration
```

## 🔧 API Endpoints

- `GET /api/posts` - Get all blog posts
- `GET /api/posts/[slug]` - Get specific post by slug
- `GET /api/search?q=query` - Search posts
- `GET /api/docs` - API documentation

## 🎨 Customization

### Styling
- Main styles: `src/App.css`
- Component styles: `src/components/*.css`
- Colors and themes can be customized in CSS variables

### Content
- Update company information in `src/App.js`
- Modify meta tags in `src/components/MetaTags.js`
- Update schema markup in `src/components/SchemaMarkup.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.
