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
import 'coralui-component-wait';
import loadIndicator from '../templates/loadIndicator';
import {transform} from 'coralui-util';

const KEYPRESS_TIMEOUT_DURATION = 1000;

/**
 The distance, in pixels, from the bottom of the SelectList at which we trigger a scrollbottom event. For example, a
 value of 50 would indicate a scrollbottom event should be triggered when the user scrolls to within 50 pixels of the
 bottom.
 
 @type {Number}
 @ignore
 */
const SCROLL_BOTTOM_THRESHOLD = 50;

/**
 The number of milliseconds for which scroll events should be debounced.
 
 @type {Number}
 @ignore
 */
const SCROLL_DEBOUNCE = 100;

/** @ignore */
const ITEM_TAG_NAME = 'coral-selectlist-item';

/** @ignore */
const GROUP_TAG_NAME = 'coral-selectlist-group';

const CLASSNAME = 'coral3-SelectList';

/**
 @class Coral.SelectList
 @classdesc A SelectList component
 @htmltag coral-selectlist
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class SelectList extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'scroll': '_onScroll',
      'capture:focus': '_onFocus',
      'capture:blur': '_onBlur',
  
      'click coral-selectlist-item': '_onItemClick',
  
      'capture:mouseenter coral-selectlist-item': '_onItemMouseEnter',
      'capture:mouseleave coral-selectlist-item': '_onItemMouseLeave',
  
      'key:space coral-selectlist-item': '_onToggleItemKey',
      'key:return coral-selectlist-item': '_onToggleItemKey',
      'key:pageup coral-selectlist-item': '_focusPreviousItem',
      'key:left coral-selectlist-item': '_focusPreviousItem',
      'key:up coral-selectlist-item': '_focusPreviousItem',
      'key:pagedown coral-selectlist-item': '_focusNextItem',
      'key:right coral-selectlist-item': '_focusNextItem',
      'key:down coral-selectlist-item': '_focusNextItem',
      'key:home coral-selectlist-item': '_onHomeKey',
      'key:end coral-selectlist-item': '_onEndKey',
      'keypress coral-selectlist-item': '_onKeyPress',
      
      // private
      'coral-selectlist-item:_selectedchanged': '_onItemSelectedChanged'
    });
    
    // Templates
    this._elements = {};
    loadIndicator.call(this._elements);
    
    // Used for eventing
    this._oldSelection = [];
  
    // Used for interaction
    this._keypressTimeoutID = null;
    this._keypressSearchString = '';
    
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the {@link Coral.SelectList.Group} elements that the
   SelectList contains. This includes items nested inside groups. To manage items contained within a specific
   group, see {@link Coral.SelectList.Group#items}.
   
   See {@link Coral.Collection} for more details regarding collection APIs.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.SelectList#
   */
  get groups() {
    // just init on demand
    if (!this._groups) {
      this._groups = new SelectableCollection({
        host: this,
        itemTagName: GROUP_TAG_NAME,
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection,
      });
    }
    return this._groups;
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.SelectList#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: ITEM_TAG_NAME,
        onItemAdded: this._validateSelection,
        onItemRemoved: this._validateSelection,
      });
    }
    return this._items;
  }
  
  /**
   The selected item in the SelectList.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.SelectList#
   */
  get selectedItem() {
    return this.items._getAllSelected()[0] || null;
  }
  
  /**
   The selected items of the SelectList.
   
   @type {Array.<HTMLElement>}
   @readonly
   @memberof Coral.SelectList#
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }
  
  /**
   Indicates whether the SelectList accepts multiple selected items.
   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   @memberof Coral.SelectList#
   */
  get multiple() {
    return this._multiple || false;
  }
  set multiple(value) {
    this._multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this._multiple);
    
    this.setAttribute('aria-multiselectable', this._multiple);
    
    this._validateSelection();
  }
  
  /**
   Whether items are being loaded for the SelectList. Toggling this merely shows or hides a loading indicator.
   
   @default false
   @type {Boolean}
   @htmlattribute loading
   @htmlattributereflected
   @memberof Coral.SelectList#
   */
  get loading() {
    return this._loading || false;
  }
  set loading(value) {
    this._loading = transform.booleanAttr(value);
    this._reflectAttribute('loading', this._loading);
  
    const loadIndicator = this._elements.loadIndicator;
  
    if (this.loading) {
      // we decide first if we need to scroll to the bottom since adding the load will change the dimentions
      const scrollToBottom = this.scrollTop >= this.scrollHeight - this.clientHeight;
    
      // inserts the item at the end
      this.appendChild(loadIndicator);
    
      // we make the load indicator visible
      if (scrollToBottom) {
        this.scrollTop = this.scrollHeight;
      }
    }
    else {
      loadIndicator.remove();
    }
  }
  
  /** @private **/
  get _tabTarget() {
    return this.__tabTarget || null;
  }
  set _tabTarget(value) {
    this.__tabTarget = value;
    
    // Set all but the current set _tabTarget to not be a tab target:
    this.items.getAll().forEach(function(item) {
      item._isTabTarget = item === value;
    });
  }
  
  /** @private */
  _toggleItemSelection(item) {
    if (item) {
      const beforeChangeEvent = this.trigger('coral-selectlist:beforechange', {
        item: item
      });
  
      if (!beforeChangeEvent.defaultPrevented) {
        item[item.hasAttribute('selected') ? 'removeAttribute' : 'setAttribute']('selected', '');
      }
    }
  }
  
  /** @private */
  _onItemMouseEnter(event) {
    if (event.target.disabled) {
      return;
    }
  
    // if the component already has the focus, we can change the activeElement.
    if (this.classList.contains('is-focused')) {
      this._focusItem(event.target);
    }
    // since we cannot give focus to the item, we mark it as highlighted
    else {
      event.target.classList.add('is-highlighted');
    }
  }
  
  /** @private */
  _onItemMouseLeave(event) {
    event.target.classList.remove('is-highlighted');
  }
  
  /** @private */
  _onFocus() {
    this.classList.add('is-focused');
  }
  
  /** @private */
  _onBlur() {
    // required otherwise the latest item that had the focus would get it again instead of the selected item
    this._resetTabTarget();
    this.classList.remove('is-focused');
  }
  
  /** @private */
  _onItemClick(event) {
    event.preventDefault();
    event.stopPropagation();
  
    const item = event.matchedTarget;
    this._toggleItemSelection(item);
    this._focusItem(item);
  }
  
  /** @private */
  _focusItem(item) {
    if (item) {
      item.focus();
    }
    
    this._tabTarget = item;
  }
  
  /** @private */
  _onToggleItemKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const item = event.target;
    
    this._toggleItemSelection(item);
    this._focusItem(item);
  }
  
  /** @private */
  _focusPreviousItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getPreviousSelectable(event.target));
  }
  
  /** @private */
  _focusNextItem(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getNextSelectable(event.target));
  }
  
  /** @private */
  _onHomeKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getFirstSelectable());
  }
  
  /** @private */
  _onEndKey(event) {
    event.preventDefault();
    event.stopPropagation();
    
    this._focusItem(this.items._getLastSelectable());
  }
  
  /**
   Handles keypress event for alphanumeric search.
   
   @param {KeyboardEvent} event
   The keyboard event.
   @private
   */
  _onKeyPress(event) {
    const self = this;
    // The string entered when the key was pressed
    const newString = String.fromCharCode(event.which);
    
    // Clear the timeout before the _keypressSearchString is cleared
    window.clearTimeout(this._keypressTimeoutID);
    
    // If the character entered does not match the last character entered, append it to the _keypressSearchString
    if (newString !== this._keypressSearchString) {
      this._keypressSearchString += newString;
    }
    
    // Set a timeout so that _keypressSearchString is cleared after 1 second
    this._keypressTimeoutID = window.setTimeout(function() {
      self._keypressSearchString = '';
    }, KEYPRESS_TIMEOUT_DURATION);
    
    // Search within selectable items
    const selectableItems = this.items._getSelectableItems();
    
    // Remember the index of the focused item within the array of selectable items
    const currentIndex = selectableItems.index(this._tabTarget);
    
    this._keypressSearchString = this._keypressSearchString.trim().toLowerCase();
    
    let start;
    // If the currentIndex is -1, meaning no item has focus, start from the beginning
    if (currentIndex === -1) {
      start = 0;
    }
    else if (this._keypressSearchString.length === 1) {
      // Otherwise, if there is only one character to compare, start comparing from the next item after the currently
      // focused item. This allows us to iterate through items beginning with the same character
      start = currentIndex + 1;
    }
    else {
      start = currentIndex;
    }
    
    let newFocusItem;
    let comparison;
    let item;
    
    // Compare _keypressSearchString against item text until a match is found
    for (let i = start; i < selectableItems.length; i++) {
      item = selectableItems[i];
      comparison = item.text().trim().toLowerCase();
      if (comparison.indexOf(this._keypressSearchString) === 0) {
        newFocusItem = item;
        break;
      }
    }
    
    // If no match is found, continue searching for a match starting from the top
    if (!newFocusItem) {
      for (let j = 0; j < start; j++) {
        item = selectableItems[i];
        comparison = item.text().trim().toLowerCase();
        if (comparison.indexOf(this._keypressSearchString) === 0) {
          newFocusItem = item;
          break;
        }
      }
    }
    
    // If a match has been found, focus the matched item
    if (newFocusItem !== undefined) {
      this._focusItem(newFocusItem);
    }
  }

  /**
   Determine what item should get focus (if any) when the user tries to tab into the SelectList. This should be the
   first selected item, or the first selectable item otherwise. When neither is available, it cannot be tabbed into
   the SelectList.
   
   @private
   */
  _resetTabTarget() {
    if (!this._resetTabTargetScheduled) {
      this._resetTabTargetScheduled = true;
    
      window.requestAnimationFrame(function() {
        this._resetTabTargetScheduled = false;
      
        // since hidden items cannot have focus, we need to make sure the tabTarget is not hidden
        const selectedItems = this.items.getAll().filter(function(item) {
          return item.hasAttribute('selected') && !item.hasAttribute('disabled') && !item.hasAttribute('hidden');
        });
        this._tabTarget = selectedItems.length ? selectedItems[0] : this.items._getFirstSelectable();
      }.bind(this));
    }
  }
  
  /** @private */
  _onScroll() {
    window.clearTimeout(this._scrollTimeout);
    this._scrollTimeout = window.setTimeout(this._onDebouncedScroll, SCROLL_DEBOUNCE);
  }
  
  /**
   @fires Coral.SelectList#coral-selectlist:scrollbottom
   
   @private
   */
  _onDebouncedScroll() {
    if (this.scrollTop >= this.scrollHeight - this.clientHeight - SCROLL_BOTTOM_THRESHOLD) {
      this.trigger('coral-selectlist:scrollbottom');
    }
  }
  
  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();
    
    this._validateSelection(event.target);
  }
  
  /** @private */
  _validateSelection(item) {
    let selectedItems = this.selectedItems;
    
    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
      item = item || selectedItems[selectedItems.length - 1];
      
      if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
        selectedItems.forEach((selectedItem) => {
          if (selectedItem !== item) {
            // Don't trigger change events
            this._preventTriggeringEvents = true;
            selectedItem.removeAttribute('selected');
          }
        }, this);
        
        // We can trigger change events again
        this._preventTriggeringEvents = false;
      }
    }
    
    this._resetTabTarget();
    
    this._triggerChangeEvent();
  }
  
  /** @private */
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    const oldSelection = this._oldSelection;
    
    if (!this._preventTriggeringEvents && this._arraysAreDifferent(selectedItems, oldSelection)) {
      // We differentiate whether multiple is on or off and return an array or HTMLElement respectively
      if (this.multiple) {
        this.trigger('coral-selectlist:change', {
          oldSelection: oldSelection,
          selection: selectedItems
        });
      }
      else {
        // Return all items if we just switched from multiple=true to multiple=false and we had >1 selected items
        this.trigger('coral-selectlist:change', {
          oldSelection: oldSelection.length > 1 ? oldSelection : (oldSelection[0] || null),
          selection: selectedItems[0] || null
        });
      }
      
      this._oldSelection = selectedItems;
    }
  }
  
  /** @private */
  _arraysAreDifferent(selection, oldSelection) {
    let diff = [];
    
    if (oldSelection.length === selection.length) {
      diff = oldSelection.filter(function(item) {
        return selection.indexOf(item) === -1;
      });
    }
    
    // since we guarantee that they are arrays, we can start by comparing their size
    return oldSelection.length !== selection.length || diff.length !== 0;
  }
  
  /** @private */
  focus() {
    // we reset the focus tab and set focus on the right item. This is required in the case that the user had already
    // focus on the an item and he comes back, the focus should be recalculated.
    this._resetTabTarget();
    this._focusItem(this._tabTarget);
  }
  
  static get observedAttributes() {
    return ['loading', 'multiple'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    this.setAttribute('role', 'listbox');
    // we correctly bind the scroll event
    this._onDebouncedScroll = this._onDebouncedScroll.bind(this);
    
    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;
    
    this._oldSelection = this.selectedItems;
  }
  
  /**
   Triggered when the user scrolls to near the bottom of the list. This can be useful for when additional items can
   be loaded asynchronously (i.e., infinite scrolling).
   
   @event Coral.SelectList#coral-selectlist:scrollbottom
   
   @param {Object} event
   Event object.
   */
  
  /**
   Triggered before the selected item is changed on user interaction. Can be used to cancel selection.
   
   @event Coral.TabList#coral-selectlist:change
   
   @param {Object} event Event object
   @param {Object} event.detail
   @param {HTMLElement} event.detail.item
   The selected item.
   */
  
  /**
   Triggered when the selected item has changed.
   
   @event Coral.TabList#coral-selectlist:change
   
   @param {Object} event Event object
   @param {Object} event.detail
   @param {HTMLElement} event.detail.oldSelection
   The prior selected item(s).
   @param {HTMLElement} event.detail.selection
   The newly selected item(s).
   */
}

export default SelectList;
