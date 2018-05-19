const buildDate = '3:08am, 20 May 2018';

const tooSmallForJMP = 850;
const atTopOfPage = 100;
var logoLeftMargin = 0;

var position = $(window).scrollTop();

function isMobile() {
  if($(window).width() < tooSmallForJMP) {
    return true;
  } else {
    return false;
  }
}

function isAtTop() {
  if($(document).scrollTop() > atTopOfPage) {
    return false;
  } else {
    return true;
  }
}

function collapseNav() {
  $('.tabs').addClass('collapsed-tabs');
  $('#nav-bar').addClass('collapsed-nav');
}

function expandNav() {
  $('.tabs').removeClass('collapsed-tabs');
  $('#nav-bar').removeClass('collapsed-nav');
}


function positionSeahorse() {
  var headerHeight = $('.nav-wrapper').height();
  var logoHeight = headerHeight*0.8;
  var logoBottomMargin = headerHeight*0.1;
  $('.seahorse').height(logoHeight);
  $('.seahorse').width(logoHeight);
  $('.seahorse').css('margin-bottom',logoBottomMargin+'px');

  // Makes seahorse prominent on small screens
  if($(window).width() < 300) {
    $('.initial').hide();
    $('#logo-span').attr("style","margin-left: " + logoLeftMargin + "px;");
  } else {
    $('.initial').show();
  }
}

function centreSeahorse() {
  if(!isAtTop()) {
    $('#logo-span').attr("style","margin-left: " + logoLeftMargin + "px;");
  } else if($(window).width() >= 300) {
    $('#logo-span').attr("style","margin-left: 0px;");
  }
}

function showAcronym() {
  if(!isMobile()) {
    $('.nameFull').removeClass('hiddenAcronym');
    $('#logo-span').attr("style","margin-left: 0px;");
  } else {
    $('.initial').removeClass('hiddenInitial');
    centreSeahorse();
  }
}

function hideAcronym() {
  if(!isMobile()) {
    $('#logo-span').attr("style","margin-left: 0px;");
    if(!isAtTop()) {
      $('.nameFull').addClass('hiddenAcronym');
    }
  } else {
    $('.initial').addClass('hiddenInitial');
    centreSeahorse();
  }
}

function aboutToast() {
  M.toast({html: 'Version: ' + buildDate, classes: isMobile() ? '' : 'rounded'});
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
      logoLeftMargin = $('.acronym').width() - $('#logo-span').width();
      // Removes the wrapping template div
      $(this).children(':first').unwrap();

      // Initialises materialize css elements
      $('.sidenav').sidenav();
      $('.dropdown-trigger').dropdown();
      $('.modal').modal();
      $('select').formSelect();
      $('.tabs').tabs();

      showAcronym();

      // Animates JMP acronym in header
      $('.acronym').hover(
        function () {
          showAcronym();
        },
        function () {
          hideAcronym();
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
      positionSeahorse();
    });
  });
});

$(document).on("scroll", function() {
  if(isAtTop()) {
    showAcronym();
    $('.tabs').addClass('collapsed-tabs');
  } else {
    hideAcronym();
    $('.tabs').removeClass('collapsed-tabs');
  }

  var scroll = $(window).scrollTop();
  if(scroll > position) {
    // Scrolling downwards
    collapseNav();
  } else {
    // Scrolling upwards
    expandNav();
  }
  position = scroll;
});

$( window ).resize(function() {
  // logoLeftMargin = $('.acronym').width() - $('#logo-span').width();
  positionSeahorse()
  if(isMobile()) {
    $('.nameFull').addClass('hiddenAcronym');
  } else if(isAtTop()) {
    $('.nameFull').removeClass('hiddenAcronym');
  }
});


// PWA Service Worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
           .register('./service-worker.js')
           .then(function() { console.log('Service Worker Registered'); });
}
