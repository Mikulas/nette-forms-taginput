<?php

namespace Nette\Forms;

use Nette\Forms\Form;
use Nette\Forms\TextInput;
use Nette\String;


class TagInput extends TextInput
{

	private $delimiter = '/[\s,]+/';



	public function setDelimiter($delimiter)
	{
		$this->delimiter = $delimiter;
	}



	public function getValue()
	{
		return String::split(parent::getValue(), $this->delimiter);
	}



	/**
	 * Generates control's HTML element.
	 * @return Nette\Web\Html
	 */
	public function getControl()
	{
		$control = parent::getControl();
		$control->class[] = "tag-control";
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
