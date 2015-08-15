var dotenv = require('dotenv');
dotenv.load();

var mqtt = require('mqtt');
var sqlite3 = require('sqlite3');
var sendgrid = require('sendgrid')(process.env.SENDGRID_API_KEY)

var db = new sqlite3.Database('safehome247.sqlite')

var mqttclient = mqtt.connect('mqtt://localhost')

mqttclient.subscribe('safehome247/#')

mqttclient.on('message', function (topic, payload) {
  var message = payload.toString();
  console.log('alert:', topic, message);

  var topic_parts = topic.split('/');

  if (topic_parts[1] === 'security' && message === 'on') {
    var triggered = {};

    db.each('\
    SELECT \
      device.name, \
      email.email \
    FROM \
      device \
      INNER JOIN device_email ON device.device_id=device_email.device_id \
      INNER JOIN email ON email.email_id=device_email.email_id \
    WHERE \
      device.topic=? AND \
      device.alert=1 AND \
      device_email.enabled=1 AND \
      email.verified=1 \
    ', topic, 

    // Row callback
    function (err, row) {
      if (!triggered.hasOwnProperty(row.name)) {
        triggered[row.name] = [];
      }
      triggered[row.name].push(row.email);
    },

    // Completion
    function (err, numRows) {
      for (var fault in triggered) {
        if (triggered.hasOwnProperty(fault)) {
          var email = new sendgrid.Email({
            to: triggered[fault],
            from: 'alert@safehome247.com',
            fromname: 'SafeHome247 Alert',
            subject: (new Date()).toLocaleString() + ': ' + fault,
            text: fault
          });

          sendgrid.send(email, function(err, json) {
            if (err) { console.error(err); }
            console.log('alert:', json);
          });
        }
      }
    });
  }
});
