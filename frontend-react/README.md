# SkillSync Frontend - React Version

A complete React conversion of the SkillSync Angular frontend application.

## Quick Start

### Prerequisites

- Node.js 16+ and npm 8+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable React components
├── pages/              # Page components for routes
├── hooks/              # Custom React hooks
├── services/           # API service layer
├── context/            # React Context for state
├── utils/              # Utility functions
├── styles/             # Global and component styles
├── routes/             # React Router configuration
├── config/             # Environment configuration
└── main.jsx            # Application entry point
```

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format

# Run tests (when configured)
npm test
```

## Key Features

✅ **React 18** - Latest React version with hooks  
✅ **React Router v6** - Client-side routing  
✅ **Context API** - State management  
✅ **Custom Hooks** - Reusable logic  
✅ **Vite** - Fast build tool  
✅ **SCSS** - Advanced styling  
✅ **Form Handling** - Custom form hook with validation  
✅ **API Integration** - Axios with interceptors  
✅ **Authentication** - AuthContext with protection  
✅ **Responsive Design** - Mobile-friendly UI

## Major Conversions from Angular

### Components → React Functional Components

- All Angular class components converted to functional components
- Lifecycle hooks replaced with React hooks (useEffect, useState, etc.)
- Templates converted to JSX

### Services → Custom Hooks & API Client

- Angular services replaced with custom React hooks
- API calls centralized in service objects
- HTTP client with axios and interceptors

### Forms → Controlled Components + useForm Hook

- Angular Reactive Forms replaced with useForm custom hook
- Validators moved to utils/validators.js
- Template-driven forms replaced with controlled components

### State Management → Context API

- Angular DI replaced with React Context
- Services replaced with Context providers and custom hooks
- Global state managed through AuthContext

### Routing → React Router v6

- Angular RouterModule replaced with React Router
- Route guards replaced with ProtectedRoute components
- Navigation using useNavigate hook

## Important Files

- **src/main.jsx** - Application entry point
- **src/App.jsx** - Main component with routing
- **src/routes/AppRoutes.jsx** - Route definitions
- **src/context/AuthContext.jsx** - Authentication state
- **src/hooks/useForm.js** - Form handling
- **src/services/apiClient.js** - HTTP client
- **vite.config.js** - Build configuration
- **package.json** - Dependencies

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Documentation

- [Conversion Guide](./CONVERSION_GUIDE.md) - Detailed Angular → React patterns
- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Vite Documentation](https://vitejs.dev)

## Next Steps

1. Replace placeholder components with actual application code
2. Connect to real API endpoints
3. Add comprehensive testing
4. Setup CI/CD pipeline for deployment
5. Configure production build settings

## Troubleshooting

**Port 3000 already in use:**

```bash
npm run dev -- --port 3001
```

**Node modules issues:**

```bash
rm -rf node_modules
npm install
```

**Clear build cache:**

```bash
rm -rf dist
npm run build
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

---

**Version**: 1.0.0  
**Created**: April 2024  
**Tech Stack**: React 18, React Router v6, Vite, SCSS, Axios
