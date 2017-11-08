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
import 'coralui-component-icon';
import homeAnchorIcon from '../templates/homeAnchorIcon';

const CLASSNAME = 'coral3-Shell-homeAnchor';

/**
 @class Coral.Shell.HomeAnchor
 @classdesc A Shell Home Anchor component
 @htmltag coral-shell-homeanchor
 @htmlbasetag a
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 */
class ShellHomeAnchor extends ComponentMixin(HTMLAnchorElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      label: this.querySelector('coral-shell-homeanchor-label') || document.createElement('coral-shell-homeanchor-label')
    };
  
    // Create icon by default
    homeAnchorIcon.call(this._elements);
  }
  
  /**
   The label of the anchor.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-shell-homeanchor-label',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Specifies the icon name used in the anchor. See {@link Coral.Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }
  set icon(value) {
    this._elements.icon.icon = value;
  
    // removes the icon element from the DOM.
    if (this.icon === '') {
      this._elements.icon.remove();
    }
    // adds the icon back since it was blown away by textContent
    else if (!this.contains(this._elements.icon)) {
      this.insertBefore(this._elements.icon, this.firstChild);
    }
  }
  
  /**
   The default content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get defaultContentZone() { return this.label; }
  set defaultContentZone(value) { this.label = value; }
  
  get _contentZones() { return {'coral-shell-homeanchor-label': 'label'}; }
  
  /** @ignore */
  static get observedAttributes() { return ['icon']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Create doc fragment
    const fragment = document.createDocumentFragment();
    
    const label = this._elements.label;
  
    // Remove it so we can process children
    if (label.parentNode) {
      this.removeChild(label);
    }
  
    // Move any remaining elements into the label
    while (this.firstChild) {
      const child = this.firstChild;
    
      if (child.nodeType === Node.TEXT_NODE) {
        // Move text elements to the label
        label.appendChild(child);
      }
      else if (child.nodeName === 'CORAL-ICON') {
        if (!fragment.childNodes.length) {
          // Conserve existing icon element to content
          this._elements.icon = child;
          fragment.appendChild(child);
        }
        else {
          // Remove cloned icon
          this.removeChild(child);
        }
      }
      else {
        // Remove anything else
        this.removeChild(child);
      }
    }
    
    // Add fragment back
    this.appendChild(fragment);
    
    // Call label insert
    this.label = label;
  }
}

export default ShellHomeAnchor;
