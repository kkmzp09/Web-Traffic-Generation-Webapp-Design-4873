// src/config.js
const CONFIG = {
  API_BASE: import.meta.env.VITE_API_BASE || 'https://api.organitrafficboost.com',
  REQUEST_TIMEOUT_MS: 30000,
};
export default CONFIG;