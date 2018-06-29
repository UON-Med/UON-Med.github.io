// -----------
// Global vars
// -----------
var expand_by_default = false;

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

function loadSection(path) {
    // Underlines and focuses nav on new section
    expand_menu(path);

    var encoded_path = encodeURIComponent(path);

    $("#includedContent").load(encoded_path, function() {
        $("#includedContent").css("display", "none");

        // // Initially loads 
        // var passphrase = MyLib.passphrase;
        // var encryptedMsg = $("#includedContent").html();
        // var encryptedHMAC = encryptedMsg.substring(0, 64)
        // var encryptedHTML = encryptedMsg.substring(64);
        // var decryptedHMAC = CryptoJS.HmacSHA256(encryptedHTML, CryptoJS.SHA256(passphrase).toString()).toString();
        // if(decryptedHMAC !== encryptedHMAC) {
        //     alert('Bad passphrase! Reload page to decrypt.');
        //     return;
        // }

        // var plainHTML = CryptoJS.AES.decrypt(encryptedHTML, passphrase).toString(CryptoJS.enc.Utf8);
        // document.getElementById("includedContent").innerHTML = plainHTML;

        $("#includedContent").fadeIn();

        // ---------------------------------------------
        // All content should be loaded by now
        // ---------------------------------------------

    });
}

$(document).ready(function(){
    anchor = window.location.hash.slice(1).replace(/%20/g, " ");

    // Loads nav
    $("#menu-nav").load(encodeURIComponent("/nav.html"), function() {
        // Callback, all stuff involving nav MUST be done here to guarantee
        // execution occurs AFTER load is done

        $('.menu-nav-toggle').click(function(e) {
            e.stopPropagation();
            $(this).parent().children().slice(1).slideToggle();
        });
        $('.menu-nav-leaf').click(function(e) {
            window.location.href = window.location.href.split("#")[0] + '#' + $(this).attr('data-endpoint').slice(1)
            loadSection($(this).attr('data-endpoint'))
        });
        expand_menu(anchor);


        // Loads content
        if(anchor != '' && anchor != '/') {
        } else {
            anchor = "/content/0 Biochemistry/0 Cells.html";
        }
        loadSection(anchor);
        var slideout = new Slideout({
          'panel': document.getElementById('panel'),
          'menu': document.getElementById('menu'),
          'padding': 256,
          'tolerance': 70
        });
        // Toggle button
        document.querySelector('.toggle-button').addEventListener('click', function() {
            slideout.toggle();
        });
    });


});