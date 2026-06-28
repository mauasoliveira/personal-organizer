# YouTube Subscription Manager

A TypeScript React application to manage your YouTube subscriptions with batch unsubscribe functionality, categories, and local caching.

## Features

- 🔐 **Google OAuth2 Authentication** - Secure client-side authentication
- 📊 **Subscription Management** - View all your YouTube subscriptions
- 🏷️ **Categories & Tags** - Organize subscriptions with custom categories
- 🔍 **Search & Filter** - Find subscriptions quickly
- 📈 **Sorting** - Sort by name, subscriber count, or subscription date
- ✨ **Batch Operations** - Select multiple channels and unsubscribe in bulk
- 💾 **Local Caching** - Cache subscription data for better performance
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Console account
- YouTube Data API v3 enabled

### 1. Clone and Install

```bash
cd youtube
npm install
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `http://your-domain.com` (production)

### 3. Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 4. Development

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Production Build

```bash
npm run build
```

The built files will be in `dist/` directory.

## Self-Hosting

### Static File Server

You can serve the built files with any static file server:

```bash
# Using Python
python -m http.server 8000 --directory dist

# Using Node.js (serve package)
npx serve dist

# Using nginx
# Copy dist/* to your nginx web root
```

### Docker (Optional)

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

For production, set these environment variables:

- `VITE_GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `VITE_GOOGLE_API_KEY` - Your YouTube API key

## API Quota Management

The YouTube Data API has daily quotas:

- **List subscriptions**: 1 unit per request
- **Delete subscription**: 50 units per operation
- **Daily limit**: 10,000 units

The app implements:
- Request batching for unsubscribe operations
- Local caching to reduce API calls
- Rate limiting to respect quotas

## Features in Detail

### Authentication
- Client-side OAuth2 with Google Identity Services
- Secure token handling with automatic refresh
- No server-side components required

### Subscription Management
- View all subscriptions with channel details
- Search by channel name or description
- Filter by categories
- Sort by name, subscriber count, or subscription date

### Batch Operations
- Select multiple channels with checkboxes
- Batch unsubscribe with progress indication
- Confirmation dialogs for safety
- Error handling and retry logic

### Categories & Organization
- Create custom categories with colors
- Assign multiple categories to subscriptions
- Filter by categories
- Persistent local storage

### Caching
- Subscription data cached for 1 hour
- Channel details cached for 24 hours
- Automatic cache invalidation
- Storage usage monitoring

## Development

### Project Structure

```
src/
├── components/          # React components
├── services/          # API and authentication services
├── types/             # TypeScript interfaces
├── utils/             # Constants and utilities
└── hooks/             # Custom React hooks
```

### Key Services

- **AuthService**: Google OAuth2 authentication
- **YouTubeService**: YouTube Data API integration
- **StorageService**: Local storage with TTL

### Adding Features

1. Add types to `src/types/youtube.ts`
2. Create/update services in `src/services/`
3. Build components in `src/components/`
4. Update main App component

## Troubleshooting

### Authentication Issues
- Check Google OAuth client ID configuration
- Ensure authorized origins are correct
- Clear browser cache and cookies

### API Errors
- Check API quota usage in Google Cloud Console
- Verify API key permissions
- Check network connectivity

### Storage Issues
- Clear browser localStorage if corrupted
- Check browser storage quotas
- Use storage export/import for data migration

## License

MIT License - Feel free to use and modify as needed.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the troubleshooting section
- Review Google API documentation
- Open an issue on the repository