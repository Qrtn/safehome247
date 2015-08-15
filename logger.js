var dotenv = require('dotenv');
dotenv.load();

var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');

var db = new sqlite3.Database(process.env.SQLITE_DATABASE)

var mqttclient = mqtt.connect(process.env.MQTT_BROKER_URL)

mqttclient.subscribe('safehome247/#')

mqttclient.on('message', function (topic, payload) {
  var time = Date.now();
  var message = payload.toString();
  console.log('logger:', topic, message);

  db.run('\
  INSERT INTO log (device_id,time,message) \
  SELECT device_id,?,? FROM device WHERE topic=?', time, message, topic, function (err) {
    if (err) {
      console.error('logger:', err);
    }
  });
});
