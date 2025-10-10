# TrafficGen Pro

A modern web traffic generation tool with both VPS and local server support.

## 🚀 Quick Start

### Option 1: Local Development Server (Recommended)

1. **Start the local server:**
   ```bash
   npm run server
   ```

2. **Start the frontend (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Visit the application:**
   Open http://localhost:5173 in your browser

### Option 2: VPS Server

If you have a VPS server running at `67.217.60.57:3000`, the app will automatically connect to it.

## 🛠️ Server Setup

### Local Server Features:
- ✅ Full API compatibility
- ✅ Campaign management
- ✅ Real-time progress tracking
- ✅ No external dependencies
- ✅ Perfect for development and testing

### VPS Server Requirements:
- Node.js server running on port 3000
- CORS enabled for browser requests
- Required endpoints: `/health`, `/run`, `/status`, `/results`, `/stop`

## 📊 API Endpoints

The server provides these endpoints:

- `GET /health` - Server health check (no auth)
- `GET /ping` - Simple ping test (no auth)  
- `GET /status` - Server status (no auth)
- `POST /run` - Start traffic campaign (requires API key)
- `GET /status/:id` - Get campaign status (requires API key)
- `GET /results/:id` - Get campaign results (requires API key)
- `POST /stop/:id` - Stop campaign (requires API key)
- `GET /campaigns` - List all campaigns (requires API key)

## 🔧 Configuration

### Server Auto-Detection:
The app automatically detects and connects to available servers:
1. **VPS Server** (preferred): `http://67.217.60.57:3000`
2. **Local Server** (fallback): `http://localhost:3001`

### Manual Server Selection:
- Use the server options button in the homepage header
- Switch between VPS and local servers instantly
- Changes are saved and persist across sessions

## 🎯 Features

- **Smart Traffic Generation**: Human-like browsing behavior
- **Real-time Monitoring**: Live progress tracking and statistics
- **Multiple Server Support**: VPS and local development servers
- **Automatic Fallback**: Seamlessly switches to available servers
- **Campaign Management**: Start, stop, and monitor multiple campaigns
- **Server Diagnostics**: Built-in tools to test server connectivity

## 🔍 Troubleshooting

### Server Offline Issues:

1. **Start Local Server:**
   ```bash
   npm run server
   ```

2. **Check Server Status:**
   Visit `/diagnostic` page for detailed server tests

3. **VPS Server Issues:**
   - Ensure port 3000 is open: `sudo ufw allow 3000`
   - Check if server is running: `netstat -tlnp | grep :3000`
   - Verify CORS configuration

### Common Solutions:

- **"No servers available"**: Run `npm run server` to start local server
- **"Connection timeout"**: Check firewall settings and server status
- **"CORS error"**: Ensure server has proper CORS headers configured

## 🚦 Server Status Indicators

- 🟢 **Green**: Server online and responsive
- 🔴 **Red**: Server offline or unreachable
- 🟡 **Yellow**: Checking server status

## 📝 Development

### Available Scripts:

- `npm run dev` - Start development server
- `npm run server` - Start local API server
- `npm run dev:full` - Start both frontend and API server
- `npm run build` - Build for production

### Project Structure:

```
src/
├── components/        # React components
├── lib/              # Utilities and helpers
├── api.js            # API client with server detection
├── config.js         # Server configuration
└── main.jsx          # Application entry point
```

## 🔐 API Authentication

All campaign-related endpoints require the API key:
```
x-api-key: m7fB9zQv4kR2sX8nH6pW0tLq3YvZ1uC5gD8eF4rJp
```

Health check endpoints (`/health`, `/ping`, `/status`) don't require authentication.

---

**Need Help?** Visit the diagnostic page (`/diagnostic`) for detailed server connectivity tests and troubleshooting steps.