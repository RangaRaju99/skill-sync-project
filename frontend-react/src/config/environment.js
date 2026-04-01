// Environment Configuration
export const environment = {
  production: false,
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  appName: 'SkillSync',
  version: '1.0.0',
};

// Development environment
export const developmentConfig = {
  logLevel: 'debug',
  mockData: true,
};

// Production environment
export const productionConfig = {
  logLevel: 'error',
  mockData: false,
  enableAnalytics: true,
};
