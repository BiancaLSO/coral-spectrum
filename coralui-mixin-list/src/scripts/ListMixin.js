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

import {SelectableCollection} from 'coralui-collection';
import {transform, validate} from 'coralui-util';

const CLASSNAME = 'coral3-BasicList';

/**
 Enumeration for {@link ListMixin} interactions.
 
 @typedef {Object} ListInteractionEnum
 
 @property {String} ON
 Keyboard interaction is enabled.
 @property {String} OFF
 Keyboard interaction is disabled.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

/**
 @mixin ListMixin
 @classdesc The base element for List components
 */
const ListMixin = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
  
    this._events = {
      'key:down [coral-list-item]': '_focusNextItem',
      'key:right [coral-list-item]': '_focusNextItem',
      'key:left [coral-list-item]': '_focusPreviousItem',
      'key:up [coral-list-item]': '_focusPreviousItem',
      'key:pageup [coral-list-item]': '_focusPreviousItem',
      'key:pagedown [coral-list-item]': '_focusNextItem',
      'key:home [coral-list-item]': '_focusFirstItem',
      'key:end [coral-list-item]': '_focusLastItem'
    };
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        itemTagName: this._itemTagName,
        itemBaseTagName: this._itemBaseTagName,
        itemSelector: '[coral-list-item]',
        host: this
      });
    }
  
    return this._items;
  }
  
  /** @private */
  get _itemTagName() {
    // Used for Collection
    return 'coral-list-item';
  }
  
  /**
   Whether interaction with the component is enabled. See {@link ListInteractionEnum}.
   
   @type {String}
   @default ListInteractionEnum.ON
   @htmlattribute interaction
   @htmlattributereflected
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }
  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.ON;
    this._reflectAttribute('interaction', this._interaction);
  }
  
  /**
   Returns true if the event is at the matched target.
   
   @private
   */
  _eventIsAtTarget(event) {
    const target = event.target;
    const listItem = event.matchedTarget;
  
    const isAtTarget = target === listItem;
    
    if (isAtTarget) {
      // Don't let arrow keys etc scroll the page
      event.preventDefault();
      event.stopPropagation();
    }
    
    return isAtTarget;
  }
  
  /** @private */
  _focusFirstItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }
  
    const items = this._getSelectableItems();
    items[0].focus();
  }
  
  /** @private */
  _focusLastItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }
  
    const items = this._getSelectableItems();
    items[items.length - 1].focus();
  }
  
  /** @private */
  _focusNextItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    const items = this._getSelectableItems();
    const index = items.indexOf(target);
    
    if (index === -1) {
      // Invalid state
      return;
    }
    
    if (index < items.length - 1) {
      items[index + 1].focus();
    }
    else {
      items[0].focus();
    }
  }
  
  /** @private */
  _focusPreviousItem(event) {
    if (this.interaction === interaction.OFF || !this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    const items = this._getSelectableItems();
    const index = items.indexOf(target);
    
    if (index === -1) {
      // Invalid state
      return;
    }
    
    if (index > 0) {
      items[index - 1].focus();
    }
    else {
      items[items.length - 1].focus();
    }
  }
  
  /** @private */
  _getSelectableItems() {
    // Also checks if item is visible
    return this.items._getSelectableItems().filter(item => !item.hasAttribute('hidden') && item.offsetParent);
  }
  
  /** @ignore */
  focus() {
    if (!this.contains(document.activeElement)) {
      const items = this._getSelectableItems();
      if (items.length > 0) {
        items[0].focus();
      }
    }
  }
  
  /**
   Returns {@link ListMixin} interaction options.
   
   @return {ListInteractionEnum}
   */
  static get interaction() { return interaction; }
  
  /** @ignore */
  static get observedAttributes() { return ['interaction']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME, 'coral3-SelectList');
    
    // Default reflected attributes
    if (!this._interaction) { this.interaction = interaction.ON; }
  }
};

export default ListMixin;
