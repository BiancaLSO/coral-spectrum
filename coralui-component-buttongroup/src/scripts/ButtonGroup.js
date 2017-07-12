/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import Component from 'coralui-mixin-component';
import FormField from 'coralui-mixin-formfield';
import 'coralui-component-button';
import {SelectableCollection} from 'coralui-collection';
import base from '../templates/base';
import {transform, validate, commons} from 'coralui-util';

/**
 Enumeration representing buttongroup selection modes.
 
 @memberof Coral.ButtonGroup
 @enum {String}
 */
const selectionMode = {
  /** None is default, selection of buttons doesn't happen based on click */
  NONE: 'none',
  /** Single selection mode, button group behaves like radio input elements */
  SINGLE: 'single',
  /** Multiple selection mode, button group behaves like checkbox input elements */
  MULTIPLE: 'multiple'
};

/** @const Selector used to recognized an item of the ButtonGroup */
const ITEM_SELECTOR = 'button[is="coral-button"]';

/**
 Extracts the value from the item in case no explicit value was provided.
 @param {HTMLElement} item
 the item whose value will be extracted.
 @returns {String} the value that will be submitted for this item.
 @private
 */
const itemValueFromDOM = function(item) {
  const attr = item.getAttribute('value');
  // checking explicitely for null allows to differenciate between non set values and empty strings
  return attr !== null ? attr : item.textContent.replace(/\s{2,}/g, ' ').trim();
};

const CLASSNAME = 'coral3-ButtonGroup';

/**
 @class Coral.ButtonGroup
 @classdesc A ButtonGroup component
 @htmltag coral-buttongroup
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.formField
 */
class ButtonGroup extends FormField(Component(HTMLElement)) {
  constructor() {
    super();
    
    // Store template
    this._elements = {};
    base.call(this._elements);
  
    // save initial selection (used for reset)
    this._initalSelectedValues = [];
    
    // Attach events
    this.on({
      'click button[is="coral-button"]': '_onButtonClick',
  
      'capture:focus button[is="coral-button"]': '_onButtonFocus',
      'capture:blur button[is="coral-button"]': '_onButtonBlur',
  
      'key:up button[is="coral-button"]': '_onButtonKeyUpLeft',
      'key:left button[is="coral-button"]': '_onButtonKeyUpLeft',
      'key:down button[is="coral-button"]': '_onButtonKeyDownRight',
      'key:right button[is="coral-button"]': '_onButtonKeyDownRight',
      'key:home button[is="coral-button"]': '_onButtonKeyHome',
      'key:end button[is="coral-button"]': '_onButtonKeyEnd',
      
      'coral-button:_valuechanged button[is="coral-button"]': '_onButtonValueChanged',
      'coral-button:_selectedchanged button[is="coral-button"]': '_onButtonSelectedChanged',
    });
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains. See
   {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.ButtonGroup#
   */
  get items() {
    // we do lazy initialization of the collection
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemBaseTagName: 'button',
        itemTagName: 'coral-button',
        itemSelector: ITEM_SELECTOR,
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved,
        onCollectionChange: this._onCollectionChange
      });
    }
  
    return this._items;
  }
  
  /**
   Selection mode of Button group
   
   @type {String}
   @default Coral.ButtonGroup.selectionMode.NONE
   @htmlattribute selectionmode
   @memberof Coral.ButtonGroup#
   */
  get selectionMode() {
    return this._selectionMode || selectionMode.NONE;
  }
  set selectionMode(value) {
    value = transform.string(value).toLowerCase();
  
    if (validate.enumeration(selectionMode)(value)) {
      this._selectionMode = value;
    
      transform.reflect(this, 'selectionmode', value);
  
      // update select element if multiple
      // this is required while appplying default selection
      // if selection mode is single first elem gets selected but for multiple its not
      this._elements.nativeSelect.multiple = this._selectionMode === selectionMode.MULTIPLE;
  
      // Sync
      if (this._selectionMode === selectionMode.SINGLE) {
        this.setAttribute('role', 'radiogroup');

        // makes sure the internal options are properly initialized
        this._syncItemOptions();

        // we make sure the selection is valid by explicitly finding a candidate or making sure just 1 item is
        // selected
        this._validateSelection();
      }
      else if (this._selectionMode === selectionMode.MULTIPLE) {
        this.setAttribute('role', 'group');

        // makes sure the internal options are properly initialized
        this._syncItemOptions();
      }
      else {
        this.setAttribute('role', 'group');

        this._removeItemOptions();
      }
    }
  }
  
  // JSDoc inherited
  get name() {
    return this._elements.nativeSelect.name;
  }
  set name(value) {
    transform.reflect(this, 'name', value);
    
    this._elements.nativeSelect.name = value;
  }
  
  // JSDoc inherited
  get value() {
    return this._elements.nativeSelect.value;
  }
  set value(value) {
    if (this.selectionMode === selectionMode.NONE) {
      return;
    }
  
    // we proceed to select the provided value
    this._selectItemByValue([value]);
  }
  
  /**
   Returns an Array containing the selected buttons.
   
   @type {Array.<HTMLElement>}
   @readonly
   @memberof Coral.ButtonGroup#
   */
  get selectedItems() {
    if (this.selectionMode === selectionMode.MULTIPLE) {
      return this.items._getAllSelected();
    }
    else {
      const item = this.selectedItem;
      return item ? [item] : [];
    }
  }
  
  /**
   Returns the first selected button in the Button Group. The value <code>null</code> is returned if no button is
   selected.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.ButtonGroup#
   */
  get selectedItem() {
    return this.selectionMode === selectionMode.MULTIPLE ?
      this.items._getFirstSelected() :
      this.items._getLastSelected();
  }
  
  /**
   Current selected values as submitted during form submission.
   
   @type {Array.<String>}
   @memberof Coral.ButtonGroup#
   */
  get values() {
    const values = [];

    // uses the nativeSelect since it holds the truth of what will be submitted with the form
    const selectedOptions = this._elements.nativeSelect.selectedOptions;
    for (var i = 0, selectedOptionsCount = selectedOptions.length; i < selectedOptionsCount; i++) {
      values.push(selectedOptions[i].value);
    }

    return values;
  }
  set values(values) {
    if (Array.isArray(values) && this.selectionMode !== selectionMode.NONE) {
      // just keeps the first value if selectionMode is not multiple
      if (this.selectionMode !== selectionMode.MULTIPLE && values.length > 1) {
        values = [values[0]];
      }
    
      // we proceed to select the provided values
      this._selectItemByValue(values);
    }
  }
  
  // JSDoc inherited
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    transform.reflect(this, 'disabled', this._disabled);
  
    const isDisabled = this.disabled || this.readOnly;
    this._elements.nativeSelect.disabled = isDisabled;
    // Also update for all the items the disabled property so it matches the native select.
    this.items.getAll().forEach(function(item) {
      item.disabled = isDisabled;
    });
    this.setAttribute('aria-disabled', isDisabled);
  }
  
  // JSDoc inherited
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    transform.reflect(this, 'readonly', this._readOnly);
  
    const self = this;
    this._elements.nativeSelect.disabled = this.readOnly || this.disabled;
    // Also update for all the items the disabled property so it matches the native select.
    this.items.getAll().forEach(function(item) {
      item.disabled = self.disabled || (self.readOnly && !item.hasAttribute('selected'));
      if (self.readOnly) {
        item.setAttribute('aria-disabled', true);
      }
      else {
        item.removeAttribute('aria-disabled');
      }
    });
    // aria-readonly is not permitted on elements with role="radiogroup" or role="group"
    this.removeAttribute('aria-readonly');
  }
  
  // JSDoc inherited
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    transform.reflect(this, 'required', this._required);
  
    this._elements.nativeSelect.required = this.required;
    // aria-required is permitted on elements with role="radiogroup" but not with role="group"
    if (this.selectionMode !== selectionMode.SINGLE) {
      this.removeAttribute('aria-required');
    }
  }
  
  // JSDoc inherited
  get labelledBy() {
    return super.labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
    this._elements.nativeSelect.setAttribute('aria-labelledby', this.labelledBy);
  }
  
  // JSDocs inherited
  reset() {
    // reset the values to the initial values
    this.values = this._initalSelectedValues;
  }
  
  /** @private */
  _onButtonClick(event) {
    // uses matchTarget to make sure the buttons is handled and not an internal component
    const item = event.matchedTarget;
  
    this._onButtonFocus(event);
  
    if (this.readOnly) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
  
    if (this.selectionMode === selectionMode.SINGLE) {
      // prevent event only if selectionMode is not of type none
      event.preventDefault();
    
      // first unselect the other element
      const selectedItems = this.items._getAllSelected();
    
      // we deselect the previously selected item
      if (selectedItems.length !== 0 && selectedItems[0] !== item) {
        this._toggleItemSelection(selectedItems[0], false);
      }
    
      // forces the selection on the clicked item
      this._toggleItemSelection(item, true);
    
      // if the same button was clicked we do not need to trigger an event
      if (selectedItems[0] !== item) {
        this.trigger('change');
      }
    }
    else if (this.selectionMode === selectionMode.MULTIPLE) {
      // prevent event only if selectionMode is not of type none
      event.preventDefault();
    
      this._toggleItemSelection(item);
    
      // since we toggle the selection we always trigger a change event
      this.trigger('change');
    }
  }
  
  /** @private */
  _onButtonFocus(event) {
    const item = event.matchedTarget;
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;
  
    let button;
    for (let i = 0; i < buttonsCount; i++) {
      // stores the reference
      button = buttons[i];
      button.setAttribute('tabindex', button === item ? 0 : -1);
    }
  }
  
  /** @private */
  _onButtonBlur(event) {
    const item = event.matchedTarget;
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;
  
    let button;
    let tabindex;
    const selectedItemsLength = this.selectedItems.length;
    const firstSelectable = this.items._getFirstSelectable();
    let isSelected = false;
    for (let i = 0; i < buttonsCount; i++) {
      // stores the reference
      button = buttons[i];
      isSelected = button.hasAttribute('selected');
      if (this.selectionMode === selectionMode.SINGLE) {
        // selected item should be tabbable
        tabindex = isSelected ? 0 : -1;
      }
      else if (this.selectionMode === selectionMode.MULTIPLE) {
        tabindex =
          // if no items are selected, first item should be tabbable
          (!selectedItemsLength && i === 0) ||
          // if the element losing focus is selected, it should be tabbable
          (isSelected && button === item) ||
          // if the element losing focus is not selected, the last selected item should be tabbable
          (!item.hasAttribute('selected') &&
          button === (this.selectedItems[selectedItemsLength - 1] || firstSelectable)) ? 0 : -1;
      }
      else {
        // first item should be tabbable
        tabindex = button === firstSelectable ? 0 : -1;
      }
      button.setAttribute('tabindex', tabindex);
    }
  }
  
  /** @private */
  _onButtonKeyUpLeft(event) {
    event.preventDefault();
  
    const item = event.matchedTarget;
    let button = item.previousElementSibling;
  
    // skip disabled items
    while (!button || (button.disabled || button.nodeName !== 'BUTTON')) {
      if (!button) {
        button = this.items._getLastSelectable();
      }
      else {
        button = button.previousElementSibling;
      }
    }
  
    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }
  
  /** @private */
  _onButtonKeyDownRight(event) {
    event.preventDefault();
  
    const item = event.matchedTarget;
    let button = item.nextElementSibling;
  
    // skip disabled items
    while (!button || (button.disabled || button.nodeName !== 'BUTTON')) {
      if (!button) {
        button = this.items._getFirstSelectable();
      }
      else {
        button = button.nextElementSibling;
      }
    }
  
    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }
  
  /** @private */
  _onButtonKeyHome(event) {
    event.preventDefault();
  
    const item = event.matchedTarget;
    const button = this.items._getFirstSelectable();
  
    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }
  
  /** @private */
  _onButtonKeyEnd(event) {
    event.preventDefault();
  
    const item = event.matchedTarget;
    const button = this.items._getLastSelectable();
  
    if (button !== item) {
      if (this.selectionMode === selectionMode.SINGLE) {
        button.click();
      }
      this._setFocusToButton(button);
    }
  }
  
  /** @private */
  _setFocusToButton(button) {
    if (button) {
      button.focus();
    }
  }
  
  /** @private */
  _onItemAdded(item) {
    // we need to add button group specific classes to style the button correctly
    item.classList.add('coral3-ButtonGroup-item');
    if (this.selectionMode !== selectionMode.NONE) {
      if (this.selectionMode === selectionMode.SINGLE) {
        item.setAttribute('role', 'radio');
        item.setAttribute('tabindex', item.hasAttribute('selected') ? 0 : -1);
      }
      else {
        item.setAttribute('role', 'checkbox');
      }
      item.setAttribute('aria-checked', item.hasAttribute('selected'));
    }
    else {
      item.removeAttribute('role');
    }
  
    item.disabled = this.disabled || (this.readOnly && !item.hasAttribute('selected'));
  
    if (this.readOnly) {
      item.setAttribute('aria-disabled', true);
    }
    else {
      item.removeAttribute('aria-disabled');
    }
  
    this._addItemOption(item);
    
    // See if this affects our selection (we might require a selection when an item is available):
    this._validateSelection(item.hasAttribute('selected') ? item : null);
  }
  
  /** @private */
  _onItemRemoved(item) {
    // we clear the class that was added
    item.classList.remove('coral3-ButtonGroup-item');
    item.removeAttribute('role');
    
    const self = this;
    if (!item.parentNode) {
      // Remove the item from the initial selected values
      const index = self._initalSelectedValues.indexOf(item.value);
      if (index !== -1) {
        self._initalSelectedValues.splice(index, 1);
      }
    }
    
    // delete option
    if (item.option) {
      item.option.parentNode.removeChild(item.option);
      item.option = undefined;
    }
  }
  
  /** @private */
  _onCollectionChange(addedNodes, removedNodes) {
    // we need to make sure that the state of the selectionMode is valid
    this._validateSelection();
  }
  
  /** @private */
  _onButtonSelectedChanged(event) {
    event.stopImmediatePropagation();
  
    const button = event.target;
    const isSelected = event.detail.value;

    // when in single mode, we need to make sure the current selection is valid
    if (this.selectionMode === selectionMode.SINGLE) {
      this._validateSelection(isSelected ? button : null);
    }
    else {
      // we simply toggle the selection
      this._toggleItemSelection(button, isSelected);
    }
  }
  
  /** @private */
  _onButtonValueChanged(event) {
    event.stopImmediatePropagation();
  
    const button = event.target;
    // Make sure option is attached before setting the value
    if (this.selectionMode !== selectionMode.NONE) {
      button.option.value = itemValueFromDOM(button);
    }
  }
  
  /**
   Toggles the selected state of the item. When <code>selected</code> is provided, it is set as the current state. If
   the value is ommited, then the selected is toggled.
   
   @param {HTMLElement} item
   Item whose selection needs to be updated.
   @param {Boolean} [selected]
   Whether the item is selected. If it is not provided, then it is toggled.
   
   @private
   */
  _toggleItemSelection(item, selected) {
    const ariaCheckedAttr = item.getAttribute('aria-checked');
    const tabIndexAttr = item.getAttribute('tabindex');
    
    // if selected is provided it is used to enforce the selection, otherwise we toggle the current state
    selected = typeof selected !== 'undefined' ? selected : !item.hasAttribute('selected');
    
    // only manipulates the attributes when necessary to avoid unnecessary mutations
    if (selected) {
      if (!item.hasAttribute('selected')) {
        item.setAttribute('selected', '');
      }
      
      if (ariaCheckedAttr !== 'true') {
        item.setAttribute('aria-checked', true);
      }
      
      if (this.selectionMode === selectionMode.SINGLE && tabIndexAttr !== '0') {
        item.setAttribute('tabindex', 0);
      }
    }
    else if (!selected) {
      if (item.hasAttribute('selected')) {
        item.removeAttribute('selected');
      }
      
      if (this.selectionMode !== selectionMode.NONE) {
        if (ariaCheckedAttr !== 'false') {
          item.setAttribute('aria-checked', false);
        }
        
        if (this.selectionMode === selectionMode.SINGLE && tabIndexAttr !== '-1') {
          item.setAttribute('tabindex', -1);
        }
      }
      else {
        item.removeAttribute('aria-checked');
        item.removeAttribute('tabindex');
      }
    }
    
    // if element.option is present - absent when selection mode changed to none
    if (item.option) {
      item.option.selected = selected;
    }
  }
  
  
  _selectItemByValue(values) {
    // queries all the buttons to change their selection state
    const buttons = this.items.getAll();
    let item;
    
    for (let i = 0, buttonsCount = buttons.length; i < buttonsCount; i++) {
      // stores the reference
      item = buttons[i];
      
      // if the value is inside the new values array it should be selected
      this._toggleItemSelection(item, values.indexOf(itemValueFromDOM(item)) !== -1);
    }
  }
  
  /** @private */
  _setInitialValues() {
    if (this.selectionMode !== selectionMode.NONE) {
      const selectedItems = this.selectedItems;
      for (let i = 0, selectedItemsCount = selectedItems.length; i < selectedItemsCount; i++) {
        // Store _initalSelectedValues for reset
        this._initalSelectedValues.push(selectedItems[i].value);
  
        // Same goes for native select
        this._addItemOption(selectedItems[i]);
      }
    }
  }
  
  /** @private */
  _addItemOption(item) {
    if (this.selectionMode === selectionMode.NONE) {
      return;
    }
    
    // if already attached return
    if (item.option) {
      return;
    }
    
    const option = document.createElement('option');
    option.value = itemValueFromDOM(item);
  
    if (item.hasAttribute('selected')) {
      option.setAttribute('selected', '');
    }
    
    // add it to DOM. In single selectionMode the first item gets selected automatically
    item.option = option;
    this._elements.nativeSelect.add(option);
    
    // we make sure the options reflect the state of the button
    this._toggleItemSelection(item, item.hasAttribute('selected'));
  }
  
  /** @private */
  _removeItemOptions() {
    // Find all buttons and try attaching corresponding option elem
    const buttons = this.items.getAll();
    
    let item;
    for (let i = 0, buttonsCount = buttons.length; i < buttonsCount; i++) {
      // stores the reference
      item = buttons[i];
      
      item.removeAttribute('role');
      item.removeAttribute('aria-checked');
      
      // single we are removing the options, selection must also go away
      if (item.hasAttribute('selected')) {
        this._toggleItemSelection(item, false);
      }
      
      // we clear the related option element
      if (item.option) {
        item.option.parentNode.removeChild(item.option);
        delete item.option;
      }
    }
  }
  
  /** @private */
  _syncItemOptions() {
    // finds all buttons and try attaching corresponding option elem
    const buttons = this.items.getAll();
    const buttonsCount = buttons.length;
    let i = 0;
    const role = this.selectionMode === selectionMode.SINGLE ?
      'radio' : (this.selectionMode === selectionMode.MULTIPLE ? 'checkbox' : null);
    let button;
    let isSelected = false;
    
    for (i; i < buttonsCount; i++) {
      // try attaching corresponding input element
      this._addItemOption(buttons[i]);
    }
    
    // We need to set the right state for the native select AFTER all buttons have been added
    // (as we can't disable options while there is only one option attached [at least in FF])
    for (i = buttonsCount - 1; i >= 0; i--) {
      button = buttons[i];
      isSelected = button.hasAttribute('selected');
      button.option.selected = isSelected;
      button.setAttribute('aria-checked', isSelected);
      
      if (role) {
        button.setAttribute('role', role);
      }
      else {
        button.removeAttribute('role');
      }
    }
  }
  
  /** @private */
  _validateSelection(item) {
    // when selectionMode = single, we need to force a selection
    if (this.selectionMode === selectionMode.SINGLE) {
      // gets the current selection
      const selection = this.items._getAllSelected();
      const selectionCount = selection.length;

      // if no item is currently selected, we need to find a candidate
      if (selectionCount === 0) {
        // gets the first candidate for selection
        const selectable = this.items._getFirstSelectable();

        if (selectable) {
          this._toggleItemSelection(selectable, true);
        }
      }
      // more items are selected, so we find a single item and deselect everything else
      else if (selectionCount > 1) {
        // if no item was provided we force the selection on the first item
        item = item || selection[0];

        // we make sure the item is selected, this is important to match the options with the selection
        this._toggleItemSelection(item, true);

        for (let i = 0; i < selectionCount; i++) {
          if (selection[i] !== item) {
            this._toggleItemSelection(selection[i], false);
          }
        }
      }
    }
  }
  
  /**
   Modifies the accessibility target to be the ButtonGroup itself and not any of the internal buttons.
   
   @private
   */
  _getLabellableElement() {
    return this;
  }
  
  get _attributes() {return commons.extend({selectionmode: 'selectionMode'}, super._attributes);}
  
  // Expose enumerations
  static get selectionMode() {return selectionMode;}
  
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'selectionmode',
      'selectionMode'
    ]);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Create a temporary fragment
    const frag = document.createDocumentFragment();
  
    // Render the template
    frag.appendChild(this._elements.nativeSelect);
  
    // Clean up
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.getAttribute('handle') !== 'nativeSelect') {
        // Add non-template elements to the content
        frag.appendChild(child);
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
  
    // Append the fragment to the component
    this.appendChild(frag);
  
    // Need to store and set the initially selected values in the native select so that it can reset
    this._setInitialValues();
  
    // tells the collection to handle the addition and removal automatically
    this.items._startHandlingItems();
  }
}

export default ButtonGroup;
