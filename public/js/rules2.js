$(document).ready(function () {
  var socket = io();

  $('.active-toggle').bootstrapSwitch();
  $('.active-toggle').on('switchChange.bootstrapSwitch', function (event, state) { });

  $('.table > tbody > tr').click(function () {
    $('#modal-edit-rule').modal('show');
  });

  $('#modal-edit-rule').on('hidden.bs.modal', resetDeleteBtn);

  // Adapted from
  // Copyright 2014, Stefano Cudini - stefano.cudini@gmail.com
  // https://github.com/stefanocudini/bootstrap-confirm-button/blob/master/bootstrap-confirm-button.src.js
  var deleteBtn$ = $('#delete-rule');
  var timer;

  function resetDeleteBtn() {
    deleteBtn$.html('Delete rule').data('confirmed', false);
  }

  deleteBtn$.data('confirmed', false);

  deleteBtn$.on('click.confirm', function () {
    if (deleteBtn$.data('confirmed')) {
      console.log('hello world');
      $('#modal-edit-rule').modal('hide');
    } else {
      deleteBtn$.data('confirmed', true);
      deleteBtn$.html('Confirm').bind('mouseout.confirm', function () {
        timer = setTimeout(resetDeleteBtn, 2000);
      }).bind('mouseover.confirm', function () {
        clearTimeout(timer);
      });
    }
  });
});
