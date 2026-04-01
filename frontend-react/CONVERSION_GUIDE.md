# Angular to React Conversion Guide

This React project is a complete conversion of the SkillSync Angular frontend, now built with React and JavaScript.

## 📋 Project Structure

```
frontend-react/
├── public/                 # Static files
│   └── index.html         # Main HTML file
├── src/
│   ├── components/        # Reusable React components
│   │   ├── common/       # Common components (forms, lists, etc.)
│   │   └── layout/       # Layout components (header, sidebar, etc.)
│   ├── pages/            # Page components (routes)
│   ├── hooks/            # Custom React hooks (replaces Angular services)
│   ├── services/         # API service layer (replaces Angular services)
│   ├── context/          # React Context for state management (replaces DI)
│   ├── utils/            # Utility functions
│   ├── styles/           # Global and component styles
│   ├── config/           # Configuration files
│   ├── routes/           # React Router setup
│   ├── App.jsx           # Main App component
│   └── main.jsx          # Entry point
├── .eslintrc.json        # ESLint configuration
├── .prettierrc            # Prettier configuration
├── vite.config.js        # Vite build configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🔄 Angular → React Conversion Patterns

### 1. **Components**

#### Angular (TypeScript + Template)

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (data) => (this.users = data),
      error: (err) => console.error(err),
      complete: () => (this.loading = false),
    });
  }
}
```

#### React (JavaScript + Hooks)

```javascript
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  return <div>{/* JSX content */}</div>;
}
```

**Key Differences:**

- Angular class components → React functional components
- Angular OnInit lifecycle → React useEffect hook
- Angular RxJS Observables → React Promises/async-await
- Angular Templates (HTML) → JSX

---

### 2. **Services & Dependency Injection**

#### Angular Service

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
```

#### React Custom Hook

```javascript
// services/userService.js
import apiClient from './apiClient';

export const userService = {
  async getUsers() {
    return apiClient.get('/users');
  },
};

// In component:
import { useAsync } from '../hooks/useAsync';

function MyComponent() {
  const { data: users, isLoading } = useAsync(() => userService.getUsers(), true);
  // ...
}
```

**Key Differences:**

- Angular @Injectable → Simple JS objects/functions
- Angular DI → React Context + Custom Hooks
- RxJS Observables → Promises/Async-await

---

### 3. **Forms**

#### Angular Reactive Forms

```typescript
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // submit
    }
  }
}
```

Template:

```html
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  <span *ngIf="loginForm.get('email')?.errors?.required"> Email required </span>
</form>
```

#### React Controlled Components with Custom Hook

```javascript
import { useForm } from '../hooks/useForm';
import { validators } from '../utils/validators';

function LoginForm() {
  const { values, errors, touched, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    async (values) => {
      // Handle submission
    },
    (values) => ({
      email: validators.required(values.email) || validators.email(values.email),
      password: validators.required(values.password),
    })
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && touched.email && <span>{errors.email}</span>}
    </form>
  );
}
```

**Key Differences:**

- Angular FormGroup → useForm custom hook
- Angular Validators → Custom validators in utils/
- Angular formControlName → React controlled inputs with name attribute
- \*ngIf for validation messages → Conditional rendering

---

### 4. **Routing**

#### Angular Routing Module

```typescript
const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
})
export class AppRoutingModule {}
```

#### React Router Setup

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Key Differences:**

- Angular Routes array → React Router JSX elements
- Angular CanActivate Guard → Custom ProtectedRoute component
- Angular RouterModule → React Router v6 APIs

---

### 5. **State Management**

#### Angular (Services + RxJS)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  setUser(user: User) {
    this.currentUserSubject.next(user);
  }
}

// In component:
this.authService.currentUser$.subscribe((user) => (this.user = user));
```

#### React (Context API + Hooks)

```javascript
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

// In component:
const { user } = useAuth();
```

**Key Differences:**

- Angular BehaviorSubject → React Context + useState
- Angular Observables → React state updates
- RxJS operators → useEffect and state setters

---

### 6. **Directives**

#### Angular Directives

```html
<!-- *ngIf -->
<div *ngIf="isVisible">Content</div>

<!-- *ngFor -->
<div *ngFor="let item of items">{{ item.name }}</div>

<!-- *ngSwitch -->
<div [ngSwitch]="status">
  <div *ngSwitchCase="'active'">Active</div>
  <div *ngSwitchDefault>Inactive</div>
</div>

<!-- [ngClass] -->
<div [ngClass]="{ active: isActive }">Styled</div>

<!-- [ngStyle] -->
<div [ngStyle]="{ color: itemColor }">Styled</div>
```

#### React Conditional Rendering

```jsx
{
  /* Conditional - replaces *ngIf */
}
{
  isVisible && <div>Content</div>;
}

{
  /* Map - replaces *ngFor */
}
{
  items.map((item) => <div key={item.id}>{item.name}</div>);
}

{
  /* Switch/Case - replaces *ngSwitch */
}
{
  status === 'active' ? <div>Active</div> : <div>Inactive</div>;
}

{
  /* Classes - replaces [ngClass] */
}
<div className={isActive ? 'active' : ''}>Styled</div>;

{
  /* Inline Styles - replaces [ngStyle] */
}
<div style={{ color: itemColor }}>Styled</div>;
```

---

### 7. **Two-Way Binding**

#### Angular

```html
<input [(ngModel)]="name" />
```

#### React (Controlled Components)

```jsx
const [name, setName] = useState('');

<input value={name} onChange={(e) => setName(e.target.value)} />;
```

---

## 🚀 Getting Started

### Installation

```bash
cd frontend-react
npm install
```

### Development Server

```bash
npm run dev
```

The app will run at `http://localhost:3000`

### Production Build

```bash
npm run build
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

---

## 📚 Key Files to Understand

1. **src/main.jsx** - Entry point
2. **src/App.jsx** - Main app component with routing
3. **src/routes/AppRoutes.jsx** - Route definitions
4. **src/context/AuthContext.jsx** - Authentication state management
5. **src/hooks/useForm.js** - Form handling hook
6. **src/services/apiClient.js** - HTTP client configuration
7. **src/utils/validators.js** - Form validation utilities

---

## 🔌 Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 📦 Dependencies

### Core

- **react** - UI library
- **react-dom** - React DOM renderer
- **react-router-dom** - Client-side routing

### Utilities

- **axios** - HTTP client
- **zustand** - (Optional) Lightweight state management

### UI Components

- **@mui/material** - Material Design components
- **@emotion/react** - CSS-in-JS styling

### Development

- **vite** - Fast build tool
- **eslint** - Code quality
- **prettier** - Code formatting
- **sass** - SCSS styling support

---

## 🎯 Angular → React Mapping Reference

| Angular         | React                                 |
| --------------- | ------------------------------------- |
| `@Component`    | Function component                    |
| `OnInit`        | `useEffect` hook                      |
| `OnDestroy`     | `useEffect` return                    |
| `@Input`        | Component props                       |
| `@Output`       | Props callbacks                       |
| `@Injectable`   | Custom hooks / services               |
| `HttpClient`    | `axios` / `fetch`                     |
| FormGroup       | `useForm` hook                        |
| Validators      | Custom validators                     |
| RouterModule    | `react-router-dom`                    |
| CanActivate     | Protected routes                      |
| BehaviorSubject | Context + setState                    |
| async pipe      | `useAsync` hook                       |
| `*ngIf`         | Conditional rendering `&&` or ternary |
| `*ngFor`        | `.map()`                              |
| `*ngSwitch`     | Ternary/Switch statement              |
| `[ngClass]`     | className with conditions             |
| `[ngStyle]`     | inline style objects                  |
| Two-way binding | Controlled components                 |

---

## ✅ Conversion Checklist

- ✅ Project structure created
- ✅ Build configuration (Vite)
- ✅ Authentication context
- ✅ React Router setup
- ✅ HTTP client with interceptors
- ✅ Custom hooks (useForm, useAsync, useLocalStorage)
- ✅ Form validation utilities
- ✅ String formatters
- ✅ Utility functions (debounce, throttle, etc.)
- ✅ Example components and pages
- ✅ Layout/Navigation
- ✅ Global styles
- ✅ ESLint & Prettier config

---

## 📝 Best Practices

### Component Organization

- Keep components small and focused
- Use custom hooks for shared logic
- Separate concerns (UI, logic, styling)

### Form Handling

- Use the `useForm` hook for forms
- Implement validators from `utils/validators.js`
- Always handle loading and error states

### API Calls

- Use service objects in `src/services/`
- Use `useAsync` hook for data fetching
- Always implement error handling

### State Management

- Use `useState` for local component state
- Use Context API for global state
- Consider Zustand for complex state

### Styling

- Use SCSS modules for component styles
- Maintain global styles in `src/styles/`
- Follow BEM naming convention for CSS classes

---

## 🔧 Troubleshooting

### Port already in use

```bash
npm run dev -- --port 3001
```

### Module resolution issues

Check `vite.config.js` for correct alias paths

### CORS errors

Ensure proxy config in `vite.config.js` is correct

---

## 📞 Next Steps

1. **Migrate API calls**: Update API endpoints in `src/services/`
2. **Add real components**: Replace placeholder pages with actual content
3. **Implement authentication**: Complete the AUTH flow
4. **Setup CI/CD**: Configure deployment pipeline
5. **Testing**: Add unit and integration tests

---

## 🚦 Additional Resources

- [React Docs](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)
- [Web Development Best Practices](https://developer.mozilla.org)

---

**Created**: April 2024
**React Version**: 18.3.1
**Build Tool**: Vite 5.0
