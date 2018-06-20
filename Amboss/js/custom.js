function loadSection(path) {
    $("#includedContent").load(encodeURIComponent(path), function() {
        // Sets up content dict
        var content = {};
        $('div.Frame.Content.collapse').each(function(i) {
            var section_id = $(this).attr('collapse').replace("!NGLearningCardCollapse.isOpen('","").replace("')","");
            content[section_id] = this;
        });

        $('header.Frame.sticky-element').click(function(){
            // Finds section selected
            var section_id = $(this).attr('ng-click').replace("NGLearningCardCollapse.toggle('","").replace("')","");
            // Finds corresponding content

            if($('#' + section_id).hasClass('opened')) {
                // Is open right now, need to toggle it closed
                $('#' + section_id).removeClass('opened');
                $(content[section_id]).removeClass('in');
                $(content[section_id]).css('height','0');
            } else {
                // Is closed right now, need to toggle open
                $('#' + section_id).addClass('opened');
                $(content[section_id]).addClass('in');
                $(content[section_id]).removeAttr('style');
            }
        });

        // Does tooltips
        // Eg data to extract
        // miamed-smartip="{"master_phrase":"Auscultation of the heart","translation":"","synonym":[],"description":"The use of a stethoscope to examine the heart. Typically performed with the patient supine with slight elevation of the torso. Used to assess the location, timing, and quality of heart sounds and murmurs. Techniques to best hear specific sounds include auscultating at specific anatomical locations, using the stethoscope bell for low frequency sounds and the diaphragm for high frequency sounds, positioning the patient (e.g., leaning forward, lying in the left lateral position), and having the patient perform specific maneuvers (e.g., Valsalva, inspiration).","destinations":[{"label":"Cardiovascular examination \u2192 Chest auscultation","learning_card_xid":"rM0fJg","anchor_hash":"Za9278ae1af4d8ca05de426482744c148"}]}"
        $('[miamed-smartip]').tooltip({html: true}).each(function () {
            $("#" + $(this).data('tooltip-id')).find(".backdrop").addClass('card');
        });
    });
}

$(document).ready(function(){
    anchor = window.location.hash.slice(1).replace(/%20/g, " ");
    console.log(anchor)

    $("#menu-nav").load(encodeURIComponent("/nav.html"), function() {
        $('.menu-nav-toggle').click(function(e) {
            e.stopPropagation();
            $(this).parent().children().slice(1).slideToggle();
        });
        $('.menu-nav-leaf').click(function(e) {
            loadSection($(this).attr('data-endpoint'))
        });
    });

    if(anchor != '' && anchor != '/') {
        loadSection(anchor)
    } else {
        loadSection("/content/Clinical Knowledge/0 Internal Medicine/0 Cardiology and Angiology/0 Diagnostics/0 Cardiovascular examination.html")
    }
});