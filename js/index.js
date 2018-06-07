$(document).ready(function(){
  $('.fixed-action-btn').floatingActionButton();
  $('.materialboxed').materialbox();
  $('#calendar').attr("width", $(window).width());
});

$(window).resize(function() {
  $('#calendar').attr("width", $(window).width());
});