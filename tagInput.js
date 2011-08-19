/**
 * Tag Input for html forms
 * @author Mikuláš Dítě
 * @copyright Mikuláš Dítě 2010-11
 */

function d() {console.log(arguments);}

function Keyboard() {
	this.remove = function(e) {
		return e.keyCode == 8;
	};
	this.tab = function(e) {
		return e.keyCode == 9;
	};
	this.enter = function(e) {
		return e.keyCode == 13;
	};
	this.escape = function(e) {
		return e.keyCode == 27;
	};
	this.left = function(e) {
		return e.keyCode == 37;
	};
	this.up = function(e) {
		return e.keyCode == 38;
	};
	this.right = function(e) {
		return e.keyCode == 39;
	};
	this.down = function(e) {
		return e.keyCode == 40;
	};
	this.del = function(e) {
		return e.keyCode == 46;
	};
	this.control = function(e) {
		return $.inArray(e.keyCode, [8, 16, 17, 18, 35, 36, 37, 38, 39, 40, 46, 91, 92]) !== -1;
	};
	this.whitespace = function(e) {
		return $.inArray(e.keyCode, [13, 32]) !== -1;
	};
	this.input = function(e) {
		//d(e.keyCode, this.keyToChar(e.keyCode));
		if ($.inArray(e.keyCode, [96, 189]) !== -1) // numpad zero, hyphen
			return true;
		var letter = /^[a-iA-Z\u00C0-\u02A00-9-]+$/; // a-i numpad 1-9, A-Z letters, accented letters, numbers, hyphen
		return letter.test(this.keyToChar(e.keyCode));
	};

	this.keyToChar = function(key) {
		return String.fromCharCode(key);
	};
}

var kb = new Keyboard;

function TagInputControl() {
	var i = this;

	this.name = undefined;
	this.container = undefined;
	this.control = undefined;
	this.tags = undefined;
	this.helper = undefined;

	this.rules = undefined;
	
	this.onKeyDown = function(e) {
		if (kb.input(e)) { // just writing letters
			if (i.getMaxLen() === i.tags.children('.tag').length)
				return false;

			i.tags.children('.focus').removeClass('focus');
			i.stretchHelperToContainer();

		} else if (kb.del(e) && i.tags.children('.focus').length) {
			var selected = i.tags.children('.focus');
			if (selected.next().length)
				selected.next().addClass('focus');
			else if (selected.prev().length)
				selected.prev().addClass('focus');
			selected.remove();

		} else if (kb.remove(e) && i.helper.getCaret() === 0) { // remove last tag
			i.tags.children(':last-child').remove();

		} else if ((kb.left(e) || kb.right(e)) && i.helper.val() === '') { // tag selection
			var selected = i.tags.children('.focus');
			if (kb.left(e) && !selected.length) { // select last tag
				selected.removeClass('focus');
				i.tags.children(':last-child').addClass('focus');
			} else if (kb.left(e) && selected.prev().length) {
				selected.removeClass('focus');
				selected.prev().addClass('focus');
			} else if (kb.right(e)) {
				selected.removeClass('focus');
				selected.next().addClass('focus');
			}

		} else if (kb.escape(e)) { // throw away current input
			i.helper.val('');
			i.stretchHelperToContainer();

		} else if (!kb.control(e)) { // create tag from helper
			return i.helperToTag();
		}
	};

	this.helperToTag = function() {
		var value = i.helper.val().trim();
		i.helper.val('');
		i.createTag(value);
		i.stretchHelperToContainer();
		return false;
	};

	this.onChange = function() {
		return false;
	};

	this.focus = function() {
		i.helper.focus();
	};

	this.onFocus = function() {
		i.container.addClass('focus');
	};

	this.onBlur = function() {
		i.container.removeClass('focus');
		i.tags.children().removeClass('focus');
		i.helperToTag();
	};

	this.isUnique = function() {
		var unique = false;
		$.each(i.rules, function(index, rule) {
			if (rule.op === ':unique') unique = true;
		});
		return unique;
	};

	this.getMaxLen = function() {
		var length = 0;
		$.each(i.rules, function(index, rule) {
			if (rule.op === ':maxLength' || rule.op === ':length') length = rule.arg > length ? rule.arg : length;
		});
		return length;
	};

	this.getDelimiter = function() {
		return i.control.data('tag-delimiter');
	};

	this.val = function(values) {
		if (arguments.length === 0) {
			var value = [];
			i.tags.find('.tag').each(function() {
				value.push($(this)[0].firstChild.textContent); // only tag text without delete
			});
			return value;
		}
		i.tags.children().remove();
		$.each(values, function(x, v) {
			i.createTag(v);
		});
	};

	this.createTag = function(value) {
		value = value.trim();
		if (!value || (i.isUnique() && $.inArray(value, i.val()) !== -1))
			return false;

		var tag = $('<span/>').addClass('tag');
		tag.text(value);
		tag.click(function() {
			i.focus();
			$(this).addClass('focus');
		});
		var del = $('<span/>').addClass('tag-delete').html('&times;');
		tag.append(del);
		del.click(function() {
			tag.remove();
			i.stretchHelperToContainer();
			i.focus();
		});
		i.tags.append(tag);
		i.val();
	};

	this.stretchHelperToContainer = function() {
		i.helper.css('width', 0);
		var width = i.container.position()['left'] + i.container.width() - i.helper.position()['left'];
		width = width < 50 ? i.container.width() : width;
		i.helper.css('width', width);
	};

	this.getForm = function() {
		return i.control.parents('form');
	};

	this.save = function() {
		i.control.val(i.val().join(i.control.data('tag-joiner')));
		return false;
	};
}

var TagInput = TagInput || {inputs: []};

TagInput.create = function(control) {
	var input = new TagInputControl;

	input.name = control;
	input.container = $('<div/>').addClass('tag-container');
	input.control = $(control);
	input.tags = $('<span/>');
	input.helper = $('<input type="text"/>');

	input.control.hide();

	input.control.after(input.container);
	input.container.append(input.control);
	input.container.append(input.tags);
	input.container.append(input.helper);

	input.helper.keydown(input.onKeyDown);
	input.helper.bind('paste cut change', input.onChange);

	input.rules = eval('[' + (input.control.data('nette-rules') || '') + ']');

	input.val(input.control.val().split(input.control.data('tag-joiner')));

	input.stretchHelperToContainer();

	input.getForm().submit(function() {
		input.save();
	});

	input.helper.focus(input.onFocus);
	input.helper.blur(input.onBlur);
	input.control.focus = input.container.focus = input.focus;

	this.inputs.push(input);
};

/********************* caret position *****************/

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
};

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
