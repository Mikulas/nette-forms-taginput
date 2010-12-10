<?php

namespace Nette\Forms;

use Nette\Forms\Form;
use Nette\Forms\TextInput;
use Nette\String;


/**
 * @todo add unique supprot in php
 * @todo add php support for validators
 * @todo add js support for validators
 */
class TagInput extends TextInput
{

	/** @var string rule */
	const UNIQUE = ':unique';



	/** @var string regex */
	private $delimiter = '[\s,]+';



	/**
	 * @param string $delimiter regex
	 * @return TagInput provides fluent interface
	 */
	public function setDelimiter($delimiter)
	{
		$this->delimiter = $delimiter;
		return $this;
	}



	/**
	 * @return array
	 */
	public function getValue()
	{
		$value = String::split(parent::getValue(), "\x01" . $this->delimiter . "\x01");
		if ($value[0] == '' && count($value) === 1) {
			$value = array();
		}
		return $value;
	}



	/**
	 * Generates control's HTML element.
	 * @return Nette\Web\Html
	 */
	public function getControl()
	{
		$control = parent::getControl();
		$control->class[] = "tag-control";

		if ($this->delimiter !== NULL && String::trim($this->delimiter) !== '') {
			$control->attrs['data-tag-delimiter'] = $this->delimiter;
		}
		
		return $control;
	}



	/**
	 * @param array $value
	 * @return TagInput provides fluent interface
	 */
	public function setDefaultValue($value)
	{
		if (!is_array($value)) {
			throw new \InvalidArgumentException("Invalid argument type passed to " . __METHOD__ . ", expected array.");
		}
		parent::setDefaultValue(implode(', ', $value));
		return $this;
	}



	/**
	 * Adds a validation rule.
	 * @param  mixed      rule type
	 * @param  string     message to display for invalid data
	 * @param  mixed      optional rule arguments
	 * @return FormControl  provides a fluent interface
	 */
	public function addRule($operation, $message = NULL, $arg = NULL)
	{
		switch($operation) {
			case Form::EQUAL:
				if (!is_array($arg))
					throw new \InvalidArgumentException(__METHOD__ . '(' . $operation . ') must be compared to array.');
		}

		return parent::addRule($operation, $message, $arg);
	}



	/********************* registration *******************/



	/**
	 * Adds addTag() method to \Nette\Forms\Form
	 */
	public static function register()
	{
		Form::extensionMethod('addTag', callback(__CLASS__, 'addTagInput'));
	}



	/**
	 * @param Form $form
	 * @param string $name
	 * @param string $label
	 * @return TagInput provides fluent interface
	 */
	public static function addTagInput(Form $form, $name, $label = NULL)
	{
		return $form[$name] = new self($label);
	}



	/********************* validation *********************/



	/**
	 * Equal validator: are control's value and second parameter equal?
	 * @param  IFormControl
	 * @param  mixed
	 * @return bool
	 */
	public static function validateEqual(IFormControl $control, $arg)
	{
		$value = $control->getValue();
		sort($value);
		sort($arg);
		return $value === $arg;
	}



	/**
	 * Filled validator: is control filled?
	 * @param  IFormControl
	 * @return bool
	 */
	public static function validateFilled(IFormControl $control)
	{
		return count($control->getValue()) !== 0;
	}



	/**
	 * Min-length validator: has control's value minimal length?
	 * @param  TextBase
	 * @param  int  length
	 * @return bool
	 */
	public static function validateMinLength(TextBase $control, $length)
	{
		return count($control->getValue()) >= $length;
	}



	/**
	 * Max-length validator: is control's value length in limit?
	 * @param  TextBase
	 * @param  int  length
	 * @return bool
	 */
	public static function validateMaxLength(TextBase $control, $length)
	{
		return count($control->getValue()) <= $length;
	}



	/**
	 * Length validator: is control's value length in range?
	 * @param  TextBase
	 * @param  array  min and max length pair
	 * @return bool
	 */
	public static function validateLength(TextBase $control, $range)
	{
		if (!is_array($range)) {
			$range = array($range, $range);
		}
		$len = count($control->getValue());
		return ($range[0] === NULL || $len >= $range[0]) && ($range[1] === NULL || $len <= $range[1]);
	}



	/**
	 * Email validator: is control's value valid email address?
	 * @param  TextBase
	 * @return bool
	 */
	public static function validateEmail(TextBase $control)
	{
		throw new \LogicException(':EMAIL validator is not applicable to TagControl.');
	}



	/**
	 * URL validator: is control's value valid URL?
	 * @param  TextBase
	 * @return bool
	 */
	public static function validateUrl(TextBase $control)
	{
		throw new \LogicException(':URL validator is not applicable to TagControl.');
	}



	/** @deprecated */
	public static function validateRegexp(TextBase $control, $regexp)
	{
		throw new \LogicException(':REGEXP validator is not applicable to TagControl.');
	}



	/**
	 * Regular expression validator: matches control's value regular expression?
	 * @param  TextBase
	 * @param  string
	 * @return bool
	 */
	public static function validatePattern(TextBase $control, $pattern)
	{
		throw new \LogicException(':PATTERN validator is not applicable to TagControl.');
	}



	/**
	 * Integer validator: is each value of tag of control decimal number?
	 * @param  TextBase
	 * @return bool
	 */
	public static function validateInteger(TextBase $control)
	{
		foreach ($control->getValue() as $tag) {
			if (!String::match($tag, '/^-?[0-9]+$/')) {
				return FALSE;
			}
		}
		return TRUE;
	}



	/**
	 * Float validator: is each value of tag of control value float number?
	 * @param  TextBase
	 * @return bool
	 */
	public static function validateFloat(TextBase $control)
	{
		foreach ($control->getValue() as $tag) {
			if (!String::match($tag, '/^-?[0-9]*[.,]?[0-9]+$/')) {
				return FALSE;
			}
		}
		return TRUE;
	}



	/**
	 * Range validator: is a control's value number in specified range?
	 * @param  TextBase
	 * @param  array  min and max value pair
	 * @return bool
	 */
	public static function validateRange(TextBase $control, $range)
	{
		throw new \LogicException(':RANGE validator is not applicable to TagControl.');
	}



	/**
	 * Uniqueness validator: is each value of tag of control unique?
	 * @param  TagInput
	 * @return bool
	 */
	public static function validateUnique(TagInput $control)
	{
		return count(array_unique($control->getValue())) === count($control->getValue());
	}
}
