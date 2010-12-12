$(function() {
	var default_delimiter = /[\s,]+/;

	$('input.tag-control').hide();

	$('input.tag-control').each(function(index) {
		$control = $('<span class="tag-control-container" for="' + $(this).attr('id')  + '"></span>');
		$(this).parent().append($control);
		$(this).appendTo($control);
		$control.prepend('<span class="tag-value"></span>');
		$control.append('<input type="text" class="tag-control-helper">');
		
		if ($(this).attr('data-tag-suggest')) {
			$control.append('<div class="tag-suggest"><ul></ul></div>');
		}
		
		rules = eval('[' + ($(this).attr('data-nette-rules') || '') + ']');
		var isUnique = false;
		var length = false;
		$.each(rules, function(index, rule) {
			if (rule.op === ':unique') {
				isUnique = true;
			}
			if ((rule.op === ':maxLength' || rule.op === ':length') && rule.arg > length) {
				length = rule.arg;
			}
		});
		$control.attr('data-tag-unique', isUnique);
		$control.attr('data-tag-length', length);

		$control.get(0).focus = function() {
			$control.children('.tag-control-helper').focus();
		}

		if ($(this).attr('disabled')) {
			$control.children('.tag-control-helper').hide();
		}
	});

	$('input.tag-control-helper').change(function() {
		// prevents blur if clicked on autocomplete
		if ($('.tag-suggest:hover').length != 0) {
			if ($('.tag-suggest:hover').css('display') != 'none') {
				return false;
			}
		}

		$(this).css('width', $(this).css('min-width'));
		$control = $(this).parent().children('.tag-value');
		$main = $(this).siblings('input.tag-control');
		delimiter = $main.attr('data-tag-delimiter') == undefined ? default_delimiter : new RegExp($main.attr('data-tag-delimiter'));
		$.each($(this).val().split(delimiter), function(index, value) {
			if (!($control.parent().attr('data-tag-unique') != 'false' && $.inArray(value, $control.parent().getValues()) != -1) && $.trim(value) != '') {
				if (!($control.parent().attr('data-tag-length') == 'false' && $control.parent().getValues().length >= parseInt($control.parent().attr('data-tag-length')))) {
					$control.append('<span>' + value + '<div class="delete">&times;</div></span>&zwnj;<wbr>');
				}
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

		if (!$(event.target).is('.tag-suggest')) {
			$('.tag-suggest').hide();
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
    
		if (e.keyCode == 8 || e.keyCode == 46) { // backspace or delete
			// if input is focused and caret is most left
			if ($('input.tag-control-helper:focus').size() != 0 && $('input.tag-control-helper:focus').getCaret() != 0) {
				return;
			}
        
			$control = $('.tag-control-container .tag-value span.focus');
			$node = $control.parent();

			if ($('.tag-control-helper:focus').length != 0 && $('.tag-control-helper:focus').getCaret() != 0) {
				// if element on right exists
				if ($control.next().next().size() != 0) {
					$control.next().next().addClass('focus');
				// else if element on left exists
				} else if ($control.prev().prev().size() != 0) {
					$control.prev().prev().addClass('focus');
				} else {
					$control.parent().siblings('input.tag-control-helper').focus();
				}
			}
        
			// if in empty focused input, remove last tag on backspace
			if (e.keyCode == 8 && $('input.tag-control-helper:focus').size() != 0) {
				$control = $('input.tag-control-helper:focus').siblings('.tag-value').children('span:last');
				$node = $('input.tag-control-helper:focus').siblings('.tag-value');
			}

			// remove next <wbr>
			$control.next().remove();
			$control.remove();

			$node.siblings('input.tag-control').updateValue();
        
			$node.siblings('input.tag-control-helper').fillToParent();
			return false;
        
		// pressed arrow key
		} else if (e.keyCode >= 37 && e.keyCode <= 40) {
			left = e.keyCode == 37 || e.keyCode == 38;

			// if suggest is visible
			if ($('.tag-control-container.focus').siblings('.tag-suggest').css('display') != 'none') {
				// pressed down
				if (e.keyCode == 40) {
					if ($('.tag-suggest ul li.selected').length == 0) {
						$tag = $('.tag-control-container.focus').children('.tag-suggest').children('ul').children('li:first');
						$tag.addClass('selected');
					} else {
						$c = $('.tag-suggest ul li.selected');
						if ($c.next().length != 0) {
							$c.removeClass('selected');
							$c.next().addClass('selected');
						}
					}
					return false;

				// pressed up
				} else if (e.keyCode == 38) {
					if (!$('.tag-suggest ul li.selected').length == 0) {
						$c = $('.tag-suggest ul li.selected');
						$c.removeClass('selected');
						if ($c.prev().length != 0) {
							$c.prev().addClass('selected');
						} else {
							$c.parent().parent().siblings('.tag-control-helper').focus();
						}
					}
					return false;
				}
			}

			$span = $('.tag-control-container .tag-value span.focus');
			if ($span.size() != 0) { // if any tag is focused
				if (left) {
					if ($span.prev().prev().size() == 0) { // if not most left
						return false;
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
				return false;
			} else if (left) {
				if ($('input.tag-control-helper:focus').size != 0 && $('input.tag-control-helper:focus').getCaret() == 0) {
					$('input.tag-control-helper:focus').siblings('.tag-value').children('span').filter(left ? ':last' : ':first').addClass('focus');
					$('input.tag-control-helper:focus').blur();
				} else {
					return true;
				}
			}

		// pressed tab
		} else if (e.keyCode == 9) {
			$('.tag-control-container .tag-value span').removeClass('focus');
			$('.tag-control-container.focus').children('input.tag-control-helper').focus();
			$('.tag-control-container.focus').removeClass('focus');
			$('.tag-suggest').hide();

		// pressed enter
		} else if (e.keyCode == 13) {
			$suggest = $('.tag-control-container.focus .tag-suggest ul li.selected');
			if ($suggest.length != 0) {
				$suggest.parent().parent().siblings('.tag-control-helper').val($suggest.text()).change();
				$('.tag-suggest ul li.selected').removeClass('selected');
				return false;
			}

			$('.tag-suggest').hide();
			if ($.trim($('.tag-control-helper:focus').val()) != '') {
				$('.tag-control-helper:focus').change();
				return false;
			}
		}

	}).keyup(function(e) {
		keyDown = false;
    
		// tag ended
		regex = $('.tag-control-helper:focus').siblings('.tag-control').attr('data-tag-delimiter') == undefined ? default_delimiter : new RegExp($main.attr('data-tag-delimiter'));
		if ($('.tag-control-helper:focus').size() != 0 && $('.tag-control-helper:focus').val().match(regex) != null) {
			$('.tag-control-helper:focus').change();
		}
	});

	var lastValue = '';
	$('.tag-control-helper').keyup(function() {
		if ($(this).val() == lastValue) {
			return true;
		}
		lastValue = $(this).val();
		if ($(this).getCaret() >= 2) {
			$control = $(this);
			uri = $(this).siblings('.tag-control').attr('data-tag-suggest').replace('%25__filter%25', $control.val());
			json = $.getJSON(uri, null, function(json) {
				$control.siblings('.tag-suggest').hide();
				$container = $control.siblings('.tag-suggest').children('ul');
				$container.children('li').remove();
				// do not add to list if unique rule is forced and the value is already filled
				$.each(json, function(id, value) {
					if ($control.parent().attr('data-tag-unique') == 'false' || $.inArray(value, $container.parent().parent().getValues()) == -1) {
						$container.append('<li>' + value + '</li>');
					}
				});
				if ($container.children('li').length !== 0) {
					$control.siblings('.tag-suggest').show();
				}
				
				$control.siblings('.tag-suggest').children('ul').children('li').click(function() {
					$control.siblings('.tag-suggest').hide();
					$control.parent().children('.tag-control-helper').val($(this).text()).change();
				});
			});
		} else {
			$(this).siblings('.tag-suggest').hide();
		}
	});

	$('.tag-control-container .tag-value span .delete').live('click', function() {
		$control = $(this).parents('.tag-control-container').children('.tag-control');
		$(this).parent().remove();
		$control.updateValue();
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
	$(this).val($(this).parent().getValues().join(', '));

	if (parseInt($(this).parent().attr('data-tag-length')) <= $(this).parent().getValues().length) {
		$(this).siblings('.tag-control-helper').hide();
	} else {
		$(this).siblings('.tag-control-helper').show();
	}

	return $(this);
};

$.fn.getValues = function() {
	var values = new Array();
	var index = 0;
	$(this).children('.tag-value').children('span').each(function() {
		$span = $(this).clone();
		$span.children().remove();
		values[index++] = $span.text();
	});
	return values;
};

$.fn.fillToParent = function() {
	$(this).css('width', 0);
	width = $(this).parent().width() - $(this).position()['left'];
	width = width < 50 ? $(this).parent().width() : width;
	$(this).css('width', width);
	return $(this);
};

$.fn.getCaret = function(pos) {
	if ($(this).get(0).createTextRange) {
		var r = document.selection.createRange().duplicate();
		r.moveEnd('character', o.value.length);
		if (r.text == '') return $(this).get(0).value.length
		return $(this).get(0).value.lastIndexOf(r.text);
	} else {
		return $(this).get(0).selectionStart;
	}
}


/********************* validation *********************/


$.fn.validate = function(onlyCheck) {
	$control = $(this);
	var tags = $(this).getValues();
	var rules = eval('[' + ($control.children('.tag-control').attr('data-nette-rules') || '') + ']');

	success = true;
	$.each(rules, function (id, rule) {
		var op = rule.op.match(/(~)?([^?]+)/);
		rule.neg = op[1];
		rule.op = op[2];
		if (!Nette.validateRuleTagControl(tags, rule.op, rule.arg)) {
			if (typeof onlyCheck == 'undefined' || !onlyCheck) {
				Nette.addError($control.get(0), rule.msg.replace('%value', $control.getValues().join(', ')));
			}
			success = false;
		}
	});

	return success;
};


jQuery.fn.compare = function(t) {
    if (this.length != t.length) {return false;}
    var a = this.sort(),
        b = t.sort();
    for (var i = 0; t[i]; i++) {
        if (a[i] !== b[i]) {
                return false;
        }
    }
    return true;
};


Nette.validateRuleTagControl = function(tags, op, arg)
{
	switch (op) {
	case ':filled':
		return tags.length !== 0;

	case ':equal':
		arg = arg instanceof Array ? arg : [arg];
		return $(tags).compare(arg);

	case ':minLength':
		return tags.length >= arg;

	case ':maxLength':
		return tags.length <= arg;

	case ':length':
		if (typeof arg !== 'object') {
			arg = [arg, arg];
		}
		return (arg[0] === null || tags.length >= arg[0]) && (arg[1] === null || tags.length <= arg[1]);

	case ':integer':
		success = true;
		$.each(tags, function(index, tag) {
			if (!tag.match(/^-?[0-9]+$/))
				success = false;
		});
		return success;

	case ':float':
		success = true;
		$.each(tags, function(index, tag) {
			if (!tag.match(/^-?[0-9]*[.,]?[0-9]+$/))
				success = false
		});
		return success;

	case ':unique':
		return $.unique(tags) === tags;
	}

	if (onlyCheck === undefined || !onlyCheck) {
		Nette.addError($control.children('.tag-control').get(0), rule.msg.replace('%value', $control.getValues().join(', ')));
	}
	return false;
}


Nette.validateForm = function(sender) {
	var form = sender.form || sender;
	if (form['nette-submittedBy'] && form.elements[form['nette-submittedBy']] && form.elements[form['nette-submittedBy']].getAttribute('formnovalidate') !== null) {
		return true;
	}
	for (var i = 0; i < form.elements.length; i++) {
		var elem = form.elements[i];
		if (!(elem.nodeName.toLowerCase() in {input:1, select:1, textarea:1}) || (elem.type in {hidden:1, submit:1, image:1, reset: 1}) || elem.disabled || elem.readonly) {
			continue;
		}
		if ($(elem).is('.tag-control')) {
			if (!$(elem).parent().validate()) {
				return false;
			}
			continue;
		}
		if (!Nette.validateControl(elem)) {
			return false;
		}
	}
	return true;
};
