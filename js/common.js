const buildDate = '10:26pm, 3 Dec 2020';

const tooSmallForJMP = 850;
const atTopOfPage = 100;
var logoLeftMargin = 0;
var AnimationComplete = true;
var instance_tabs = null;

// Google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-179009333-1', 'auto');
ga('send', 'pageview');

function scrollTop() {
    return Math.max(window.pageYOffset, document.documentElement.scrollTop, document.body.scrollTop);
}

var position = scrollTop();

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
    if(!$('.tabs').hasClass('collapsed-tabs')) $('.tabs').addClass('collapsed-tabs');
    if(!$('#nav-bar').hasClass('collapsed-nav')) {
        $('#nav-bar').addClass('collapsed-nav');
        AnimationComplete = false;
    }
    if(!$('.tabs-content').hasClass('collapsed-tabs-content')) $('.tabs-content').addClass('collapsed-tabs-content');
    // $('.tabs').addClass('collapsed-tabs');
    // $('#nav-bar').addClass('collapsed-nav');
    // $('.tabs-content').addClass('collapsed-tabs-content');
}

function expandNav() {
    if($('.tabs').hasClass('collapsed-tabs')) $('.tabs').removeClass('collapsed-tabs');
    if($('#nav-bar').hasClass('collapsed-nav')) {
        $('#nav-bar').removeClass('collapsed-nav');
        AnimationComplete = false;
    }
    if($('.tabs-content').hasClass('collapsed-tabs-content')) $('.tabs-content').removeClass('collapsed-tabs-content');
    // $('.tabs').removeClass('collapsed-tabs');
    // $('#nav-bar').removeClass('collapsed-nav');
    // $('.tabs-content').removeClass('collapsed-tabs-content');
}

function calcLogoLeftMargin() {
    $('#logo-span').attr("style", "margin-left: 0px;");
    return $('.acronym').width() - $('#logo-span').width();
}


function positionSeahorse() {
    logoLeftMargin = calcLogoLeftMargin();
    var headerHeight = $('.nav-wrapper').height();
    var logoHeight = headerHeight*0.8;
    var logoBottomMargin = headerHeight*0.1;
    $('.seahorse').height(logoHeight);
    $('.seahorse').width(logoHeight);
    $('.seahorse').css('margin-bottom',logoBottomMargin+'px');

    // Makes seahorse prominent on small screens
    if($(window).width() < 300) {
        $('.initial').hide();
        $('#logo-span').attr("style", "margin-left: " + logoLeftMargin + "px;");
    } else {
        $('.initial').show();
    }
}

function centreSeahorse() {
    if(!isAtTop()) {
        $('#logo-span').attr("style", "margin-left: " + logoLeftMargin + "px;");
    } else if($(window).width() >= 300) {
        $('#logo-span').attr("style", "margin-left: 0px;");
    }
}

function setTabHeight() {
    var activeHeight = 0;
    $('.carousel-item.active').children().each(function() {
        activeHeight = activeHeight + $(this).outerHeight(true);
    });
    $('.tabs-content').attr("style", "height: " + activeHeight + "px;");
    $('.tabs-content').css({"margin-top":(18+$('ul.tabs').height())+"px"});

    $('.carousel-item.active').each(function() {
        var tabChangedEvent = new CustomEvent("tab-changed", { "detail": $(this).data("tab") });
        document.dispatchEvent(tabChangedEvent);
    });
}

function showAcronym() {
    if(!isMobile()) {
        $('.nameFull').removeClass('hiddenAcronym');
        $('#logo-span').attr("style", "margin-left: 0px;");
    } else {
        $('.initial').removeClass('hiddenInitial');
        centreSeahorse();
    }
}

function hideAcronym() {
    if(!isMobile()) {
        $('#logo-span').attr("style", "margin-left: 0px;");
        if(!isAtTop()) {
            $('.nameFull').addClass('hiddenAcronym');
        }
    } else {
        $('.initial').addClass('hiddenInitial');
        centreSeahorse();
    }
}

function generateTabs(tab, index, id) {
    var classes = 'waves-effect waves-light';
    var anchor = window.location.hash.slice(1).replace(/%20/g, " ")
    // var initial_index = 0;
    // if(index == initial_index) {
    //   classes += ' active';
    // }
    $('ul.tabs').append("<li class='tab'><a class='"+classes+"' href='#"+id+"'>" + tab.dataset.tab + "</a></li>");
}

function initTabs(tabs_list) {
    var tabsElem = $('.tabs')
    // var tabsElem = $(document.getElementsByClassName("tabs"));
    var tabsOptions = {swipeable : true, onShow: setTabHeight}
    var init_tabs = M.Tabs.init(tabsElem, tabsOptions);
    instance_tabs = M.Tabs.getInstance(tabsElem);

    var anchor = window.location.hash.slice(1).replace(/%20/g, " ");
    if(anchor == '' || anchor == '/') {
            anchor = $(".active").attr('href').replace('#','');
            // window.location.hash = anchor;
    }
    for(var i = 0; i < tabs_list.length; i++) {
        if(anchor == tabs_list[i].replace(' ','')) {
            instance_tabs.select("tab" + (i+1).toString());
        }
    }
}

function aboutToast() {
    M.toast({html: 'Version: ' + buildDate, classes: isMobile() ? '' : 'rounded'});
}

function syntaxHighlight(json) {
        if (typeof json != 'string') {
                 json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                var cls = 'number';
                if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                                cls = 'key';
                        } else {
                                cls = 'string';
                        }
                } else if (/true|false/.test(match)) {
                        cls = 'boolean';
                } else if (/null/.test(match)) {
                        cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
        });
}
function loadChangelog() {
    var container = document.getElementById("changelog-container");
    container.innerHTML = "Loading...";
    var commitsToLoad = 1000;
    var encoded_path = "https://api.github.com/repos/UON-Med/UON-Med.github.io/commits?per_page=" + String(commitsToLoad);
    // var xhr = new XMLHttpRequest();
    // xhr.open("GET", encoded_path,false);
    // xhr.send();

    $.ajax({
        url: encoded_path, 
        xhr: function() {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function(evt){
                if(evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    //Do something with download progress
                    // console.log(percentComplete);
                    container.innerHTML = "Loading... ("+String(Number.parseFloat(percentComplete*100).toPrecision(4))+"%)";
                }
            }, false);
            return xhr;
        },
        success: function(result) {
            container.innerHTML = '';
            changelog = result;
            // container.innerHTML = syntaxHighlight(changelog);
            // container.innerHTML += '';
            changelog.forEach(function(entry, index, array) {
                var commit = entry['commit'];
                var commitDate = new Date(commit['committer']['date']);
                container.innerHTML += '<a href="'+entry['html_url']+'" target="_blank" class="collection-item avatar"><img src="'+entry['committer']['avatar_url']+'" alt="" class="circle"><span class="title">'+commit['committer']['name']+'</span><p>'+commit['message']+'</p><div class="secondary-content">'+commitDate.toLocaleString('en-au')+'</div></a>';

                if(array.length-1 == index) {
                    // Gets around async problems of above happening after capping </ul> can be added 
                    container.innerHTML = '<ul class="collection">' + container.innerHTML + '</ul>';
                }
            });
        }
    });

    // if(xhr.status == 200) {
    //   container.innerHTML = '';
    //   changelog = JSON.parse(xhr.responseText);
    //   // container.innerHTML = syntaxHighlight(changelog);
    //   // container.innerHTML += '';
    //   changelog.forEach(function(entry, index, array) {
    //     var commit = entry['commit'];
    //     var commitDate = new Date(commit['committer']['date']);
    //     container.innerHTML += '<a href="'+entry['html_url']+'" target="_blank" class="collection-item avatar"><img src="'+entry['committer']['avatar_url']+'" alt="" class="circle"><span class="title">'+commit['committer']['name']+'</span><p>'+commit['message']+'</p><div class="secondary-content">'+commitDate.toLocaleString('en-au')+'</div></a>';

    //     if(array.length-1 == index) {
    //       // Gets around async problems of above happening after capping </ul> can be added 
    //       container.innerHTML = '<ul class="collection">' + container.innerHTML + '</ul>';
    //     }
    //   });
    // } else {
    //   container.innerHTML = "Error, could not retrieve changelog.";
    // }
}

$(document).ready(function() {

    var includes = $('[data-include]');
    jQuery.each(includes, function(){
        var file = 'views/' + $(this).data('include') + '.html';
        // ---------------------------------------------------------------
        // Everything below here is doen in callback for imported content
        // ie content imported must have its js bindings done here
        // ---------------------------------------------------------------
        $(this).load(file, function() {
            if(this.dataset.include == "header") {

                // JS FOR HEADER

                logoLeftMargin = calcLogoLeftMargin();
                // Removes the wrapping template div
                $(this).children(':first').unwrap();

                // Initialises materialize css elements
                $('.sidenav').sidenav();
                $('.dropdown-trigger').dropdown();
                $('.modal').modal();
                $('select').formSelect();
                $('.tooltipped').tooltip({html: true});

                // Generates tabs
                var anchor = window.location.hash.slice(1).replace(/%20/g, " ");
                var tabs = $('[data-tab]');
                var tabs_list = []
                jQuery.each(tabs, function(index, value) {
                    generateTabs(this, index, $(value)[0].id);
                    tabs_list.push(this.dataset.tab);
                }).promise().done(function() {
                    // Guarantees tabs are generated before initialised
                    initTabs(tabs_list);
                    // // Sets the initial tab
                    // jQuery.each($('li.tab'), function(index, value) {
                    //   $(this.children[0]).removeClass("active");
                    //   if(tabs_list[index].replace(' ', '') == anchor) {
                    //     $(this.children[0]).addClass("active");
                    //   }
                    // });
                });
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
                setTabHeight();

                // Sets up flag to check if animation still happening
                $("#nav-bar").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
                    AnimationComplete= true;
                        // console.log(AnimationComplete);
                        return false; /*Cancel any bubbling*/
                    });

                // Sets up secret page navigator
                function nav_to_secret() {
                    var origin = window.location.hostname;
                    var protocol = window.location.protocol;
                    if(origin == "localhost") {
                        origin = window.location.host;   
                    } else {
                        protocol = "https:"
                    }
                    var secret_url = protocol + '//' + origin + '/' + $("#custom-nav-input").val().toLowerCase();
                    var original_secret_url = secret_url;
                    if(!secret_url.endsWith("/")) {
                        secret_url += '/';
                    }
                    $.ajax({
                        type: "GET",
                        url: secret_url,
                        datatype: "xml",
                        error: function(jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status == 404) {
                                console.log(original_secret_url)
                                if(!original_secret_url.endsWith(".html")) {
                                    original_secret_url += '.html';
                                    secret_url = original_secret_url;
                                }
                                $.ajax({
                                    type: "GET",
                                    url: secret_url,
                                    datatype: "xml",
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        if (jqXHR.status == 404) {
                                            M.toast({html: "Secret page not found!", classes: isMobile() ? '' : 'rounded'});
                                        }
                                    },
                                    success: function() {
                                        window.location.href = secret_url;
                                    }
                                });
                            }
                        },
                        success: function() {
                            window.location.href = secret_url;
                        }
                    });
                }
                $("#custom-nav-btn").on('click', function() {
                    nav_to_secret();
                });
                $("#custom-nav-input").keyup(function(event) {
                    if(event.keyCode === 13) {
                        nav_to_secret();
                    }
                });

            } else if(this.dataset.include == "footer") {
            // For footer
            }
        });
    });
});




$(document).on("scroll", function(event) {
    // ------------------
    // Handles animations
    // ------------------
    if(isAtTop()) {
        showAcronym();
        $('.tabs').addClass('collapsed-tabs');
    } else {
        hideAcronym();
        $('.tabs').removeClass('collapsed-tabs');
    }

    var scroll = scrollTop();
    if(AnimationComplete || isAtTop()) {
        if(scroll > position) {
            // Scrolling downwards
            collapseNav();
            // console.log(scroll + ',' + position);
        } else if(scroll < position){
            // Scrolling upwards
            expandNav();
            // console.log(scroll + ',' + position);
        }
    }
    position = scroll;
});

$(window).resize(function() {
    positionSeahorse();
    setTabHeight();
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
