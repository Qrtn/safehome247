$(document).ready(function () {
  var socket = io();

  socket.on('connect', function () {
    socket.on('logs', updateTable);
  });

  var datepicker = new Pikaday({
    field: $('#datepicker')[0],
    onSelect: function () {
      socket.emit('logs', {time: this.getDate().getTime()});
    }
  });
  datepicker.setDate(new Date());
});

var defaultCheckedDeviceTypes = ['motion', 'door'];

function updateTable(data) {
  var logs = $('#logs');
  logs.empty();

  var deviceIds = {};
  var rows = [];
  for (var i = 0; i < data.length; i++) {
    row = data[i];
    if (!deviceIds.hasOwnProperty(row.device_id)) {
      deviceIds[row.device_id] = {
        name: row.name,
        type: row.type
      };
    }

    rows.push($("<tr data-device-id='" + row.device_id + "'>").append(
      $('<td>').text(get12HourTime(row.time)),
      $('<td>').text(row.name),
      $('<td>').text(row.message)
    ));
  }

  logs.append(rows);

  var devices = $('#show-devices');
  devices.empty();

  $.each(deviceIds, function (key, value) {
    var checkbox = $("<input type='checkbox'>");
    checkbox.change(function () {
      rows = logs.find("[data-device-id='" + key + "']");
      if (this.checked) {
        rows.show();
      } else {
        rows.hide();
      }
    });

    if ($.inArray(value.type, defaultCheckedDeviceTypes) >= 0) {
      checkbox.prop('checked', true);
    } else {
      checkbox.prop('checked', false);
    }
    checkbox.trigger('change');

    var label = $('<label>');
    label.append(checkbox, document.createTextNode(value.name));
    var div = $("<div class='checkbox'>");
    div.append(label);
    devices.append(div);
  });
}

function get12HourTime(date) {
  var date = new Date(date);
  hours = date.getHours();
  suffix = (hours >= 12)? 'PM' : 'AM';
  hours = (hours > 12)? hours -12 : hours;
  hours = (hours == '00')? 12 : hours;
  minutes = date.getMinutes();
  seconds = date.getSeconds();

  return hours + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + ' ' + suffix;
}
