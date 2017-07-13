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

import 'coralui-component-icon';
import item from '../templates/item';
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-BasicList-item';

/**
 @mixin List item
 @classdesc The base element for list item components
 */
const ListItem = (superClass) => class extends superClass {
  constructor() {
    super();
    
    // Templates
    this._elements = {
      // Fetch or create the content zone element
      content: this.querySelector('coral-list-item-content') || document.createElement('coral-list-item-content')
    };
    item.call(this._elements);
  }
  
  /**
   The content of the help item.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.List.Item#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-list-item-content',
      insert: function(content) {
        this._elements.contentContainer.appendChild(content);
      }
    });
  }

  /**
   Whether this item is disabled.
   
   @default false
   @type {Boolean}
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.AnchorList.Item#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    transform.reflect(this, 'disabled', this._disabled);
  
    this.setAttribute('aria-disabled', this._disabled);
  }
  
  /**
   The icon to display.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @memberof Coral.Button#
   
   @see {@link Coral.Icon}
   */
  get icon() {
    return this._elements.icon.icon;
  }
  set icon(value) {
    this._elements.icon.icon = value;
  
    // Hide if no icon
    this._elements.icon.hidden = this._elements.icon.icon === '';
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-list-item-content': 'content'};}

  static get observedAttributes() {return ['disabled', 'icon'];}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // The attribute that makes different types of list items co-exist
    // This is also used for event delegation
    this.setAttribute('coral-list-item', '');
  
    // Create a temporary fragment
    const fragment = document.createDocumentFragment();
  
    // Render the template
    fragment.appendChild(this._elements.icon);
    fragment.appendChild(this._elements.outerContainer);
  
    // Fetch or create the content content zone element
    const content = this._elements.content;
  
    // Cleanup template elements (supporting cloneNode)
    Array.prototype.filter.call(this.children, function(child) {
      return (child.hasAttribute('handle'));
    }).forEach(function(handleItem) {
      this.removeChild(handleItem);
    }.bind(this));
  
    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      content.appendChild(this.firstChild);
    }
  
    // Assign the content zones, moving them into place in the process
    this.content = content;
  
    // Add the frag to the component
    this.appendChild(fragment);
  }
};

export default ListItem;
