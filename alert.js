var dotenv = require('dotenv');
dotenv.load();

var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY);
var helper = require('sendgrid').mail;

var db = new sqlite3.Database('safehome247.sqlite')

var mqttclient = mqtt.connect('mqtt://localhost')

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

function sendAlert(deviceId, message) {
  var emails = [];

  db.all('\
  SELECT \
    email.email \
  FROM \
    device \
    INNER JOIN device_email ON device.device_id=device_email.device_id \
    INNER JOIN email ON email.email_id=device_email.email_id \
  WHERE \
    device.device_id=? AND \
    device.alert=1 AND \
    device_email.enabled=1 AND \
    email.verified=1 \
  ', deviceId,
  function (err, rows) {
    if (rows.length > 0) {
      emails = []
      for (var i = 0; i < rows.length; i++) {
        emails.push({email: rows[i].email});
      }

      var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: {
          personalizations: [{
            to: emails
          }],
          from: {
            email: 'alert@safehome247.com',
            name: 'SafeHome247 Alert'
          },
          subject: (new Date()).toLocaleString() + ': ' +
            message,
          content: [
            {
              type: 'text/plain',
              value: message
            }
          ]
        }
      });

      sendgrid.API(request, function(err, response) {
        if (err) { console.error(err); }
        console.log('alert:', response.statusCode, response.body, response.headers);
      });
    }
  });
}

mqttclient.subscribe('device/+')

mqttclient.on('message', function (topic, payload) {
  var message = payload.toString();
  console.log('alert:', topic, message);

  var topic_parts = topic.split('/');
  var deviceId = topic_parts[1]
  var device = deviceCache[deviceId];

  switch (device.deviceType) {
    case 'motion':
    case 'door':
      if (message === 'on') {
        sendAlert(deviceId, device.deviceName);
      }
      break;
      
    case 'temperature_humidity':
      args = message.split(/\s+/);
      switch (args[0]) {
        case 'fault':
          temperatureF = parseFloat(args[1]) * 9 / 5 + 32;
          humidity = parseFloat(args[2]);
          sendAlert(deviceId, device.deviceName + ': Fault ' + temperatureF.toFixed(1) + '\xB0F ' + humidity + '%');
          break;

        case 'exit':
          sendAlert(deviceId, device.deviceName + ': Offline');
          break;
      }
      break;
  }
});
