<?php

namespace Nette\Forms;

use Nette\Forms\Form;
use Nette\Forms\TextInput;
use Nette\String;


class TagInput extends TextInput
{

	private $delimiter = '[\s,]+';



	public function setDelimiter($delimiter)
	{
		$this->delimiter = $delimiter;
		return $this;
	}



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



	public static function register()
	{
		Form::extensionMethod('addTag', callback(__CLASS__, 'addTagInput'));
	}



	public static function addTagInput(Form $form, $name, $label = NULL)
	{
		return $form[$name] = new self($label);
	}
}
