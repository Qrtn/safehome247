$(document).ready(function () {
  var socket = io();

  $('.alert-toggle').bootstrapSwitch();
  $('.alert-toggle').on('switchChange.bootstrapSwitch', function (event, state) {
    socket.emit('alert', {value: state, device_id: $(this).data('device-id')});
  });

  $('#all-alerts-on').click(function () { $('.alert-toggle[data-critical=0]').bootstrapSwitch('state', true); });
  $('#all-alerts-off').click(function () { $('.alert-toggle[data-critical=0]').bootstrapSwitch('state', false); });
});
