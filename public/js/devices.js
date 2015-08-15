function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

/*
function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
*/

$(document).ready(function () {
  var socket = io();
  socket.on('connect', function () {
    socket.on('mqtt', onMQTT)
    socket.emit('subscribe', {topic: 'safehome247/#'});
  });

  $('span[data-topic^="safehome247/security/"]').each(function (index, value) {
    switch ($(this).data('message')) {
      case 'on':
        security_motion($(this));
        break;
      case 'off':
        security_idle($(this));
        break;
      case '':
        unknown($(this));
        break;
    }
  });
});

function onMQTT(data) {
  var parts = data.topic.split('/');
  var sensorType = parts[1];
  var sensorStatus = $('span[data-topic="' + data.topic + '"]')
  switch (sensorType) {
    case 'security':
      security(sensorStatus, data.payload);
      break;
  }
}

function security(sensorStatus, payload) {
  message = ab2str(payload);
  switch (message) {
    case 'on':
      security_motion(sensorStatus);
      break;
    case 'off':
      security_idle(sensorStatus);
      break;
    case 'exit':
      offline(sensorStatus);
      break;
  }
}

function unknown(sensorStatus) {
  sensorStatus.text('Unknown');
  sensorStatus.removeClass('label-success label-danger').addClass('label-default');
}

function offline(sensorStatus) {
  sensorStatus.text('Offline');
  sensorStatus.removeClass('label-success label-danger').addClass('label-default');
}

function security_motion(sensorStatus) {
  sensorStatus.text('Motion');
  sensorStatus.removeClass('label-default').addClass('label-danger');
}

function security_idle(sensorStatus) {
  sensorStatus.text('Idle');
  sensorStatus.removeClass('label-danger').addClass('label-success');
}
