import app from './app.js';

const PORT = process.env.NODE_DOCKER_PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
