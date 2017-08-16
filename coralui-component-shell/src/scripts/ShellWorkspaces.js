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
import {SelectableCollection} from 'coralui-collection';

const CLASSNAME = 'coral3-Shell-workspaces';

/**
 @class Coral.Shell.Workspaces
 @classdesc A Shell Workspaces component
 @htmltag coral-shell-workspaces
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ShellWorkspaces extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      'key:down [is="coral-shell-workspace"]': '_focusNextItem',
      'key:right [is="coral-shell-workspace"]': '_focusNextItem',
      'key:left [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:up [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pageup [is="coral-shell-workspace"]': '_focusPreviousItem',
      'key:pagedown [is="coral-shell-workspace"]': '_focusNextItem',
      'key:home [is="coral-shell-workspace"]': '_focusFirstItem',
      'key:end [is="coral-shell-workspace"]': '_focusLastItem',
      // private
      'coral-shell-workspace:_selectedchanged': '_onItemSelectedChanged'
    });
  
    // Used for eventing
    this._oldSelection = null;
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The item collection.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Shell.Workspaces#
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-shell-workspace',
        itemBaseTagName: 'a',
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection
      });
    }
  
    return this._items;
  }
  
  /**
   Returns the selected workspace.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.Shell.Workspaces#
   */
  get selectedItem() {
    return this.items._getLastSelected();
  }
  
  /** @private */
  _validateSelection(item) {
    // gets the current selection
    const selection = this.items._getAllSelected();
    const selectionCount = selection.length;
    
    // if no item is currently selected, we need to find a candidate
    if (selectionCount === 0) {
      // gets the first candidate for selection
      const selectable = this.items._getFirstSelectable();
      
      if (selectable) {
        selectable.setAttribute('selected', '');
      }
    }
    // more items are selected, so we find a single item and deselect everything else
    else if (selectionCount > 1) {
      // By default, the last one stays selected
      item = item || selection[selection.length - 1];
      
      for (let i = 0; i < selectionCount; i++) {
        if (selection[i] !== item) {
          // Don't trigger change events
          this._preventTriggeringEvents = true;
          selection[i].removeAttribute('selected');
        }
      }
      
      // We can trigger change events again
      this._preventTriggeringEvents = false;
    }
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItem = this.selectedItem;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && selectedItem !== oldSelection) {
      this.trigger('coral-shell-workspaces:change', {
        oldSelection: oldSelection,
        selection: selectedItem
      });
      
      this._oldSelection = selectedItem;
    }
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._validateSelection(item);
  }
  
  /**
   Returns true if the event is at the matched target.
   @todo this should be moved to Coral.Component
   
   @private
   */
  _eventIsAtTarget(event) {
    const target = event.target;
    const listItem = event.matchedTarget;
  
    const isAtTarget = (target === listItem);
  
    if (isAtTarget) {
      // Don't let arrow keys etc scroll the page
      event.preventDefault();
      event.stopPropagation();
    }
  
    return isAtTarget;
  }
  
  /** @private */
  _focusNextItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    if (target.nextElementSibling) {
      target.nextElementSibling.focus();
    }
    else {
      this.items.first().focus();
    }
  }
  
  /** @private */
  _focusPreviousItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    const target = event.matchedTarget;
    if (target.previousElementSibling) {
      target.previousElementSibling.focus();
    }
    else {
      this.items.last().focus();
    }
  }
  
  /** @private */
  _focusFirstItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
    
    this.items.first().focus();
  }
  
  /** @private */
  _focusLastItem(event) {
    if (!this._eventIsAtTarget(event)) {
      return;
    }
  
    this.items.last().focus();
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
  
    this._oldSelection = this.selectedItem;
  }
}

export default ShellWorkspaces;
