$(document).ready(function () {
  var socket = io();

  socket.on('connect', function () {
    socket.on('graphs', function (data) {
      graphsCallbacks[data[0]](data[1]);
    });
  });

  $('div[data-type]').each(function (index, element) {
    var section = $(element);
    var deviceId = section.data('device-id');

    graphsCallbacks[deviceId] = chartTypes[section.data('type')](section);

    var startPickerField = section.find('.datepicker-start')[0];
    var endPickerField = section.find('.datepicker-end')[0];
    var firstDate = new Date($(startPickerField).data('date'));
    var today = new Date();
    today.setHours(0, 0, 0, 0, 0);

    // Adapted from http://nathancahill.github.io/Pikaday/examples/date-range.html
    var startDate = firstDate;
    var endDate = today;
    var updateStartDate = function () {
      startPicker.setStartRange(startDate);
      endPicker.setStartRange(startDate);
      endPicker.setMinDate(startDate);
    };
    var updateEndDate = function () {
      startPicker.setEndRange(endDate);
      startPicker.setMaxDate(endDate);
      endPicker.setEndRange(endDate);
    };
    var startPicker = new Pikaday({
      field: startPickerField,
      minDate: firstDate,
      onSelect: function() {
        startDate = this.getDate();
        updateStartDate();
        updateGraphs();
      }
    });
    var endPicker = new Pikaday({
      field: endPickerField,
      minDate: firstDate,
      onSelect: function() {
        endDate = this.getDate();
        updateEndDate();
        updateGraphs();
      }
    });
    var updateGraphs = function () {
      var endOfDayDate = new Date(endDate.getTime() + 86400000);

      console.log(startDate.getTime(), endOfDayDate.getTime());

      socket.emit('graphs', {
        deviceId: deviceId,
        startTime: startDate.getTime(),
        endTime: endOfDayDate.getTime()
      });
    };
    startPicker.setDate(firstDate, true);
    endPicker.setDate(today, true);
    updateStartDate();
    updateEndDate();
    updateGraphs();
  });
});

var graphsCallbacks = {};

var chartTypes = {
  temperature_humidity: function (section) {
    var hr = section.find('hr');

    var div = $('<div>').attr({
      class: 'temperature_humidity',
    }).insertBefore(hr)[0];

    var plot = $.plot(div, [], {
      xaxes: [{
        mode: 'time',
        axisLabel: 'Time'
      }],
      yaxes: [{
        axisLabel: 'Temperature',
        axisLabelUseCanvas: true,
        axisLabelPadding: 5,
        tickFormatter: function (val, axis) {
          return val + '\xB0F';
        }
      }, {
        axisLabel: 'Humidity',
        axisLabelUseCanvas: true,
        axisLabelPadding: 5,
        position: 'right',
        tickFormatter: function (val, axis) {
          return val + '%';
        }
      }],
      grid: {
        borderWidth: 0,
        hoverable: true,
        clickable: false
      },
      tooltip: {
        show: true,
        content: '%s: <b>%y</b><br>%x',
        xDateFormat: '%a %b %e %Y<br>%I:%M:%S %P'
      },
      colors: ['#F08080', '#87CEFA']
    });

    $(window).resize(function () {
      plot.resize();
      plot.setupGrid();
      plot.draw();
    });

    return function (data) {
      var tempData = [];
      var humidityData = [];

      for (var i = 0; i < data.length; i++) {
        var row = data[i];

        var args = row.message.split(' ');
        if (args[0] == 'ok') {
          var time = new Date(row.time).getTime();
          var temperatureF = parseInt(args[1]) * 9 / 5 + 32;
          var humidity = parseInt(args[2]);

          tempData.push([time, temperatureF]);
          humidityData.push([time, humidity]);
        }
      }

      plot.setData([{
        data: tempData,
        label: 'Temperature'
      }, {
        data: humidityData,
        label: 'Humidity',
        yaxis: 2
      }]);
      plot.setupGrid();
      plot.draw();
    };
  }
}
