var dotenv = require('dotenv');
dotenv.load();

var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY)

var db = new sqlite3.Database('safehome247.sqlite')

var mqttclient = mqtt.connect('mqtt://localhost')

mqttclient.subscribe('device/#')

mqttclient.on('message', function (topic, payload) {
  var message = payload.toString();
  console.log('alert:', topic, message);

  var topic_parts = topic.split('/');
  var accountId = topic_parts[1];
  var deviceType = topic_parts[2];
  var deviceId = topic_parts[3];

  if (deviceType === 'motion' && message === 'on') {
    var deviceName = null;
    var emails = [];

    db.all('\
    SELECT \
      device.name, \
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
          emails.push(rows[i].email);
        }
        deviceName = rows[0].name;

        var email = new sendgrid.Email({
          to: emails,
          from: 'alert@safehome247.com',
          fromname: 'SafeHome247 Alert',
          subject: (new Date()).toLocaleString() + ': ' + deviceName,
          text: deviceName
        });

        sendgrid.send(email, function(err, json) {
          if (err) { console.error(err); }
          console.log('alert:', json);
        });
      }
    });
  }
});
