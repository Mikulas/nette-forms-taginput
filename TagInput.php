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
		return String::split(parent::getValue(), "\x01" . $this->delimiter . "\x01");
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



	public function  addRule($operation, $message = NULL, $arg = NULL)
	{
		throw new \NotImplementedException('');
		parent::addRule($operation, $message, $arg);
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
}
