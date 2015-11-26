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
// TODO: handle and broadcast device changes for cache update

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

app.get('/graphs', function (req, res) {
  db.all("\
  SELECT \
    device.device_id, \
    device.name, \
    device.type, \
    (SELECT time FROM log WHERE log.device_id=device.device_id ORDER BY time ASC LIMIT 1) AS startDate \
  FROM \
    device \
  WHERE \
    device.account_id=? AND \
    device.type IN ('temperature_humidity') \
  ", 1, function (err, rows) {
    res.render('graphs', {devices: rows});
  });
});

io.on('connection', function (socket) {
  // TODO: authenticate socket.io communication when accounts are established!

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
      device.device_id, \
      log.time, \
      device.name, \
      device.type, \
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
  socket.on('graphs', function (data) {
    db.all('\
    SELECT \
      log.time, \
      log.message \
    FROM \
      device INNER JOIN log ON device.device_id=log.device_id \
    WHERE \
      device.device_id=? AND \
      log.time BETWEEN ? AND ? \
    ',
    data.deviceId, data.startTime, data.endTime, function (err, rows) {
      console.log(err);
      socket.emit('graphs', [data.deviceId, rows]);
    });
  });
});

mqttclient.on('message', function (topic, payload) {
  var parts = topic.split('/');
  var deviceId = parts[1];
  io.to(deviceCache[deviceId].accountId).emit('update', {'deviceId': deviceId, 'message':
                        payload.toString()});
});

mqttclient.subscribe('device/+');

if (process.env.NODE_ENV == 'production') {
  server.listen(3000);
} else {
  server.listen(80);
}
