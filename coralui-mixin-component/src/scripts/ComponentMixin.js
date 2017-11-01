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

import {Vent} from 'coralui-externals';
import {commons, Keys, keys, events} from 'coralui-util';

// Used to split events by type/target
const delegateEventSplitter = /^(\S+)\s*(.*)$/;

/**
 Return the method corresponding to the method name or the function, if passed.
 @ignore
 */
const getListenerFromMethodNameOrFunction = function(obj, eventName, methodNameOrFunction) {
  // Try to get the method
  if (typeof methodNameOrFunction === 'function') {
    return methodNameOrFunction;
  }
  else if (typeof methodNameOrFunction === 'string') {
    if (!obj[methodNameOrFunction]) {
      throw new Error(`Coral.Component: Unable to add ${eventName} listener for ${obj.toString()}, method
      ${methodNameOrFunction} not found`);
    }
    
    const listener = obj[methodNameOrFunction];
    
    if (typeof listener !== 'function') {
      throw new Error(`Coral.Component: Unable to add ${eventName} listener for ${obj.toString()}, listener is a
      ${(typeof listener)} but should be a function`);
    }
    
    return listener;
  }
  else if (methodNameOrFunction) {
    // If we're passed something that's truthy (like an object), but it's not a valid method name or a function, get
    // angry
    throw new Error(`Coral.Component: Unable to add ${eventName} listener for ${obj.toString()}, ${methodNameOrFunction}
    is neither a method name or a function`);
  }
  
  return null;
};

/**
 Add local event and key combo listeners for this component, store global event/key combo listeners for later.
 @ignore
 */
const delegateEvents = function() {
  /*
   Add listeners to new event
   - Include in hash
   Add listeners to existing event
   - Override method and use super
   Remove existing event
   - Pass null
   */
  let match;
  let eventName;
  let eventInfo;
  let listener;
  let selector;
  let elements;
  let isGlobal;
  let isKey;
  let isResize;
  let isCapture;
  
  for (eventInfo in this._events) {
    listener = this._events[eventInfo];
    
    // Extract the event name and the selector
    match = eventInfo.match(delegateEventSplitter);
    eventName = `${match[1]}.CoralComponent`;
    selector = match[2];
    
    if (selector === '') {
      // instead of null because the key module checks for undefined
      selector = undefined;
    }
    
    // Try to get the method corresponding to the value in the map
    listener = getListenerFromMethodNameOrFunction(this, eventName, listener);
    
    if (listener) {
      // Always execute in the context of the object
      // @todo is this necessary? this should be correct anyway
      listener = listener.bind(this);
      
      // Check if the listener is on the window
      isGlobal = eventName.indexOf('global:') === 0;
      if (isGlobal) {
        eventName = eventName.substr(7);
      }
      
      // Check if the listener is a capture listener
      isCapture = eventName.indexOf('capture:') === 0;
      if (isCapture) {
        // @todo Limitation: It should be possible to do capture:global:, but it isn't
        eventName = eventName.substr(8);
      }
      
      // Check if the listener is a key listener
      isKey = eventName.indexOf('key:') === 0;
      if (isKey) {
        if (isCapture) {
          throw new Error('Coral.Keys does not currently support listening to key events with capture');
        }
        eventName = eventName.substr(4);
      }
      
      // Check if the listener is a resize listener
      isResize = eventName.indexOf('resize') === 0;
      if (isResize) {
        if (isCapture) {
          throw new Error('Coral.commons.addResizeListener does not currently support listening to resize event with capture');
        }
      }
      
      if (isGlobal) {
        // Store for adding/removal
        if (isKey) {
          this._globalKeys = this._globalKeys || [];
          this._globalKeys.push({
            keyCombo: eventName,
            selector: selector,
            listener: listener
          });
        }
        else {
          this._globalEvents = this._globalEvents || [];
          this._globalEvents.push({eventName, selector, listener, isCapture});
        }
      }
      // Events on the element itself
      else if (isKey) {
        // Create the keys instance only if its needed
        this._keys = this._keys || new Keys(this, {
          // The filter function for keyboard events.
          filter: this._filterKeys,
          // Execute key listeners in the context of the element
          context: this
        });
    
        // Add listener locally
        this._keys.on(eventName, selector, listener);
      }
      else if (isResize) {
        if (selector) {
          elements = document.querySelectorAll(selector);
          for (let i = 0; i < elements.length; ++i) {
            commons.addResizeListener(elements[i], listener);
          }
        }
        else {
          commons.addResizeListener(this, listener);
        }
      }
      else {
        this._vent.on(eventName, selector, listener, isCapture);
      }
    }
  }
};

/**
 Attach global event listeners for this component.
 @ignore
 */
const delegateGlobalEvents = function() {
  let i;
  if (this._globalEvents) {
    // Remove global event listeners
    for (i = 0; i < this._globalEvents.length; i++) {
      const event = this._globalEvents[i];
      events.on(event.eventName, event.selector, event.listener, event.isCapture);
    }
  }
  
  if (this._globalKeys) {
    // Remove global key listeners
    for (i = 0; i < this._globalKeys.length; i++) {
      const key = this._globalKeys[i];
      keys.on(key.keyCombo, key.selector, key.listener);
    }
  }
  
  if (this._keys) {
    this._keys.init(true);
  }
};

/**
 Remove global event listeners for this component.
 @ignore
 */
const undelegateGlobalEvents = function() {
  let i;
  if (this._globalEvents) {
    // Remove global event listeners
    for (i = 0; i < this._globalEvents.length; i++) {
      const event = this._globalEvents[i];
      events.off(event.eventName, event.selector, event.listener, event.isCapture);
    }
  }
  
  if (this._globalKeys) {
    // Remove global key listeners
    for (i = 0; i < this._globalKeys.length; i++) {
      const key = this._globalKeys[i];
      keys.off(key.keyCombo, key.selector, key.listener);
    }
  }
  
  if (this._keys) {
    this._keys.destroy(true);
  }
};

// Used to find upper case characters
const REG_EXP_UPPERCASE = /[A-Z]/g;

/**
 Returns the constructor namespace
 @ignore
 */
const getConstructorName = function(constructor) {
  // Will contain the namespace of the constructor in reversed order
  const constructorName = [];
  // Keep a reference on the passed constructor
  const originalConstructor = constructor;
  
  // Traverses Coral constructors if not already done to set the namespace
  if (!constructor._namespace) {
  
    // Set namespace on Coral constructors until 'constructor' is found
    const find = (obj, constructorToFind) => {
      let found = false;
      const type = typeof obj;
    
      if (obj && type === 'object' || type === 'function')	{
        const subObj = Object.keys(obj);
      
        for (let i = 0; i < subObj.length; i++) {
          const key = subObj[i];
        
          // Components are capitalized
          if (key[0].match(REG_EXP_UPPERCASE) !== null) {
          
            // Keep a reference of the constructor name and its parent
            obj[key]._namespace = {
              parent: obj,
              value: key
            };
          
            found = obj[key] === constructorToFind;
          
            if (found) {
              break;
            }
            else {
              found = find(obj[key], constructorToFind);
            }
          }
        }
      }
    
      return found;
    };
  
    // Look for the constructor in the Coral namespace
    find(window.Coral, constructor);
  }
  
  // Climb up the constructor namespace
  while (constructor) {
    if (constructor._namespace) {
      constructorName.push(constructor._namespace.value);
      constructor = constructor._namespace.parent;
    }
    else {
      constructor = false;
    }
  }
  
  // Build the full namespace string and save it for reuse
  originalConstructor._componentName = constructorName.reverse().join('.');
  
  return originalConstructor._componentName;
};

/**
 Builds and returns an attribute/property map based on observed attributes
 @ignore
 */
const getAttributePropertyMap = function(constructor) {
  const observedAttributes = constructor.observedAttributes;
  
  if (!observedAttributes) {
    return {};
  }

  const attributePropertyMap = {};
  
  observedAttributes.forEach((attribute) => {
    // We assume if the attribute contains uppercase char, it's a property and can be mapped
    if (attribute.match(REG_EXP_UPPERCASE)) {
      attributePropertyMap[attribute.toLowerCase()] = attribute;
    }
  });
  
  constructor._attributePropertyMap = attributePropertyMap;
  
  return constructor._attributePropertyMap;
};

/**
 @mixin ComponentMixin
 @classdesc The base element for all Coral components
 */
const ComponentMixin = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
  
    // @legacy
    // Attach Vent
    this._vent = new Vent(this);
    this._events = {};
  }
  
  // @legacy
  get _componentName() { return this.constructor._componentName || getConstructorName(this.constructor); }
  
  // @legacy
  get _properties() { return {}; }
  
  // @legacy
  get _attributes() { return this.constructor._attributePropertyMap || getAttributePropertyMap(this.constructor); }
  
  // @legacy
  // The filter function for keyboard events. By default, any child element can trigger keyboard events.
  // You can pass {@link Coral.Keys.filterInputs} to avoid listening to key events triggered from within
  // inputs.
  _filterKeys() { return true; }
  
  // @legacy
  // Attach event listeners including global ones
  _delegateEvents(eventMap) {
    this._events = commons.extend(this._events, eventMap);
    delegateEvents.call(this);
    delegateGlobalEvents.call(this);
  }
  
  // @legacy
  // Returns the content zone if the component is connected and contains the content zone else null
  // Ideally content zones will be replaced by shadow dom and <slot> elements
  _getContentZone(contentZone) {
    if (document.documentElement.contains(this)) {
      return this.contains(contentZone) && contentZone || null;
    }
    // Return the content zone by default
    return contentZone;
  }
  
  // @legacy
  // Sets the value as content zone for the property given the specified options
  // Ideally content zones will be replaced by shadow dom and <slot> elements
  _setContentZone(property, value, options) {
    const handle = options.handle;
    const expectedTagName = options.tagName;
    const additionalSetter = options.set;
    const insert = options.insert;
    
    let oldNode;
    
    if (value) {
      if (!(value instanceof HTMLElement)) {
        throw new Error(`DOMException: Failed to set the "${property}" property on "${this.toString()}":
        The provided value is not of type "HTMLElement".`);
      }
      
      if (expectedTagName && value.tagName.toLowerCase() !== expectedTagName) {
        throw new Error(`DOMException: Failed to set the "${property}" property on "${this.toString()}": The new
        ${property} element is of type "${value.tagName}". It must be a "${expectedTagName.toUpperCase()}" element.`);
      }
      
      oldNode = this._elements[handle];
      
      // Replace the existing element
      if (insert) {
        // Remove old node
        if (oldNode && oldNode.parentNode) {
          oldNode.parentNode.removeChild(oldNode);
        }
        // Insert new node
        insert.call(this, value);
      }
      else if (oldNode && oldNode.parentNode) {
        console.warn(`${this._componentName} does not define an insert method for content zone ${handle}, falling back to replace.`);
        // Old way -- assume we have an old node
        this._elements[handle].parentNode.replaceChild(value, this._elements[handle]);
      }
      else {
        console.error(`${this._componentName} does not define an insert method for content zone ${handle}, falling back to append.`);
        // Just append, which may introduce bugs, but at least doesn't crazy
        this.appendChild(value);
      }
    }
    else {
      // we need to remove the content zone if it exists
      oldNode = this._elements[handle];
      if (oldNode && oldNode.parentNode) {
        oldNode.parentNode.removeChild(oldNode);
      }
    }
    
    // Re-assign the handle to the new element
    this._elements[handle] = value;
    
    // Invoke the setter
    if (typeof additionalSetter === 'function') {
      additionalSetter.call(this, value);
    }
  }
  
  // Handles the reflection of properties by using a flag to prevent setting the property by changing the attribute
  _reflectAttribute(attributeName, value) {
    if (typeof value === 'boolean') {
      if (value && !this.hasAttribute(attributeName)) {
        this._reflectedAttribute = true;
        this.setAttribute(attributeName, '');
        this._reflectedAttribute = false;
      }
      else if (!value && this.hasAttribute(attributeName)) {
        this._reflectedAttribute = true;
        this.removeAttribute(attributeName);
        this._reflectedAttribute = false;
      }
    }
    else if (this.getAttribute(attributeName) !== String(value)) {
      this._reflectedAttribute = true;
      this.setAttribute(attributeName, value);
      this._reflectedAttribute = false;
    }
  }
  
  // @legacy
  toString() {
    return `Coral.${this._componentName}`;
  }
  
  /**
   @legacy
   
   Add an event listener.
 
   @param {String} eventName
   The event name to listen for.
   @param {String} [selector]
   The selector to use for event delegation.
   @param {Function} func
   The function that will be called when the event is triggered.
   @param {Boolean} [useCapture=false]
   Whether or not to listen during the capturing or bubbling phase.
   @returns {ComponentMixin} this, chainable.
   */
  on(eventName, selector, func, useCapture) {
    this._vent.on(eventName, selector, func, useCapture);
    return this;
  }
  
  /**
   @legacy
   
   Remove an event listener.
   @param {String} eventName
   The event name to stop listening for.
   @param {String} [selector]
   The selector that was used for event delegation.
   @param {Function} func
   The function that was passed to <code>on()</code>.
   @param {Boolean} [useCapture]
   Only remove listeners with <code>useCapture</code> set to the value passed in.
   @returns {ComponentMixin} this, chainable.
   */
  off(eventName, selector, func, useCapture) {
    this._vent.off(eventName, selector, func, useCapture);
    return this;
  }
  
  /**
   @legacy
   
   Trigger an event.
   @param {String} eventName
   The event name to trigger.
   @param {Object} [props]
   Additional properties to make available to handlers as <code>event.detail</code>.
   @param {Boolean} [bubbles=true]
   Set to <code>false</code> to prevent the event from bubbling.
   @param {Boolean} [cancelable=true]
   Set to <code>false</code> to prevent the event from being cancelable.
   @returns {CustomEvent} CustomEvent object
   */
  trigger(eventName, props, bubbles, cancelable) {
    // When 'bubbles' is not set, then default to true:
    bubbles = bubbles || bubbles === undefined;
    
    // When 'cancelable' is not set, then default to true:
    cancelable = cancelable || cancelable === undefined;
    
    const event = new CustomEvent(eventName, {
      bubbles: bubbles,
      cancelable: cancelable,
      detail: props
    });
  
    // Don't trigger the event if silenced
    if (this._silenced) {
      return event;
    }
    
    // default value in case the dispatching fails
    let defaultPrevented = false;
    
    try {
      // leads to NS_ERROR_UNEXPECTED in Firefox
      // https://bugzilla.mozilla.org/show_bug.cgi?id=329509
      defaultPrevented = !this.dispatchEvent(event);
    }
    // eslint-disable-next-line no-empty
    catch (e) {}
    
    // Check if the defaultPrevented status was correctly stored back to the event object
    if (defaultPrevented !== event.defaultPrevented) {
      // dispatchEvent() doesn't correctly set event.defaultPrevented in IE 9
      // However, it does return false if preventDefault() was called
      // Unfortunately, the returned event's defaultPrevented property is read-only
      // We need to work around this such that (patchedEvent instanceof Event) === true
      // First, we'll create an object that uses the event as its prototype
      // This gives us an object we can modify that is still technically an instanceof Event
      const patchedEvent = Object.create(event);
      
      // Next, we set the correct value for defaultPrevented on the new object
      // We cannot simply assign defaultPrevented, it causes a "Invalid Calling Object" error in IE 9
      // For some reason, defineProperty doesn't cause this
      Object.defineProperty(patchedEvent, 'defaultPrevented', {
        value: defaultPrevented
      });
      
      return patchedEvent;
    }
    
    return event;
  }
  
  /**
   @legacy
   
   Set multiple properties.
   
   @name ComponentMixin#set
   @function
   
   @param {Object.<String, *>} properties
   An object of property/value pairs to set.
   @param {Boolean} silent
   If true, events should not be triggered as a result of this set.
   
   @returns {ComponentMixin} this, chainable.
   */
  set(propertyOrProperties, valueOrSilent, silent) {
    const self = this;
    
    let property;
    let properties;
    let value;
    
    const isContentZone = (prop) => self._contentZones && commons.swapKeysAndValues(self._contentZones)[prop];
    
    const updateContentZone = (prop, val) => {
      // If content zone exists and we only want to update properties on the content zone
      if (self[prop] instanceof HTMLElement && !(val instanceof HTMLElement)) {
        for (const contentZoneProperty in val) {
          self[prop][contentZoneProperty] = val[contentZoneProperty];
        }
      }
      // Else assign the new value to the content zone
      else {
        self[prop] = val;
      }
    };
    
    const setProperty = (prop, val) => {
      if (isContentZone(prop)) {
        updateContentZone(prop, val);
      }
      else {
        self._silenced = silent;
        self[prop] = val;
        self._silenced = false;
      }
    };
    
    if (typeof propertyOrProperties === 'string') {
      // Set a single property
      property = propertyOrProperties;
      value = valueOrSilent;
      
      setProperty(property, value);
    }
    else {
      properties = propertyOrProperties;
      silent = valueOrSilent;
      
      // Set a map of properties
      for (property in properties) {
        value = properties[property];
        
        setProperty(property, value);
      }
    }
    
    return this;
  }
  
  /**
   Get the value of a property.
   @param {String} property
   The name of the property to fetch the value of.
   @returns {*} Property value.
   */
  get(property) {
    return this[property];
  }
  
  /**
   Show this component.
   @returns {ComponentMixin} this, chainable
   */
  show() {
    if (!this.hidden) {
      return this;
    }
  
    this.hidden = false;
    return this;
  }
  
  /**
   Hide this component.
   @returns {ComponentMixin} this, chainable
   */
  hide() {
    if (this.hidden) {
      return this;
    }
  
    this.hidden = true;
    return this;
  }
  
  /** @ignore */
  // eslint-disable-next-line no-unused-vars
  attributeChangedCallback(name, oldValue, value) {
    if (!this._reflectedAttribute) {
      // Use the attribute/property mapping
      this[this._attributes[name] || name] = value;
    }
  }
  
  /** @ignore */
  connectedCallback() {
    // A component that is reattached should respond to global events again
    if (this._disconnected) {
      delegateGlobalEvents.call(this);
      this._disconnected = false;
    }
  }
  
  /** @ignore */
  disconnectedCallback() {
    // A component that isn't in the DOM should not be responding to global events
    this._disconnected = true;
    undelegateGlobalEvents.call(this);
  }
};

export default ComponentMixin;
