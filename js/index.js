function set_search_height() {
    var baseHeight = 0;
    $("#tab2").children().each(function(){
        baseHeight += $(this).outerHeight(true);
    });
    var searchHeight = $(".easy-autocomplete-container").height();
    var totalHeight = baseHeight;
    $('.tabs-content').height(totalHeight);
}

function set_results_height() {
    var totalHeight = 0;
    $("#search-results").children().each(function(){
        totalHeight += $(this).outerHeight();
    });
    $("#search-results").height(totalHeight);
}

$(document).ready(function(){
    $('.fixed-action-btn').floatingActionButton();
    $('.materialboxed').materialbox();
    // $('#calendar').attr("width", $(window).width());

    // $.getJSON("cal_links.json", function(json) {
    //     // When loading finished
    //     // $('#search-input').attr("placeholder", "Search");
    //     // $('#search-input').prop('disabled', false);
    //     location_lookup = json;
    // });

    var options = {
        url: "cal_links.json",
        getValue: "n",
        list: {
            match: {
                enabled: true,
            },
            // showAnimation: {
            //     type: "slide", //normal|slide|fade
            //     time: 200,
            //     callback: function() {}
            // },
            // hideAnimation: {
            //     type: "slide", //normal|slide|fade
            //     time: 200,
            //     callback: function() {}
            // },
      
            // Decide between: onSelectItemEvent, onChooseEvent
            onChooseEvent: function() {
                // Gets new results
                var link = $("#search-input").getSelectedItemData().l;
                // Empties old results
                $("#search-results").empty();
                // Displays new results
                var new_result = "<div class='search-results-item' data-endpoint='/"+link+"'> ";
                new_result += "<a href='https://calendar.google.com/calendar?cid="+link+"' target='_blank' class='waves-effect waves-light btn'>"+$("#search-input").val()+"</a>";
                // <a class="waves-effect waves-light btn"><i class="material-icons left">cloud</i>button</a>
                new_result += "</div>";
                $("#search-results").height(0);
                $("#search-results").append(new_result);
                $('.search-results-item').click(function(e) {
                    // $(this).attr('data-endpoint')
                });
                set_results_height();
            },
            onSelectItemEvent: function() {
                // if($("#search-input").val() == "") {
                //     $("#search-results").empty();
                // }
            },
            onShowListEvent: function() {
                set_search_height();
            },
            onLoadEvent: function() {
                set_search_height();
            },
            onHideListEvent: function() {
                if($("#search-input").val() == '') {
                    $("#search-results").empty();
                }
                set_results_height();
                set_search_height();
            },
        },
        theme: "square",
    };
      
    $("#search-input").easyAutocomplete(options);
    $('#search-collapse').on( "click", function() {
        $("#search-results").height(0);
    });

});

$(window).resize(function() {
    $('#calendar').attr("width", $(window).width());
});