var dotenv = require('dotenv');
dotenv.load();

var http = require('http');
var express = require('express');
var exphbs = require('express-handlebars');
var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');
var socketio = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var mqttclient = mqtt.connect(process.env.MQTT_BROKER_URL);
var db = new sqlite3.Database(process.env.SQLITE_DATABASE)

var deviceCache = {};
function setupDeviceCache() {
  db.each('SELECT * FROM device', function (err, row) {
    deviceCache[row['device_id']] = {
      accountId: row['account_id'],
      deviceName: row['name'],
      deviceType: row['type'],
      alert: row['alert']
    };
  });
}
setupDeviceCache();

app.engine('hbs', exphbs());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.redirect('/devices');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/devices', function (req, res) {
  db.all('\
  SELECT \
    device.device_id, \
    device.name, \
    device.type, \
    (SELECT message FROM log WHERE log.device_id=device.device_id ORDER BY time DESC LIMIT 1) AS message \
  FROM \
    device \
  WHERE \
    device.account_id=? \
  ', 1, function (err, rows) {
    res.render('devices', {devices: rows});
  });
});

app.get('/rules', function (req, res) {
  db.all('\
  SELECT \
    device.device_id, \
    device.name, \
    device.alert \
  FROM \
    device \
  WHERE \
    device.account_id=? \
  ', 1, function (err, rows) {
    res.render('rules', {devices: rows});
  });
});

app.get('/logs', function (req, res) {
  res.render('logs');
});

io.on('connection', function (socket) {
  socket.on('login', function (data) {
    // data.sessionId;
    socket.join(1);
  });
  socket.on('alert', function (data) {
    db.run('UPDATE device SET alert=? WHERE device_id=?', data.value ? 1 : 0,
           data.device_id);
  });
  socket.on('logs', function (data) {
    db.all('\
    SELECT \
      log.time, \
      device.name, \
      log.message \
    FROM \
      device INNER JOIN log ON device.device_id=log.device_id \
    WHERE \
      device.account_id=? AND \
      log.time BETWEEN ? AND ? \
    ORDER BY \
      log.time DESC \
    ',
    1, data.time, data.time + 86399999, function (err, rows) {
      socket.emit('logs', rows);
    });
  });
});

mqttclient.on('message', function (topic, payload) {
  var parts = topic.split('/');
  var deviceId = parts[1];
  io.to(deviceCache[deviceId].accountId).emit('update', {'deviceId': deviceId, 'message':
                        payload.toString()});
});

mqttclient.subscribe('device/+')

if (process.env.NODE_ENV == 'production') {
  server.listen(3000);
} else {
  server.listen(80);
}
