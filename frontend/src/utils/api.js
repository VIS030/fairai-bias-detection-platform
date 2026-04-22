import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // ML operations can take time
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dataset endpoints
export const loadDemoDataset = () => api.post('/dataset/demo');
export const uploadDataset = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/dataset/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getDatasetInfo = () => api.get('/dataset/info');
export const previewDataset = (rows = 10) => api.get(`/dataset/preview?rows=${rows}`);

// Analysis endpoints
export const runAnalysis = (target = 'income', sensitive = 'sex') =>
  api.post(`/analysis/run?target_column=${target}&sensitive_column=${sensitive}`);
export const getAnalysisResults = () => api.get('/analysis/results');
export const applyMitigation = () => api.post('/analysis/mitigate');

// Insights endpoints
export const getInsights = () => api.get('/insights');

// Health check
export const healthCheck = () => api.get('/health');

export default api;
