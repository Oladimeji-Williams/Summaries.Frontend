export const environment = {
  production: false,
  apiBaseUrl: '/api',
  apiUrl: 'https://localhost:5079',
  auth0: {
    domain: 'oladimejiwilliams.us.auth0.com',
    clientId: 'ASDfTa5HSru0Octiy8g0nWwwzZAXmCtK',
    audience: 'https://api.summaries', // exact value from the API's Identifier field
  },
} as const;