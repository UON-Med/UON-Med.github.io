function positionSeahorse() {
  var headerHeight = $('#nav-bar').height();
  var logoHeight = headerHeight*0.8;
  var logoMargin = headerHeight*0.1;
  $('.seahorse').height(logoHeight);
  $('.seahorse').width(logoHeight);
  $('.seahorse').css('margin-bottom',logoMargin+'px');

  // Makes seahorse prominent on small screens
  if($(window).width() < 300) {
    $('.initial').hide(); 
  } else {
    $('.initial').show();     
  }
}

$( document ).ready(function() {
  var includes = $('[data-include]');
  jQuery.each(includes, function(){
    var file = 'views/' + $(this).data('include') + '.html';
    // ---------------------------------------------------------------
    // Everything below here is doen in callback for imported content
    // ie content imported must have its js bindings done here
    // ---------------------------------------------------------------
    $(this).load(file, function() {
      // Removes the wrapping template div
      $(this).children(':first').unwrap();
      // Initialises materialize css elements
      $('.sidenav').sidenav();
      $('.dropdown-trigger').dropdown();
      // Animates JMP acronym in header
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
      positionSeahorse()
    });
  });
});

$( window ).resize(function() {
  positionSeahorse()
});


// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./service-worker.js')
           .then(function() { console.log('Service Worker Registered'); });
}
