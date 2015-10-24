update = {
  motion: updateMotion,
  temperature_humidity: updateTemperatureHumidity
};

function updateMotion(sensorStatus, message) {
  switch (message) {
    case '':
      sensorStatus.text('Unknown');
      sensorStatus.removeClass('label-success label-danger').addClass('label-default');
      break;

    case 'exit':
      sensorStatus.text('Offline');
      sensorStatus.removeClass('label-success label-danger').addClass('label-default');
      break;

    case 'on':
      sensorStatus.text('Motion');
      sensorStatus.removeClass('label-default').addClass('label-danger');
      break;

    case 'off':
      sensorStatus.text('Idle');
      sensorStatus.removeClass('label-danger').addClass('label-success');
      break;
  }
}

function updateTemperatureHumidity(sensorstatus, message) {
}

$(document).ready(function () {
  var socket = io();
  socket.on('connect', function () {
    socket.emit('login', {'sessionId': 'rubbish'});
    socket.on('update', onUpdate);
  });

  $('span[data-device-id]').each(function () {
    update[$(this).data('type')]($(this), $(this).data('message'));
  });
});

function onUpdate(data) {
  var sensorStatus = $('span[data-device-id="' + data.deviceId + '"]');
  update[data.deviceType](sensorStatus, data.message);
}
