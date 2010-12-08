$(function() {
    var default_delimiter = /[\s,]+/;
$('input.tag-control').hide();

$('input.tag-control').each(function(index) {
    $(this).parent().append('<span class="tag-control-container" for="' + $(this).attr('id')  + '"></span>');
    $control = $('.tag-control-container[for=' + $(this).attr('id') + ']'); // todo fixme
    $(this).appendTo($control);
    $control.prepend('<span class="tag-value"></span>');
    $control.append('<input type="text" class="tag-control-helper">');
    if ($(this).attr('disabled')) {
	$control.children('.tag-control-helper').hide();
    }
});        

$('input.tag-control-helper').change(function() {
    $(this).css('width', $(this).css('min-width'));
    $control = $(this).parent().children('.tag-value');
    $main = $(this).siblings('input.tag-control');
    delimiter = $main.attr('data-tag-delimiter') == undefined ? default_delimiter : new RegExp($main.attr('data-tag-delimiter'));
    $.each($(this).val().split(delimiter), function(index, value) {
        if ($.trim(value) != '') {
            $control.append('<span>' + value + '<div class="delete">&times;</div></span><wbt>');
        }
    });

    $(this).fillToParent();

    $(this).val('');
    $main.updateValue();
});

$('html').live('click', function(event) {
    $('.tag-control-container').removeClass('focus');
    $('.tag-control-container .tag-value span').removeClass('focus');
    
    if ($(event.target).is('.tag-control-container .tag-value span')) {
        $(event.target).addClass('focus');
    }

    if ($(event.target).is('.tag-control-container')) {
	$(event.target).children('.tag-control-helper').focus();
        $(event.target).addClass('focus');
    } else {
	$(event.target).parents('.tag-control-container').addClass('focus');
    }
});

var keyDown = false;
$('*').keydown(function(e) {

    // ignore if only shift was pressed
    if (e.keyCode == 16) {
	return;
    }

    if (keyDown != false) {
        return;
    }
    keyDown = e.keyCode;
console.log(e.keyCode);
    if (e.keyCode == 8 || e.keyCode == 46) { // backspace or delete
        // if input is focused and has value
        if ($('input.tag-control-helper:focus').size() != 0 && $('input.tag-control-helper:focus').val() != '') {
            return;
        }
        
        $control = $('.tag-control-container .tag-value span.focus');
        $node = $control.parent();
        
        if ($control.size() != 0) {
            // if element on right exists
            if ($control.next().size() != 0) {
                $control.next().addClass('focus');
                // else if element on left exists
            } else if ($control.prev().size() != 0) {
                $control.prev().addClass('focus');
            } else {
                $control.parent().siblings('input.tag-control-helper').focus();
            }
            $control.remove();
        }
        
        // if in empty focused input, remove last tag on backspace
        if (e.keyCode == 8 && $('input.tag-control-helper:focus').size() != 0) {
            $('input.tag-control-helper:focus').siblings('.tag-value').children('span:last').remove();
            $node = $('input.tag-control-helper:focus').siblings('.tag-value');
        }
        
        // normalize count of &nbsp;
        
        normalized = $node.html().replace(/(&nbsp;\s+){2,}/g, '&nbsp; ').replace(/^&nbsp;\s+/, '');
        $node.html(normalized);
        $node.siblings('input.tag-control').updateValue();

	$node.siblings('input.tag-control-helper').fillToParent();
	return false;
        
    // pressed arrow key
    } else if (e.keyCode >= 37 && e.keyCode <= 40) {
	left = e.keyCode == 37 || e.keyCode == 38;
        $span = $('.tag-control-container .tag-value span.focus');
        if ($span.size() != 0) { // if any tag is focused
            if (left) {
                if ($span.prev().prev().size() == 0) { // if not most left
                    return;
                } else {
                    $span.prev().prev().addClass('focus');
                }
            } else {
                if ($span.next().next().size() == 0) { // if most right
                    $span.parent().siblings('input.tag-control-helper').focus();
                } else {
                    $span.next().next().addClass('focus');
                }
            }
            $span.removeClass('focus');
        } else if (left) {
	    if ($.trim($('input.tag-control-helper:focus').val()) == '') {
		$('input.tag-control-helper:focus').siblings('.tag-value').children('span').filter(left ? ':last' : ':first').addClass('focus');
		$('input.tag-control-helper:focus').blur();
	    } else {
		return true;
	    }
        }
	// add trigger on change /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/  /------- -/-/ 

        //return false;

    // pressed tab
    } else if (e.keyCode == 9) {
	$('.tag-control-container .tag-value span').removeClass('focus');
	$('.tag-control-container.focus').children('input.tag-control-helper').focus();
	$('.tag-control-container.focus').removeClass('focus');

    // pressed enter
    } else if (e.keyCode == 13) {
	if ($.trim($('.tag-control-helper:focus').val()) != '') {
	    $('.tag-control-helper:focus').change();
	    return false;
        }
    }

}).keyup(function(e) {
    keyDown = false;
});

$('.tag-control-container .tag-value span .delete').live('click', function() {
	$(this).parent().remove();
});


$('.tag-control-helper').live('focus', function() {
    $(this).parent().addClass('focus');
})


// set defaults
$('input.tag-control-helper').each(function() {
	$(this).val($(this).siblings('input.tag-control').val()).trigger('change');
});

});

$.fn.updateValue = function() {
	var value = [];
	$(this).siblings('.tag-value').children('span').each(function() {
		value.push($(this).getTagValue());
	});
	$(this).val(value.join(', '));
	return $(this);
}

$.fn.getTagValue = function() {
	return $(this).text().substr(0, $(this).text().length - 1); // fixme
}

$.fn.fillToParent = function() {
	$(this).css('width', $(this).parent().width() - $(this).position()['left'] + 20);
	return $(this);
}
