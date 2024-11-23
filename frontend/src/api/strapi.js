import axios from 'axios';

const strapiAPI = axios.create({
  baseURL: 'http://localhost:1337/api/',
  headers: {
    'Authorization': `Bearer 86a34a04448c272bdbb725ad622e1c40fc2b94968e9244823b813cf715e4c19cd85d2bb9cd2516d1d2f135e774d03380da92e1f0909201ec105c1b73b3d4ca89336a17d79ad7af618208d219f5fee77772e03f514eb88f97ee885a8ae62a22aa08da5f24585f5ab4ed473817b0b7ba30a242f260692aea65e6f12fd750bbfad0`,
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
strapiAPI.interceptors.request.use(
  async config => {
    return config;
  },
  error => {
    Promise.reject(error)
  }
);

// Response interceptor for API calls
strapiAPI.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response) {
      // Handle specific error cases here
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default strapiAPI;
