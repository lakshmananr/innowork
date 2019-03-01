var express = require('express');
var app = express(); 
const path = require('path');
const SERVER_PORT = process.env.PORT || 8080;

let server = null;

app.use(express.static('public'));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Header',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});  

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'webdir/index.html'));
});


app.get('/brand', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'webdir/brand.html'));
});
app.get('/Service', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'webdir/Service.html'));
});

server = app.listen(SERVER_PORT, '0.0.0.0', () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
