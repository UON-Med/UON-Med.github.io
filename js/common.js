$(function(){
  var includes = $('[data-include]');
  jQuery.each(includes, function(){
    var file = 'views/' + $(this).data('include') + '.html';
    $(this).load(file);
  });
});

$('.acronym').hover(
    function () { $('.nameFull').removeClass('hiddenAcronym'); },
    function () { $('.nameFull').addClass('hiddenAcronym'); }
);