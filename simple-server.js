const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>שרת מינימלי</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          }
          h1 { text-align: center; margin-bottom: 30px; }
          .info {
            background: rgba(255,255,255,0.1);
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .endpoint {
            background: rgba(255,255,255,0.2);
            padding: 10px;
            margin: 5px 0;
            border-radius: 3px;
            font-family: monospace;
          }
          button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
          }
          button:hover { background: #45a049; }
          #result {
            margin-top: 20px;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            min-height: 50px;
          }
        </style>
      </head>
      <body>
        <h1>🚀 שרת מינימלי</h1>
        
        <div class="info">
          <h3>מידע על השרת:</h3>
          <div class="endpoint">PORT: </div>
          <div class="endpoint">TIME: </div>
          <div class="endpoint">STATUS: ✅ פעיל</div>
        </div>

        <div class="info">
          <h3>Endpoints זמינים:</h3>
          <div class="endpoint">GET / - עמוד ראשי</div>
          <div class="endpoint">GET /api/status - סטטוס השרת</div>
          <div class="endpoint">GET /api/time - זמן נוכחי</div>
          <div class="endpoint">GET /api/info - מידע על השרת</div>
        </div>

        <div class="info">
          <h3>בדיקת ה-API:</h3>
          <button onclick="testAPI('/api/status')">בדוק סטטוס</button>
          <button onclick="testAPI('/api/time')">בדוק זמן</button>
          <button onclick="testAPI('/api/info')">בדוק מידע</button>
          <div id="result"></div>
        </div>

        <script>
          async function testAPI(endpoint) {
            const result = document.getElementById('result');
            try {
              const response = await fetch(endpoint);
              const data = await response.json();
              result.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
            } catch (error) {
              result.innerHTML = 'שגיאה: ' + error.message;
            }
          }
        </script>
      </body>
      </html>
    );
  } else if (req.url === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'שרת פעיל', uptime: process.uptime() }));
  } else if (req.url === '/api/time' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      time: new Date().toISOString(),
      local: new Date().toLocaleString('he-IL'),
      unix: Date.now()
    }));
  } else if (req.url === '/api/info' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      server: 'minimal-http-server',
      version: '1.0.0',
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'לא נמצא', url: req.url }));
  }
});

server.listen(PORT, () => {
  console.log(🚀 שרת מינימלי רץ על port );
  console.log(🌐 גישה מקומית: http://localhost:);
  console.log(⏰ זמן הפעלה: );
});
