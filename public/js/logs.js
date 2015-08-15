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

function updateTable(data) {
  var logs = $('#logs');
  logs.empty();

  var rows = [];
  for (var i = 0; i < data.length; i++) {
    rows.push($('<tr>').append(
      $('<td>').text(get12HourTime(data[i].time)),
      $('<td>').text(data[i].name),
      $('<td>').text(data[i].message)
    ));
  }

  logs.append(rows);
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
