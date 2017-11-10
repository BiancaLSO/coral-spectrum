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
import {OverlayMixin} from 'coralui-mixin-overlay';
import {DragAction} from 'coralui-dragaction';
import base from '../templates/base';
import {commons, transform, validate} from 'coralui-util';
import 'coralui-component-button';

/**
 Enumeration for {@link Dialog} closable options.
 
 @typedef {Object} DialogClosableEnum
 
 @property {String} ON
 Show a close button on the dialog and close the dialog when clicked.
 @property {String} OFF
 Do not show a close button. Elements with the <code>coral-close</code> attribute will still close the dialog.
 */
const closable = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link Dialog} keyboard interaction options.
 
 @typedef {Object} DialogInteractionEnum
 
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
 Enumeration for {@link Dialog} variants.
 
 @typedef {Object} DialogVariantEnum
 
 @property {String} DEFAULT
 A dialog with the default, gray header and no icon.
 @property {String} ERROR
 A dialog with a red header and warning icon, indicating that an error has occurred.
 @property {String} WARNING
 A dialog with an orange header and warning icon, notifying the user of something important.
 @property {String} SUCCESS
 A dialog with a green header and checkmark icon, indicates to the user that an operation was successful.
 @property {String} HELP
 A dialog with a blue header and question mark icon, provides the user with help.
 @property {String} INFO
 A dialog with a blue header and info icon, informs the user of non-critical information.
 */
const variant = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  HELP: 'help',
  INFO: 'info'
};

/**
 Enumeration for {@link Dialog} backdrops.
 
 @typedef {Object} DialogBackdropEnum
 
 @property {String} NONE
 No backdrop.
 @property {String} MODAL
 A backdrop that hides the dialog when clicked.
 @property {String} STATIC
 A backdrop that does not hide the dialog when clicked.
 */
const backdrop = {
  NONE: 'none',
  MODAL: 'modal',
  STATIC: 'static'
};

/**
 Map of variant -> icon class names
 
 @ignore
 */
const ICON_CLASSES = {
  error: 'alert',
  warning: 'alert',
  success: 'checkCircle',
  help: 'helpCircle',
  info: 'infoCircle'
};

// The dialog's base classname
const CLASSNAME = 'coral3-Dialog';
// Modifier classnames
const FULLSCREEN_CLASSNAME = `${CLASSNAME}--fullscreen`;
const EMPTY_BACKDROP_CLASSNAME = `${CLASSNAME}--backdropNone`;

// A string of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Dialog
 @classdesc A Dialog component that supports various use cases with custom content.
 @htmltag coral-dialog
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {OverlayMixin}
 */
class Dialog extends OverlayMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = commons.extend(this._elements, {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-dialog-header') || document.createElement('coral-dialog-header'),
      content: this.querySelector('coral-dialog-content') || document.createElement('coral-dialog-content'),
      footer: this.querySelector('coral-dialog-footer') || document.createElement('coral-dialog-footer')
    });
    base.call(this._elements);

    // Events
    this._delegateEvents({
      'click [coral-close]': '_handleCloseClick',

      // Since we cover the backdrop with ourself for positioning purposes, this is implemented as a click listener
      // instead of using backdropClickedCallback
      'click': '_handleClick',

      // Handle resize events
      'global:resize': 'center',

      'global:key:escape': '_handleEscape'
    });

    // Override defaults from Overlay
    this._trapFocus = this.constructor.trapFocus.ON;
    this._returnFocus = this.constructor.returnFocus.ON;
    this._overlayAnimationTime = this.constructor.FADETIME;

    // Always execute in the context of the component
    this._center = this._center.bind(this);
    this._hideHeaderIfEmpty = this._hideHeaderIfEmpty.bind(this);

    // Listen for mutations
    this._headerObserver = new MutationObserver(this._hideHeaderIfEmpty);

    // Watch for changes to the header element's children
    this._observeHeader();
  }
  
  /**
   Whether keyboard interaction is enabled. See {@link DialogInteractionEnum}.
   
   @type {DialogInteractionEnum}
   @default DialogInteractionEnum.ON
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }
  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.ON;
  }
  
  /**
   The dialog header element.
   
   @type {HTMLElement}
   @contentzone
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }
  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-dialog-header',
      insert: function(header) {
        this._elements.headerContent.appendChild(header);
      },
      set: function() {
        // Stop observing the old header and observe the new one
        this._observeHeader();
    
        // Check if header needs to be hidden
        this._hideHeaderIfEmpty();
      }
    });
  }
  
  /**
   The dialog content element.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-dialog-content',
      insert: function(content) {
        // The content should always be before footer
        this._elements.contentZoneTarget.insertBefore(content, this.footer);
      }
    });
  }
  
  /**
   The dialog footer element.
   
   @type {HTMLElement}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }
  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-dialog-footer',
      insert: function(footer) {
        // The footer should always be after content
        this._elements.contentZoneTarget.appendChild(footer);
      }
    });
  }
  
  /**
   The backdrop configuration for this dialog. See {@link DialogBackdropEnum}.
   
   @type {String}
   @default DialogBackdropEnum.MODAL
   @htmlattribute backdrop
   */
  get backdrop() {
    return this._backdrop || backdrop.MODAL;
  }
  set backdrop(value) {
    value = transform.string(value).toLowerCase();
    this._backdrop = validate.enumeration(backdrop)(value) && value || backdrop.MODAL;
  
    const showBackdrop = this._backdrop !== backdrop.NONE;
  
    // We're visible now, so hide or show the modal accordingly
    if (this.open && showBackdrop) {
      this._showBackdrop();
    }
  
    this.classList.toggle(EMPTY_BACKDROP_CLASSNAME, !showBackdrop);
  }
  
  /**
   The dialog's variant. See {@link DialogVariantEnum}.
   
   @type {String}
   @default DialogVariantEnum.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
  
    // Remove all variant classes
    this.classList.remove(...ALL_VARIANT_CLASSES);
  
    if (this._variant === variant.DEFAULT) {
      this._elements.icon.icon = '';
    
      // ARIA
      this.setAttribute('role', 'dialog');
    }
    else {
      this._elements.icon.icon = ICON_CLASSES[this._variant];
    
      // Set new variant class
      // Don't use this._className; use the constant
      // This lets popover get our styles for free
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    
      // ARIA
      this.setAttribute('role', 'alertdialog');
    }
  }
  
  /**
   Whether the dialog should be displayed full screen (without borders or margin).
   
   @type {Boolean}
   @default false
   @htmlattribute fullscreen
   @htmlattributereflected
   */
  get fullscreen() {
    return this._fullscreen || false;
  }
  set fullscreen(value) {
    this._fullscreen = transform.booleanAttr(value);
    this._reflectAttribute('fullscreen', this._fullscreen);
    
    // Fullscreen and movable are not compatible
    if (this._fullscreen) {
      this.movable = false;
  
      this.classList.add(FULLSCREEN_CLASSNAME);
  
      // Remove any positioning that may have been added by centering
      this._elements.wrapper.style.top = '';
      this._elements.wrapper.style.left = '';
      this._elements.wrapper.style.marginLeft = '';
      this._elements.wrapper.style.marginTop = '';
  
      this._elements.closeButton.iconSize = 'S';
    }
    else {
      this.classList.remove(FULLSCREEN_CLASSNAME);
    
      this._elements.closeButton.iconSize = 'XS';
    
      // Recenter the dialog if fullscreen was removed
      this._center();
    }
  }
  
  /**
   Inherited from {@link OverlayMixin#open}.
   */
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
  
    // Ensure we're in the DOM
    if (this.open && document.body.contains(this)) {
      this._openInDOM = true;
      
      // If not child of document.body, we have to move it there
      this._moveToDocumentBody();
      
      // Center immediately during sync method. Don't invoke center() directly, as that would wait a frame
      this._center();
    
      // Show the backdrop, if necessary
      if (this.backdrop !== backdrop.NONE) {
        this._showBackdrop();
      }
      
      // Handles what to focus based on focusOnShow
      this._handleFocus();
    }
  }
  
  /**
   The dialog's icon.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon;
  }
  set icon(value) {
    this._elements.icon = value;
  }
  
  /**
   Whether the dialog should have a close button. See {@link DialogClosableEnum}.
   
   @type {String}
   @default DialogClosableEnum.OFF
   @htmlattribute closable
   @htmlattributereflected
   */
  get closable() {
    return this._closable || closable.OFF;
  }
  set closable(value) {
    value = transform.string(value).toLowerCase();
    this._closable = validate.enumeration(closable)(value) && value || closable.OFF;
    this._reflectAttribute('closable', this._closable);
  
    this.classList.toggle(`${CLASSNAME}--closable`, this._closable === closable.ON);
    this._elements.closeButton.style.display = this.closable === closable.ON ? '' : 'none';
  }
  
  /**
   Whether the dialog can moved around by dragging the title.
   
   @type {Boolean}
   @default false
   @htmlattribute movable
   @htmlattributereflected
   */
  get movable() {
    return this._movable || false;
  }
  set movable(value) {
    this._movable = transform.booleanAttr(value);
    this._reflectAttribute('movable', this._movable);
  
    // Movable and fullscreen are not compatible
    if (this._movable) {
      this.fullscreen = false;
    }
  
    const wrapper = this._elements.wrapper;
  
    if (this._movable) {
      const dragAction = new DragAction(wrapper);
      dragAction.handle = this._elements.headerWrapper;
    }
    else {
      // Restore default
      wrapper.style.width = '';
    
      if (wrapper.dragAction) {
        wrapper.dragAction.destroy();
      }
    }
    
    // Recenter the dialog once it's not movable anymore
    this._center();
  }
  
  /** @ignore */
  _observeHeader() {
    if (this._headerObserver) {
      this._headerObserver.disconnect();
      this._headerObserver.observe(this._elements.header, {
        // Catch changes to childList
        childList: true,
        // Catch changes to textContent
        characterData: true,
        // Monitor any child node
        subtree: true
      });
    }
  }
  
  /**
   Hide the header wrapper if the header content zone is empty.
   @ignore
   */
  _hideHeaderIfEmpty() {
    const header = this._elements.header;
    const headerContent = this._elements.headerContent;
  
    // If it's empty and has no non-textnode children, hide the header
    const hiddenValue = header.children.length === 0 || header.textContent.replace(/\s*/g, '') === '';
  
    if (hiddenValue) {
      headerContent.removeAttribute('role');
      headerContent.removeAttribute('aria-level');
    }
    else {
      headerContent.setAttribute('role', 'heading');
      headerContent.setAttribute('aria-level', '2');
    }
  }
  
  /** @ignore */
  _handleEscape() {
    // When escape is pressed, hide ourselves
    if (this.interaction === interaction.ON && this.open && this._isTopOverlay()) {
      this.open = false;
    }
  }
  
  /**
   @ignore
   @todo maybe this should be mixin or something
   */
  _handleCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.open = false;
      event.stopPropagation();
    }
  }
  
  /** @ignore */
  _handleClick(event) {
    // When we're modal, we close when our outer area (over the backdrop) is clicked
    if (event.target === this && this.backdrop === backdrop.MODAL && this._isTopOverlay()) {
      this.open = false;
    }
  }
  
  /** @ignore */
  _moveToDocumentBody() {
    if (this.parentNode !== document.body) {
      document.body.insertBefore(this, document.body.lastElementChild);
    }
  }
  
  /** @private */
  _center() {
    const wrapper = this._elements.wrapper;
    
    // Don't do anything if the wrapper is not ready yet
    if (wrapper.parentNode !== this) {
      return;
    }
  
    const currentStyle = this.style.display;
  
    // Set display to block so we can measure
    this.style.display = 'block';
  
    // Change to absolute so we can calculate correctly. Shove it to the top left so we can calculate width
    // correctly
    wrapper.style.position = 'absolute';
    wrapper.style.left = 0;
    wrapper.style.top = 0;
  
    // Calculate the size
    const width = wrapper.offsetWidth;
    const height = wrapper.offsetHeight;
  
    // Only position vertically if we have to use 20px buffers to match the margin from CSS
    if (height < window.innerHeight - 20) {
      // Set position
      wrapper.style.top = '50%';
      wrapper.style.marginTop = `${-(height / 2)}px`;
    }
    else {
      // Allow vertical scroll
      wrapper.style.top = '';
      wrapper.style.marginTop = '';
    }
  
    // Take the whole screen if fullscreen
    if (this.fullscreen) {
      wrapper.style.marginLeft = '';
      wrapper.style.left = '';
    }
    else {
      wrapper.style.marginLeft = `${-(width / 2)}px`;
      wrapper.style.left = '50%';
    }
    
    if (this.movable) {
      // Make sure all components in the dialog are defined before setting a fix width
      commons.ready(this, () => {
        // Prevents the dialog from overflowing horizontally
        wrapper.style.width = `${wrapper.getBoundingClientRect().width}px`;
      });
    }
  
    // Reset display to previous style
    this.style.display = currentStyle;
  
    // Mark that we're centered
    this._centered = true;
  }
  
  /**
   Centers the dialog in the middle of the screen.
   
   @returns {Dialog} this, chainable.
   */
  center() {
    // We're already centered in fullscreen mode
    if (this.fullscreen) {
      return;
    }
  
    if (this._centered) {
      // If we've already centered or never centered before, wait a frame
      window.requestAnimationFrame(this._center);
    }
  
    // Mark that we're not currently centered
    this._centered = false;
  
    return this;
  }
  
  get _contentZones() {
    return {
      'coral-dialog-header': 'header',
      'coral-dialog-content': 'content',
      'coral-dialog-footer': 'footer'
    };
  }
  
  /**
   Returns {@link Dialog} variants.
   
   @return {DialogVariantEnum}
   */
  static get variant() { return variant; }
  
  /**
   Returns {@link Dialog} backdrops.
   
   @return {DialogBackdropEnum}
   */
  static get backdrop() { return backdrop; }
  
  /**
   Returns {@link Dialog} close options.
   
   @return {DialogClosableEnum}
   */
  static get closable() { return closable; }
  
  /**
   Returns {@link Dialog} interaction options.
   
   @return {DialogInteractionEnum}
   */
  static get interaction() { return interaction; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'interaction',
      'backdrop',
      'variant',
      'fullscreen',
      'icon',
      'closable',
      'movable'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);

    this.style.display = 'none';

    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    if (!this._backdrop) { this.backdrop = backdrop.MODAL; }
    if (!this._closable) { this.closable = closable.OFF; }
    if (!this._interaction) { this.interaction = interaction.ON; }

    // Fetch the content zones
    const header = this._elements.header;
    const content = this._elements.content;
    const footer = this._elements.footer;

    // Verify if a content zone is provided
    const contentZoneProvided = this.contains(content) && content || this.contains(footer) && footer || this.contains(header) && header;

    // Verify if the internal wrapper exists
    let wrapper = this.querySelector('.coral3-Dialog-wrapper');

    // Case where the dialog was rendered already - cloneNode support
    if (wrapper) {
      // Remove tab captures
      Array.prototype.filter.call(this.children, (child) => child.hasAttribute('coral-tabcapture')).forEach((tabCapture) => {
        this.removeChild(tabCapture);
      }, this);

      // Assign internal elements
      this._elements.headerWrapper = this.querySelector('.coral3-Dialog-header');
      this._elements.headerContent = this.querySelector('.coral3-Dialog-title');
      this._elements.closeButton = this.querySelector('.coral3-Dialog-closeButton');
      this._elements.icon = this.querySelector('.coral3-Dialog-typeIcon');

      this._elements.wrapper = wrapper;
      // We can assume content zones are created if wrapper is already there
      this._elements.contentZoneTarget = contentZoneProvided.parentNode;
    }
    // Case where the dialog needs to be rendered
    else {
      // Create default wrapper
      wrapper = this._elements.wrapper;

      // Create default header wrapper
      const headerWrapper = this._elements.headerWrapper;

      // Case where the dialog needs to be rendered and content zones are provided
      if (contentZoneProvided) {
        // Check if user wrapper is provided
        if (contentZoneProvided.parentNode === this) {
          // Content zone target defaults to default wrapper if no user wrapper element is provided
          this._elements.contentZoneTarget = wrapper;
        }
        else {
          // Content zone target defaults to user wrapper element if provided
          this._elements.contentZoneTarget = contentZoneProvided.parentNode;
        }
        
        // Move everything in the wrapper
        while (this.firstChild) {
          wrapper.appendChild(this.firstChild);
        }

        // Add the dialog header before the content
        this._elements.contentZoneTarget.insertBefore(headerWrapper, content);
      }
      // Case where the dialog needs to be rendered and content zones need to be created
      else {
        // Default content zone target is wrapper
        this._elements.contentZoneTarget = wrapper;

        // Move everything in the "content" content zone
        while (this.firstChild) {
          content.appendChild(this.firstChild);
        }

        // Add the content zones in the wrapper
        wrapper.appendChild(headerWrapper);
        wrapper.appendChild(content);
        wrapper.appendChild(footer);
      }

      // Add the wrapper to the dialog
      this.appendChild(wrapper);
    }

    // Assign content zones
    this.header = header;
    this.content = content;
    this.footer = footer;
  
    // Add the Overlay coral-tabcapture elements at the end
    super.connectedCallback();
  
    // In case it was opened but not in the DOM yet
    if (this.open && !this._openInDOM) {
      this.open = this.open;
    }
  }
}

export default Dialog;
