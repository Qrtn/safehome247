update = {
  motion: updateMotion,
  door: updateDoor,
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

function updateDoor(sensorStatus, message) {
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
      sensorStatus.text('Open');
      sensorStatus.removeClass('label-default').addClass('label-danger');
      break;

    case 'off':
      sensorStatus.text('Closed');
      sensorStatus.removeClass('label-danger').addClass('label-success');
      break;
  }
}

function updateTemperatureHumidity(sensorStatus, message) {
  args = message.split(' ');
  switch (args[0]) {
    case 'ok':
      temperatureF = parseInt(args[1]) * 9 / 5 + 32
      humidity = parseInt(args[2]);
      sensorStatus.text(temperatureF.toFixed(1) + '\xB0F\t' + humidity + '%');
      sensorStatus.removeClass('label-default label-warning label-danger').addClass('label-primary');
      break;

    case 'checksum':
      sensorStatus.text('Checksum Error');
      sensorStatus.removeClass('label-default label-primary label-danger').addClass('label-warning');
      break;

    case 'timeout':
      sensorStatus.text('Timeout Error');
      sensorStatus.removeClass('label-default label-primary label-warning').addClass('label-danger');
      break;

    case 'exit':
      sensorStatus.text('Offline');
      sensorStatus.removeClass('label-primary label-warning label-danger').addClass('label-default');
      break;
  }
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
  update[sensorStatus.data('type')](sensorStatus, data.message);
}
