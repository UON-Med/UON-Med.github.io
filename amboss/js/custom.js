// -----------
// Global vars
// -----------
var expand_by_default = false;
var location_lookup = null;

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

function get_trail(path) {
    path = path.split('/');
    path.clean("");
    path.clean("content");
    path.forEach(function(el, idx, arr) {
        path[idx] = el.replace(/\s/g, "");
    });
    return path;
}

function expand_menu(path) {
    path = get_trail(path);
    $(".menu-nav-leaf").each(function(i) {
        $(this).children().removeClass("menu-nav-leaf-active");
    })
    path.forEach(function(el, idx, arr) {
        if(idx === arr.length - 1) {
            $("a[id='"+el+"']").toggleClass("menu-nav-leaf-active");
        } else {
            $('#' + el).slideDown();
        }
    });
}

function get_content() {
    var content = {};
    $('div.Frame.Content.collapse').each(function(i) {
        var section_id = $(this).attr('collapse').replace("!NGLearningCardCollapse.isOpen('","").replace("')","");
        content[section_id] = this;
    });

    return content;
}

function expand_section(content, section_id) {
    $('#' + section_id).addClass('opened');
    $(content[section_id]).addClass('in');
    $(content[section_id]).removeAttr('style');
}

function collapse_section(content, section_id) {
    $('#' + section_id).removeClass('opened');
    $(content[section_id]).removeClass('in');
    $(content[section_id]).css('height','0');
}

function toggle_sections(content, user_initiated=true) {
    // user has pressed space
    $('header.Frame.sticky-element').each(function(i) {
        var section_id = $(this).attr('ng-click').replace("NGLearningCardCollapse.toggle('","").replace("')","");
        if(user_initiated) {
            var to_collapse = expand_by_default;
        } else {
            var to_collapse = false;
        }

        if(to_collapse) {
            // Is open right now, need to toggle it closed
            collapse_section(content, section_id);
        } else {
            // Is closed right now, need to toggle open
            expand_section(content, section_id);
        }
    });

    if(user_initiated) {
        expand_by_default = !expand_by_default;
    }
}

function loadSection(path) {
    // Underlines and focuses nav on new section
    expand_menu(path);

    var encoded_path = encodeURIComponent(path);

    $("#includedContent").load(encoded_path, function() {
        $("#includedContent").css("display", "none");

        // Initially loads 
        var passphrase = MyLib.passphrase;
        var encryptedMsg = $("#includedContent").html();
        var encryptedHMAC = encryptedMsg.substring(0, 64)
        var encryptedHTML = encryptedMsg.substring(64);
        var decryptedHMAC = CryptoJS.HmacSHA256(encryptedHTML, CryptoJS.SHA256(passphrase).toString()).toString();
        if(decryptedHMAC !== encryptedHMAC) {
            alert('Bad passphrase! Reload page to decrypt.');
            return;
        }

        var plainHTML = CryptoJS.AES.decrypt(encryptedHTML, passphrase).toString(CryptoJS.enc.Utf8);
        document.getElementById("includedContent").innerHTML = plainHTML;

        $("#includedContent").fadeIn();

        // ---------------------------------------------
        // All content should be loaded/decrypted by now
        // ---------------------------------------------


        // Sets up content dict
        var content = get_content();

        $('header.Frame.sticky-element').click(function(){
            // Finds section selected
            var section_id = $(this).attr('ng-click').replace("NGLearningCardCollapse.toggle('","").replace("')","");
            // Finds corresponding content

            if($('#' + section_id).hasClass('opened')) {
                // Is open right now, need to toggle it closed
                collapse_section(content, section_id);
            } else {
                // Is closed right now, need to toggle open
                expand_section(content, section_id);
            }
        });

        // Does tooltips
        // NOTE: Rest of tooltip/data processing is done in materialize-custom.js
        // Eg data to extract
        // miamed-smartip="{"master_phrase":"Auscultation of the heart","translation":"","synonym":[],"description":"The use of a stethoscope to examine the heart. Typically performed with the patient supine with slight elevation of the torso. Used to assess the location, timing, and quality of heart sounds and murmurs. Techniques to best hear specific sounds include auscultating at specific anatomical locations, using the stethoscope bell for low frequency sounds and the diaphragm for high frequency sounds, positioning the patient (e.g., leaning forward, lying in the left lateral position), and having the patient perform specific maneuvers (e.g., Valsalva, inspiration).","destinations":[{"label":"Cardiovascular examination \u2192 Chest auscultation","learning_card_xid":"rM0fJg","anchor_hash":"Za9278ae1af4d8ca05de426482744c148"}]}"
        $('[miamed-smartip]').tooltip({html: true}).each(function () {
            // $("#" + $(this).data('tooltip-id')).find(".backdrop").addClass('card');
        });
        // Removes dead links
        // TODO: Parse dead links into live local links for your dir structure
        $('a').each(function() {
            if(String($(this).attr('href')).startsWith("/us/library#xid=")) {
                // $(this).attr('href', '');
                $(this).removeAttr('href');
            }
        });

        if(expand_by_default) {
            toggle_sections(content, user_initiated=false);
        }

        // Adds expand/contract shortcut
        window.onkeydown = function(e) {
            if (e.keyCode == 32 && e.target == document.body) {
                e.preventDefault();
                toggle_sections(content);
            }
        };
        // Sets up expand button
        $('#expand-toggle').on( "click", function() {
            toggle_sections(content);
        });
    });
}


$(document).ready(function(){
    anchor = window.location.hash.slice(1).replace(/%20/g, " ");
    $.getJSON("location_lookup.json", function(json) {
        // When loading finished
        $('#search-input').attr("placeholder", "Search");
        $('#search-input').prop('disabled', false);
        location_lookup = json;
    });

    // Loads nav
    $("#menu-nav").load(encodeURIComponent("/nav.html"), function() {
        // Callback, all stuff involving nav MUST be done here to guarantee
        // execution occurs AFTER load is done

        $('.menu-nav-toggle').click(function(e) {
            e.stopPropagation();
            $(this).parent().children().slice(1).slideToggle();
        });
        $('.menu-nav-leaf').click(function(e) {
            loadSection($(this).attr('data-endpoint'))
        });
        expand_menu(anchor);
    });

    // Loads content
    if(anchor != '' && anchor != '/') {
    } else {
        anchor = "/content/Clinical Knowledge/0 Internal Medicine/0 Cardiology and Angiology/0 Diagnostics/0 Cardiovascular examination.html";
    }
    loadSection(anchor);

    var options = {
        url: "search_data.json",
        getValue: "w",
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
                var results = $("#search-input").getSelectedItemData().r;
                // Sorts results by frequency
                results.sort(function(a, b) {
                    return b[0] - a[0];
                });
                // Empties old results
                $("#search-results").empty();
                // Displays new results
                for(var i = 0; i < results.length; i++) {
                    var location_path = "Loading...";
                    var location = null;
                    if(location_lookup != null) {
                        location_path = location_lookup[results[i][1]];
                        // location = location_path.split('/');
                        // location = location[location.length-1];
                        // location = location.substr(location.indexOf(" ") + 1).split('.')[0];
                        location = location_path.split('.');
                        // Gets rid of leading '.' and trailing '.html'
                        location = location.slice(1, location.length-1);
                        location = location.join('/');
                        // Gets rid of leading '/content-source/Clinical Knowledge/'
                        location = location.split('/');
                        location = location.slice(3, location.length).map(function(e) { 
                            e = e.split(' ');
                            e = e.slice(1, e.length).join(' '); 
                            return e;
                        });
                        location = location.join(' / ');
                        // Adds a break before the last element of the paths
                        location = ["<div class='search-results-path'>", location.slice(0, location.lastIndexOf(" / ")+2), "</div><div class='search-results-page'>", location.slice(location.lastIndexOf(" / ")+2)].join('')
                        

                        // Gets rid of leading './' in location_path
                        location_path = location_path.slice(2, location_path.length);
                        // Swaps "content-source" out for "content"
                        location_path = location_path.replace("content-source", "content");
                    }
                    var new_result = "<div class='search-results-item' data-endpoint='/"+location_path+"''> ";
                    new_result += "<a href='#"+location_path+"'>"+location+" <span class='badge'>"+results[i][0]+"</div></span></a>";
                    new_result += "</div>";
                    $("#search-results").append(new_result);
                };
                $('.search-results-item').click(function(e) {
                    loadSection($(this).attr('data-endpoint'))
                });
                var totalHeight = 0;
                $("#search-results").children().each(function(){
                    totalHeight += $(this).outerHeight();
                });
                $("#search-results").height(totalHeight);
            },
            onSelectItemEvent: function() {
                // if($("#search-input").val() == "") {
                //     $("#search-results").empty();
                // }
            },
        },
        theme: "square",
    };

    $("#search-input").easyAutocomplete(options);
    $('#search-collapse').on( "click", function() {
        $("#search-results").height(0);
    });
    // Sets up hide sidebar event listener
    $('#menu-toggle').on( "click", function() {
        console.log($('#sidebar').width());
        if($('#sidebar').width() == 350) {
            $('#sidebar').width(0);
            $('#menu-toggle').css('margin-left', -30);
            $('#expand-toggle').css('margin-left', -30);
            $('#includedContent').css('margin-left', 10);
        } else {
            $('#sidebar').width(350);
            $('#menu-toggle').css('margin-left', 310);
            $('#expand-toggle').css('margin-left', 310);
            $('#includedContent').css('margin-left', 350);
        }
    });
    // Hides sidebar on load if window is too small
    if($(window).width() < 450) {
        $('#menu-toggle').click();
    }
});