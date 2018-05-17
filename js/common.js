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
          if($(window).width() >= 840) {
            $('.nameFull').removeClass('hiddenAcronym');
          }
        },
        function () {
          if($(window).width() >= 840) {
            $('.nameFull').addClass('hiddenAcronym');
          }
        }
      );
      // Replaces all <img source=".svg"></img> into inline svg
      $('img[src$=".svg"]').each(function() {
          var $img = jQuery(this);
          var imgURL = $img.attr('src');
          var attributes = $img.prop("attributes");

          $.get(imgURL, function(data) {
              // Get the SVG tag, ignore the rest
              var $svg = jQuery(data).find('svg');

              // Remove any invalid XML tags
              $svg = $svg.removeAttr('xmlns:a');

              // Loop through IMG attributes and apply on SVG
              $.each(attributes, function() {
                  $svg.attr(this.name, this.value);
              });

              // Replace IMG with SVG
              $img.replaceWith($svg);
          }, 'xml');
      });
    });
  });
});