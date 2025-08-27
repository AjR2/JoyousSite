# Joyous Website

A modern React-based website for Joyous, a mental wellness company that helps you choose joy and share wellness through neuroscience and real-time technology.

## 🚀 Features

- **Modern React Architecture**: Built with React 18 and React Router
- **Multi-Agent AI Integration**: Advanced AI system with GPT-4, Claude, and Grok
- **Serverless API**: Powered by Vercel serverless functions
- **Blog System**: Dynamic blog with JSON-based content management
- **Responsive Design**: Mobile-first design with optimized performance
- **SEO Optimized**: Meta tags, schema markup, and sitemap
- **Mental Wellness Focus**: Content and tools focused on joy and wellness

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router, CSS3
- **Backend**: Vercel Serverless Functions, Python FastAPI (Multi-Agent)
- **Styling**: CSS3, FontAwesome icons, Three.js animations
- **Data**: JSON-based content management
- **Deployment**: Vercel
- **AI**: OpenAI GPT-4, Anthropic Claude, X.ai Grok

## 📦 Installation

1. Clone the repository:
```bash
git clone git@github.com:AjR2/JoyousSite.git
cd JoyousSite/akeyreusite
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

## 🤖 Multi-Agent AI Integration

The website includes a sophisticated multi-agent AI system with GPT-4, Claude, and Grok integration.

### Quick Start
1. Configure AI API keys in `.env.local`
2. The AI system is accessible through the multiAgent directory
3. Deploy the FastAPI backend for full functionality

### API Endpoints
- `/api/nimbus/chat` - Main chat interface
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
├── akeyreusite/           # Main React website
│   ├── api/              # Vercel serverless functions
│   ├── public/           # Static assets
│   ├── scripts/          # Utility scripts
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   ├── assets/       # Images and static files
│   │   └── styles/       # CSS styles
│   ├── package.json      # Dependencies and scripts
│   └── vercel.json       # Vercel configuration
├── multiAgent/           # Multi-agent AI system
│   ├── app/              # FastAPI application
│   ├── dashboard-ui/     # React dashboard
│   ├── main.py           # FastAPI main file
│   └── requirements.txt  # Python dependencies
└── README.md             # This file
```

## 🔧 API Endpoints

- `GET /api/posts` - Get all blog posts
- `GET /api/posts/[slug]` - Get specific post by slug
- `GET /api/search?q=query` - Search posts
- `GET /api/nimbus/health` - AI system health check
- `POST /api/nimbus/chat` - AI chat interface

## 🎨 Customization

### Styling
- Main styles: `src/App.css`
- Component styles: `src/components/*.css`
- Joyous brand colors and themes in CSS variables

### Content
- Update content in `src/App.js`
- Modify meta tags in `src/components/MetaTags.js`
- Blog posts managed through `public/posts.json`

## 📄 License

This project is licensed under the ISC License.

---

**Joyous - Choose Joy. Share Wellness.**
