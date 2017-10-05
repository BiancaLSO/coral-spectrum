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
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import ActionBarContainer from './ActionBarContainerMixin';

const CLASSNAME = 'coral3-ActionBar-primary';

/**
 @class Coral.ActionBar.Primary
 @classdesc An ActionBar primary component
 @htmltag coral-actionbar-primary
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ActionBarPrimary extends ActionBarContainer(Component(HTMLElement)) {
  /** @ignore */
  _returnElementsFromPopover() {
    let item = null;
    let wrappedItem = null;
    
    for (let i = 0; i < this._itemsInPopover.length; i++) {
      item = this._itemsInPopover[i];
      
      // remove tabindex again
      wrappedItem = getFirstSelectableWrappedItem(item);
      if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
        wrappedItem.setAttribute('tabindex', -1);
      }
      
      this.insertBefore(item, this._elements.moreButton);
    }
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    // add the button to the left/primary contentzone
    this.appendChild(this._elements.moreButton);
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarPrimary;
