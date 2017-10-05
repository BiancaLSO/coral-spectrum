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
import {transform} from 'coralui-util';

const CLASSNAME = 'coral3-Panel';

/**
 @class Coral.Panel
 @classdesc A Panel component
 @htmltag coral-panel
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Panel extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Templates
    this._elements = {
      content: this.querySelector('coral-panel-content') || document.createElement('coral-panel-content')
    };
  }
  
  /**
   The content of the panel.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Panel#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-panel-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Whether the item is selected. When true, the item will appear as the active element in the PanelStack. The item
   must be a child of a PanelStack before this property is set to true. This property cannot be programmatically set
   to false.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Panel#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected);
    this.setAttribute('aria-hidden', !this.selected);
    
    this.trigger('coral-panel:_selectedchanged');
  }
  
  get defaultContentZone() { return this.content; }
  set defaultContentZone(value) { this.content = value; }
  get _contentZones() { return {'coral-panel-content': 'content'}; }
  
  static get observedAttributes() {
    return ['selected'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // adds the role to support accessibility
    this.setAttribute('role', 'tabpanel');
  
    // Fetch the content zone elements
    const content = this._elements.content;
    
    // Remove it so we can process children
    content.remove();
  
    // Finally, move any remaining elements into the content sub-component
    while (this.firstChild) {
      content.appendChild(this.firstChild);
    }
  
    // Assign the content zone so the insert function will be called
    this.content = content;
  }
}

export default Panel;
