var dotenv = require('dotenv');
dotenv.load();

var http = require('http');
var express = require('express');
var cons = require('consolidate');
var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');
var socketio = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var mqttclient = mqtt.connect('mqtt://localhost');
var db = new sqlite3.Database('safehome247.sqlite')

app.engine('hbs', cons.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  db.all('\
  SELECT \
    device.device_id, \
    device.name, \
    device.topic, \
    device.alert, \
    (SELECT message FROM log WHERE log.device_id=device.device_id ORDER BY time DESC LIMIT 1) AS message \
  FROM \
    device \
  WHERE \
    device.account_id=? \
  ', 1, function (err, rows) {
    res.render('index', {devices: rows});
  });
});

io.on('connection', function (socket) {
  socket.on('subscribe', function (data) {
    mqttclient.subscribe(data.topic);
  });
  socket.on('alert', function (data) {
    db.run('UPDATE device SET alert=? WHERE device_id=?', data.value ? 1 : 0, data.device_id)
  });
});

mqttclient.on('message', function (topic, payload) {
  io.emit('mqtt', {'topic': topic, 'payload': payload});
});

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV == 'production') {
  server.listen(3000);
} else {
  server.listen(80);
}
