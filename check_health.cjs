const http = require('http');
http.get('http://localhost:3000/api/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log("Health API Response:", data); });
}).on('error', (err) => {
  console.error("Health API Error:", err.message);
});
