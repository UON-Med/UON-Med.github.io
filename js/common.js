$( document ).ready(function() {
  var includes = $('[data-include]');
  jQuery.each(includes, function(){
    var file = 'views/' + $(this).data('include') + '.html';
    $(this).load(file, function() {
      // Everything below here is doen in callback for imported content
      // ie content imported must have its js bindings done here
      $(this).children(':first').unwrap();
      $('.sidenav').sidenav();
      $('.acronym').hover(
        function () {
          if($(window).width() >= 720) {
            $('.nameFull').removeClass('hiddenAcronym');
          }
        },
        function () {
          if($(window).width() >= 720) {
            $('.nameFull').addClass('hiddenAcronym');
          }
        }
      );
    });
  });
});