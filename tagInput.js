/**
 * Tag Input for html forms
 * @author Mikulas Dite
 * @copyright Mikulas Dite 2010
 */

$(function() {
	var default_delimiter = /[\s,]+/;

	$('input.tag-control').hide();

	$('input.tag-control').each(function(index) {
		$container = $('<span></span>').addClass('tag-container').attr('for', $(this).attr('id'));
		$value = $('<span></span>').addClass('tag-value');
		$helper = $('<input>').addClass('tag-helper');
		
		$container.appendTo($(this).parent());
		$container.append($(this));
		$container.prepend($value);
		$container.append($helper);

		if ($(this).data('tag-suggest')) {
			$suggest = $('<div><ul></ul></div>').addClass('tag-suggest');
			$container.append($suggest);
		}

		rules = eval('[' + ($(this).data('nette-rules') || '') + ']');
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
		$container.data('tag-unique', isUnique);
		$container.data('tag-length', length);

		$container.get(0).focus = function() {
			$container.children('.tag-helper').focus();
		}

		if ($(this).attr('disabled')) {
			$container.children('.tag-helper').hide();
		}
	});

	$('input.tag-helper').change(function() {
		// prevents blur if clicked on autocomplete
/** @todo this also temporarily disables the delimiter*/
		if ($('.tag-suggest:hover').length != 0) {
			if ($('.tag-suggest:hover').css('display') != 'none') {
				return false;
			}
		}

		//$(this).css('width', $(this).css('min-width'));
		$value = $(this).siblings('.tag-value');
		$main = $(this).siblings('input.tag-control');
		delimiter = $main.data('tag-delimiter') == undefined ? default_delimiter : new RegExp($main.data('tag-delimiter'));
		$.each($(this).val().split(delimiter), function(index, value) {
			if (!($value.parent().data('tag-unique') != false && $.inArray(value, $value.parent().getTagInputValues()) != -1) && $.trim(value) != '') {
				if (!($value.parent().data('tag-length') == false && $value.parent().getTagInputValues().length >= parseInt($value.parent().data('tag-length')))) {
					$value.append('<span>' + value + '<div class="delete">&times;</div></span>&zwnj;<wbr>');
				}
			}
		});

		$(this).fillToParent();

		$(this).val('');
		$main.updateTagInputValue();
	});

	$('html').live('click', function(event) {
		$('.tag-container').add('.tag-value span').removeClass('focus');

		if ($(event.target).is('.tag-value span')) {
			$(event.target).addClass('focus');
		}

		if ($(event.target).is('.tag-container')) {
			$(event.target).children('.tag-helper').focus();
			$(event.target).addClass('focus');
		} else {
			$(event.target).parents('.tag-container').addClass('focus');
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

		// prevent repeating
		if (keyDown != false) {
			return;
		}
		keyDown = e.keyCode;

		if (e.keyCode == 8 || e.keyCode == 46) { // backspace or delete
			// if input is not focused and caret is not most left
			if ($('input.tag-helper:focus').size() != 0 && $('input.tag-helper:focus').getCaret() != 0) {
				return;
			}

			$control = $('.tag-container .tag-value span.focus');
			$node = $control.parent();

			if ($('.tag-helper:focus').length != 0 && $('.tag-helper:focus').getCaret() != 0) {
				// if element on right exists
				if ($control.next().next().size() != 0) {
					$control.next().next().addClass('focus');
				// else if element on left exists
				} else if ($control.prev().prev().size() != 0) {
					$control.prev().prev().addClass('focus');
				} else {
					$control.parent().siblings('input.tag-helper').focus();
				}
			}

			// if in empty focused input, remove last tag on backspace
			if (e.keyCode == 8 && $('input.tag-helper:focus').size() != 0) {
				$control = $('input.tag-helper:focus').siblings('.tag-value').children('span:last');
				$node = $('input.tag-helper:focus').siblings('.tag-value');
			}

			// remove next <wbr>
			$control.next().remove();
			$control.remove();

			$node.siblings('input.tag-control').updateTagInputValue();

			$node.siblings('input.tag-helper').fillToParent();
			return false;

		// pressed arrow key
		} else if (e.keyCode >= 37 && e.keyCode <= 40) {
			left = e.keyCode == 37 || e.keyCode == 38;

			// if suggest is visible
			if ($('.tag-container.focus').siblings('.tag-suggest').css('display') != 'none') {
				// pressed down
				if (e.keyCode == 40) {
					if ($('.tag-suggest ul li.selected').length == 0) {
						$tag = $('.tag-container.focus').children('.tag-suggest').children('ul').children('li:first');
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
							$c.parent().parent().siblings('.tag-helper').focus();
						}
					}
					return false;
				}
			}

			$span = $('.tag-container .tag-value span.focus');
			if ($span.size() != 0) { // if any tag is focused
				if (left) {
					if ($span.prev().prev().size() == 0) { // if not most left
						return false;
					} else {
						$span.prev().prev().addClass('focus');
					}
				} else {
					if ($span.next().next().size() == 0) { // if most right
						$span.parent().siblings('input.tag-helper').focus();
					} else {
						$span.next().next().addClass('focus');
					}
				}
				$span.removeClass('focus');
				return false;
			} else if (left) {
				if ($('input.tag-helper:focus').size != 0 && $('input.tag-helper:focus').getCaret() == 0) {
					$('input.tag-helper:focus').siblings('.tag-value').children('span').filter(left ? ':last' : ':first').addClass('focus');
					$('input.tag-helper:focus').blur();
				} else {
					return true;
				}
			}

		// pressed tab
		} else if (e.keyCode == 9) {
			$('.tag-container .tag-value span').removeClass('focus');
			$('.tag-container.focus').children('input.tag-helper').focus();
			$('.tag-container.focus').removeClass('focus');
			$('.tag-suggest').hide();

		// pressed enter
		} else if (e.keyCode == 13) {
			$suggest = $('.tag-container.focus .tag-suggest ul li.selected');
			if ($suggest.length != 0) {
				$suggest.parent().parent().siblings('.tag-helper').val($suggest.text()).change();
				$('.tag-suggest ul li.selected').removeClass('selected');
				return false;
			}

			$('.tag-suggest').hide();
			if ($.trim($('.tag-helper:focus').val()) != '') {
				$('.tag-helper:focus').change();
				return false;
			}
		}

	}).keyup(function(e) {
		keyDown = false;

		// tag ended
		regex = $('.tag-helper:focus').siblings('.tag-control').data('tag-delimiter') == undefined ? default_delimiter : new RegExp($main.data('tag-delimiter'));
		if ($('.tag-helper:focus').size() != 0 && $('.tag-helper:focus').val().match(regex) != null) {
			$('.tag-helper:focus').change();
		}
	});

	var lastValue = '';
	var request = null;
	$('.tag-helper').keyup(function() {
		if (typeof ($(this).siblings('.tag-control').data('tag-suggest')) === 'undefined' || $(this).val() == lastValue) {
			return true;
		}
		lastValue = $(this).val();
		if ($(this).getCaret() >= 2) {
			$control = $(this);
			uri = $(this).siblings('.tag-control').data('tag-suggest').replace('%25__filter%25', $control.val());
			if (request != null) {
				request.abort();
			}
			request = $.getJSON(uri, null, function(request) {
				$control.siblings('.tag-suggest').hide();
				$container = $control.siblings('.tag-suggest').children('ul');
				$container.children('li').remove();
				// do not add to list if unique rule is forced and the value is already filled
				$.each(request, function(id, value) {
					if ($control.parent().data('tag-unique') == false || $.inArray(value, $container.parent().parent().getTagInputValues()) == -1) {
						$container.append('<li>' + value + '</li>');
					}
				});
				if ($container.children('li').length !== 0) {
					$control.siblings('.tag-suggest').show();
				}

				$control.siblings('.tag-suggest').children('ul').children('li').click(function() {
					$control.siblings('.tag-suggest').hide();
					$control.parent().children('.tag-helper').val($(this).text()).change();
				});
			});
		} else {
			$(this).siblings('.tag-suggest').hide();
		}
	});

	$('.tag-container .tag-value span .delete').live('click', function() {
		$control = $(this).parents('.tag-container').children('.tag-control');
		$(this).parent().remove();
		$control.updateTagInputValue();
	});

	$('.tag-helper').live('focus', function() {
		$(this).parent().addClass('focus');
	})


	// set defaults
	$('input.tag-helper').each(function() {
		$(this).val($(this).siblings('input.tag-control').val()).trigger('change');
	});
});

$.fn.updateTagInputValue = function() {
	$(this).val($(this).parent().getTagInputValues().join(', '));

	if (parseInt($(this).parent().data('tag-length')) <= $(this).parent().getTagInputValues().length) {
		$(this).siblings('.tag-helper').hide();
	} else {
		$(this).siblings('.tag-helper').show();
	}

	return $(this);
};

$.fn.getTagInputValues = function() {
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
		r.moveEnd('character', pos);
		if (r.text == '')
			return $(this).get(0).value.length;
		return $(this).get(0).value.lastIndexOf(r.text);
	} else {
		return $(this).get(0).selectionStart;
	}
}


/********************* validation *********************/


$.fn.validateTagInput = function(onlyCheck) {
	$control = $(this);
	var tags = $(this).getTagInputValues();
	var rules = eval('[' + ($control.children('.tag-control').data('nette-rules') || '') + ']');

	success = true;
	$.each(rules, function (id, rule) {
		var op = rule.op.match(/(~)?([^?]+)/);
		rule.neg = op[1];
		rule.op = op[2];
		if (!Nette.validateRuleTagControl(tags, rule.op, rule.arg)) {
			if (typeof onlyCheck == 'undefined' || !onlyCheck) {
				Nette.addError($control.get(0), rule.msg.replace('%value', $control.getTagInputValues().join(', ')));
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
		Nette.addError($control.children('.tag-control').get(0), rule.msg.replace('%value', $control.getTagInputValues().join(', ')));
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
			if (!$(elem).parent().validateTagInput()) {
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
