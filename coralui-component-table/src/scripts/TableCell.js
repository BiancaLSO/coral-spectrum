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

import {ComponentMixin} from 'coralui-mixin-component';
import {transform} from 'coralui-util';

const CLASSNAME = 'coral-Table-cell';

/**
 @class Coral.Table.Cell
 @classdesc A Table cell component
 @htmltag coral-table-cell
 @htmlbasetag td
 @extends {HTMLTableCellElement}
 @extends {ComponentMixin}
 */
class TableCell extends ComponentMixin(HTMLTableCellElement) {
  /**
   The cell's content.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this;
  }
  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        this[prop] = value[prop];
      }
    }
  }
  
  /**
   Whether the table cell is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this.trigger('coral-table-cell:_beforeselectedchanged');
    
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.trigger('coral-table-cell:_selectedchanged');
  
    this._syncAriaSelectedState();
    this._syncSelectHandle();
  }
  
  /**
   The cell's value.
   
   @type {String}
   @default ""
   @htmlattribute value
   @htmlattributereflected
   */
  get value() {
    return this.getAttribute('value') || '';
  }
  set value(value) {
    this.setAttribute('value', transform.string(value));
  }
  
  /** @private */
  _setHandle(handle) {
    // Specify handle directly on the cell if none found
    if (!this.querySelector(`[${handle}]`)) {
      this.setAttribute(handle, '');
    }
  }
  
  /** @private */
  _toggleSelectable(selectable) {
    if (selectable) {
      this._setHandle('coral-table-cellselect');
    }
    else {
      // Clear selection
      this.selected = false;
    }
  }
  
  /** @private */
  _syncAriaSelectedState() {
    this.classList.toggle('is-selected', this.selected);
    this.setAttribute('aria-selected', this.selected);
  }
  
  /** @private */
  _syncSelectHandle() {
    // Check/uncheck the select handle
    const selectHandle = this.querySelector('[coral-table-cellselect]');
    if (selectHandle) {
      if (typeof selectHandle.indeterminate !== 'undefined') {
        selectHandle.indeterminate = false;
      }
      
      if (typeof selectHandle.checked !== 'undefined') {
        selectHandle.checked = this.selected;
      }
    }
  }
  
  /** @ignore */
  static get observedAttributes() {
    return ['selected', '_selectable'];
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_selectable') {
      this._toggleSelectable(value !== null);
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    this.classList.add(CLASSNAME);

    // a11y
    this.setAttribute('role', 'gridcell');
  }
  
  /**
   Triggered before {@link TableCell#selected} is changed.
   
   @typedef {CustomEvent} coral-table-cell:_beforeselectedchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableCell#selected} changed.
   
   @typedef {CustomEvent} coral-table-cell:_selectedchanged
   
   @private
   */
}

export default TableCell;
