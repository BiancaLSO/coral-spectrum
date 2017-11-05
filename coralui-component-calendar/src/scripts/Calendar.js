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
import {FormFieldMixin} from 'coralui-mixin-formfield';
import {DateTime} from 'coralui-datetime';
import 'coralui-component-button';
import calendar from '../templates/calendar';
import container from '../templates/container';
import table from '../templates/table';
import {transform, commons, i18n, Keys} from 'coralui-util';

/** @ignore */
function isDateInRange(date, startDate, endDate) {
  if (!date) {
    return false;
  }
  
  if (startDate === null && endDate === null) {
    return true;
  }
  else if (startDate === null) {
    return date.toDate() <= endDate;
  }
  else if (endDate === null) {
    return date.toDate() >= startDate;
  }
  
  return startDate <= date.toDate() && date.toDate() <= endDate;
}

/** @ignore */
function toMoment(value, format) {
  if (value === 'today') {
    return new DateTime.Moment().startOf('day');
  }
  else if (DateTime.Moment.isMoment(value)) {
    return value.isValid() ? value.clone() : null;
  }
  
  // if the value provided is a date it does not make sense to provide a format to parse the date
  const result = new DateTime.Moment(value, value instanceof Date ? null : format);
  return result.isValid() ? result.startOf('day') : null;
}

/** @ignore */
function validateAsChangedAndValidMoment(newValue, oldValue) {
  // if the value is undefined we change it to null since moment considers both to be different
  newValue = newValue || null;
  oldValue = oldValue || null;
  
  if (newValue !== oldValue && !new DateTime.Moment(newValue).isSame(oldValue, 'day')) {
    return newValue === null || newValue.isValid();
  }
  
  return false;
}

/**
 Slides in new month tables, slides out old tables, and then cleans up the leftovers when it is done.
 
 @ignore
 */
function TableAnimator(host) {
  this.host = host;
  
  this._addContainerIfNotPresent = (width, height) => {
    if (!this.container) {
      // Get a fresh container for the animation:
      container.call(
        this,
        {
          width,
          height
        }
      );
      this.host.appendChild(this.container);
    }
  };
  
  this._removeContainerIfEmpty = () => {
    if (this.container && this.container.children.length === 0) {
      this.host.removeChild(this.container);
      this.container = null;
    }
  };
  
  this.slide = (newTable, direction) => {
    const self = this;
    const replace = direction === undefined;
    const isLeft = direction === 'left';
    const oldTable = this.oldTable;
    
    // Should the replace flag be raised, or no old table be present, then do a non-transitioned (re)place and exit
    if (replace || !oldTable) {
      if (oldTable) {
        oldTable.parentNode.removeChild(oldTable);
      }
      this.host.insertBefore(newTable, this.host.firstChild);
      this.oldTable = newTable;
      return;
    }
    
    const boundingClientRect = oldTable.getBoundingClientRect();
    const width = boundingClientRect.width;
    let height = boundingClientRect.height;
    this._addContainerIfNotPresent(width, height);
    
    // Add both the old and the new table to the container:
    this.container.appendChild(oldTable);
    this.container.appendChild(newTable);
    
    // Set the existing table to start from being in full view, and mark it to transition on `left` changing
    oldTable.classList.add('coral3-Calendar-table--transit');
    
    commons.transitionEnd(oldTable, () => {
      oldTable.parentNode.removeChild(oldTable);
      self._removeContainerIfEmpty();
    });
    
    // Set the new table to start out of view (either left or right depending on the direction of the slide), and mark
    // it to transition on `left` changing
    newTable.classList.add('coral3-Calendar-table--transit');
    newTable.style.left = `${isLeft ? width : -width}px`;
    
    // When the transition is done, have the transition class lifted
    commons.transitionEnd(newTable, () => {
      newTable.classList.remove('coral3-Calendar-table--transit');
      self.host.appendChild(newTable);
      self._removeContainerIfEmpty();
    });
    
    // Force a redraw by querying the browser for its offsetWidth. Without this, the re-positioning code later on
    // would not lead to a transition. Note that there's no significance to the resulting value being assigned to
    // 'height'
    height = this.container.offsetWidth;
    
    // Set the `left` positions to transition to:
    oldTable.style.left = `${isLeft ? -width : width}px`;
    newTable.style.left = 0;
    
    this.oldTable = newTable;
  };
}

/** @ignore */
const ARRAYOF6 = [0, 0, 0, 0, 0, 0];

/** @ignore */
const ARRAYOF7 = [0, 0, 0, 0, 0, 0, 0];

/** @ignore */
const INTERNAL_FORMAT = 'YYYY-MM-DD';

/** @ignore */
const timeUnit = {
  YEAR: 'year',
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const CLASSNAME = 'coral3-Calendar';

/**
 @class Coral.Calendar
 @classdesc A Calendar component that can be used as a date selection form field. Leverages {@link momentJS} if loaded
 on the page.
 @htmltag coral-calendar
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {FormFieldMixin}
 */
class Calendar extends FormFieldMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Default value
    this._value = null;
    
    this._delegateEvents(commons.extend(this._events, {
      'click .coral3-Calendar-nextMonth,.coral3-Calendar-prevMonth': '_onNextOrPreviousMonthClick',
      'click .coral3-Calendar-calendarBody .coral3-Calendar-date': '_onDayClick',
      'mousedown .coral3-Calendar-calendarBody .coral3-Calendar-date': '_onDayMouseDown',
      'key:up .coral3-Calendar-calendarBody': '_onUpKey',
      'key:right .coral3-Calendar-calendarBody': '_onRightKey',
      'key:down .coral3-Calendar-calendarBody': '_onDownKey',
      'key:left .coral3-Calendar-calendarBody': '_onLeftKey',
      'key:home .coral3-Calendar-calendarBody': '_onHomeOrEndKey',
      'key:end .coral3-Calendar-calendarBody': '_onHomeOrEndKey',
      'key:pageup': '_onPageUpKey',
      'key:pagedown': '_onPageDownKey',
  
      // On OSX we use Command+Page Up
      'key:meta+pageup': '_onCtrlPageUpKey',
      // On OSX we use Command+Page Down
      'key:meta+pagedown': '_onCtrlPageDownKey',
      // On Windows, we use CTRL+Page Up
      'key:ctrl+pageup': '_onCtrlPageUpKey',
      // On Windows, we use CTRL+Page Down
      'key:ctrl+pagedown': '_onCtrlPageDownKey',
  
      'key:enter .coral3-Calendar-calendarBody': '_onEnterKey',
      'key:space .coral3-Calendar-calendarBody': '_onEnterKey'
    }));
    
    // Prepare templates
    this._elements = {};
    calendar.call(this._elements);

    // Internal keeper of the month that is currently on display.
    this._cursor = null;
  
    // Internal keeper for the id of the currently focused date cell or the cell that would receive focus when the
    // calendar body receives focus.
    this._activeDescendant = null;
    this._animator = new TableAnimator(this._elements.body);
  }
  
  /**
   Defines the start day for the week, 0 = Sunday, 1 = Monday etc., as depicted on the calendar days grid.
   
   @type {Number}
   @default 0
   @htmlattribute startday
   */
  get startDay() {
    if (this._startDay) {
      return this._startDay;
    }
    
    if (typeof DateTime.Moment.localeData().firstDayOfWeek !== 'undefined') {
      return DateTime.Moment.localeData(i18n.locale).firstDayOfWeek();
    }
    
    return 0;
  }
  set startDay(value) {
    if (value >= 0 && value < 7) {
      this._startDay = value;
  
      this._renderCalendar();
    }
  }
  
  /**
   The format used to display the current month and year.
   'MMMM YYYY' is supported by default. Include momentjs to support additional format string options see
   http://momentjs.com/docs/#/displaying/.
   
   @type {String}
   @default "MMMM YYYY"
   @htmlattribute headerformat
   */
  get headerFormat() {
    return this._headerFormat || 'MMMM YYYY';
  }
  set headerFormat(value) {
    this._headerFormat = transform.string(value);
    this._renderCalendar();
  }
  
  /**
   The minimal selectable date in the Calendar view. When passed a string, it needs to be 'YYYY-MM-DD' formatted.
   
   @type {String|Date}
   @default null
   @htmlattribute min
   */
  get min() {
    return this._min ? this._min.toDate() : null;
  }
  set min(value) {
    value = toMoment(value, this.valueFormat);
    
    if (validateAsChangedAndValidMoment(value, this._min)) {
      this._min = value;
      this._renderCalendar();
    }
  }
  
  /**
   The max selectable date in the Calendar view. When passed a string, it needs to be 'YYYY-MM-DD'
   formatted.
   
   @type {String|Date}
   @default null
   @htmlattribute max
   */
  get max() {
    return this._max ? this._max.toDate() : null;
  }
  set max(value) {
    value = toMoment(value, this.valueFormat);
    
    if (validateAsChangedAndValidMoment(value, this._max)) {
      this._max = value;
      this._renderCalendar();
    }
  }
  
  /**
   The format to use on expressing the selected date as a string on the <code>value</code> attribute.
   'YYYY-MM-DD' is supported by default. Include momentjs to support additional format string options see
   http://momentjs.com/docs/#/displaying/.
   
   @type {String}
   @default "YYYY-MM-DD"
   @htmlattribute valueformat
   @htmlattributereflected
   */
  get valueFormat() {
    return this._valueFormat || INTERNAL_FORMAT;
  }
  set valueFormat(value) {
    value = transform.string(value);
    
    const setValueFormat = (newValue) => {
      this._valueFormat = newValue;
      this._reflectAttribute('valueformat', this._valueFormat);
    };
  
    // Once the valueFormat is set, we make sure the value is also correct
    if (!this._valueFormat && this._originalValue) {
      setValueFormat(value);
      this.value = this._originalValue;
    }
    else {
      setValueFormat(value);
      this._elements.input.value = this.value;
    }
  }
  
  /**
   The value returned, or set, as a Date. If the value is '' it will return <code>null</code>.
   
   @type {Date}
   @default null
   */
  get valueAsDate() {
    return this._value ? this._value.toDate() : null;
  }
  set valueAsDate(value) {
    if (value instanceof Date) {
      this._valueAsDate = new DateTime.Moment(value);
      this.value = this._valueAsDate;
    }
    else {
      this._valueAsDate = null;
      this.value = '';
    }
  }
  
  /**
   The current value. When set to 'today', the value is coerced into the clients local date expressed as string
   formatted in accordance to the set <code>valueFormat</code>.
   
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    return this._value ? this._value.format(this.valueFormat) : '';
  }
  set value(value) {
    // This is used to change the value if valueformat is also set but afterwards
    this._originalValue = value;
    
    value = toMoment(value, this.valueFormat);
    
    if (validateAsChangedAndValidMoment(value, this._value)) {
      this._value = value;
      this._elements.input.value = this.value;
      
      // resets the view cursor, so the selected month will be in view
      this._cursor = null;
      
      this._renderCalendar();
      this.required = this.required;
    }
  }
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.input.name = value;
  }
  
  /**
   Whether this field is required or not.
   @type {Boolean}
   @default false
   @htmlattribute required
   @htmlattributereflected
   */
  get required() {
    return this._required || false;
  }
  set required(value) {
    this._required = transform.booleanAttr(value);
    this._reflectAttribute('required', this._required);
    
    this.setAttribute('aria-required', this._required);
    this.classList.toggle('is-required', this._required && this._value === null);
  }
  
  /**
   Whether this field is disabled or not.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
    
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.prev.disabled = this._disabled;
    this._elements.next.disabled = this._disabled;
    this._elements.body.setAttribute('aria-disabled', this._disabled);
    this._elements.body[this._disabled ? 'removeAttribute' : 'setAttribute']('tabindex', '0');
  
    this._renderCalendar();
  }
  
  /**
   Inherited from {@link FormFieldMixin#invalid}.
   */
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
    
    this._renderCalendar();
  }
  
  /**
   Whether this field is readOnly or not. Indicating that the user cannot modify the value of the control.
   @type {Boolean}
   @default false
   @htmlattribute readonly
   @htmlattributereflected
   */
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    this.setAttribute('aria-readonly', this._readOnly);
  }
  
  /** @ignore */
  _renderCalendar(slide) {
    const cursor = this._requireCursor();
    const displayYear = cursor.year();
    const displayMonth = cursor.month();
    const oldTable = this._animator.oldTable;
    
    this._elements.heading.innerHTML = new DateTime.Moment([displayYear, displayMonth, 1]).format(this.headerFormat);
    
    const newTable = this._renderTable(displayYear, displayMonth + 1);
    
    if (oldTable) {
      const self = this;
      commons.transitionEnd(newTable, () => {
        self._setActiveDescendant();
      });
    }
    
    this._animator.slide(newTable, slide);
    
    const el = this._elements.body.querySelector('.is-selected');
    
    // This will be overwritten later if there is any other function setting the attribute
    this._activeDescendant = el ? el.id : null;
    
    this._setActiveDescendant();
  }
  
  /**
   Returns <code>true</code> if moment specified is before <code>min</code>.
   
   @param {moment} currentMoment
   A moment to test.
   @returns {Boolean}
   <code>true</code> if moment specified is before <code>min</code>
   
   @ignore
   */
  _isBeforeMin(currentMoment) {
    const min = this.min ? new DateTime.Moment(this.min) : null;
    return min && currentMoment.isBefore(min);
  }
  
  /**
   Returns <code>true</code> if moment specified is after <code>max</code>.
   
   @param {moment} currentMoment
   A moment to test.
   @returns {Boolean}
   <code>true</code> if moment specified is after <code>max</code>
   
   @ignore
   */
  _isAfterMax(currentMoment) {
    const max = this.max ? new DateTime.Moment(this.max) : null;
    return max && currentMoment.isAfter(max);
  }
  
  /**
   Returns <code>true</code> if moment specified is greater than or equal to <code>min</code> and less than or equal to <code>max</code>.
   
   @param {moment} currentMoment
   A moment to test.
   @returns {Boolean}
   <code>true</code> if moment specified falls within <code>min</code>/<code>max</code> date range.
   
   @ignore
   */
  _isInRange(currentMoment) {
    return !(this._isBeforeMin(currentMoment) || this._isAfterMax(currentMoment));
  }
  
  /**
   Updates the aria-activedescendant property for the calendar grid to communicate the currently focused date, or the
   date that should get focus when the grid receives focus, to assistive technology.
   
   @ignore
   */
  _setActiveDescendant() {
    let el;
    
    if (!this._activeDescendant || !this._elements.body.querySelector(`#${this._activeDescendant} [data-date]`)) {
      this._activeDescendant = null;
      
      el = this._elements.body.querySelector('.is-selected');
      
      const selectedId = el ? el.id : null;
      
      el = this._elements.body.querySelector('.is-today');
      
      const todayId = el ? el.id : null;
      
      this._activeDescendant = selectedId || todayId;
      
      if (!this._activeDescendant || !this._elements.body.querySelector(`#${this._activeDescendant} [data-date]`)) {
        const currentMoment = this._value;
        
        if (currentMoment) {
          const dates = this._elements.body.querySelectorAll('[data-date]');
          if (dates.length) {
            if (this._isBeforeMin(currentMoment)) {
              el = dates[0];
            }
            else if (this._isAfterMax(currentMoment)) {
              el = dates[dates.length - 1];
            }
          }
        }
        
        if (el) {
          this._activeDescendant = el.parentElement.id;
        }
      }
    }
    
    el = this._elements.body.querySelector('.is-focused');
    if (el) {
      el.classList.remove('is-focused');
    }
    
    this._elements.body.setAttribute('aria-activedescendant', this._activeDescendant);
    
    this._updateTableCaption();
    
    if (!this._activeDescendant) {
      return;
    }
    
    el = document.getElementById(this._activeDescendant);
    if (el) {
      el.classList.add('is-focused');
    }
  }
  
  /**
   Updates the table caption which serves as a live region to announce the currently focused date to assistive
   technology, improving compatibility across operating systems, browsers and screen readers.
   
   @ignore
   */
  _updateTableCaption() {
    const caption = this._elements.body.querySelector('caption');
    
    if (!caption) {
      return;
    }
    
    if (caption.firstChild) {
      caption.removeChild(caption.firstChild);
    }
    if (this._activeDescendant) {
      const activeDescendant = this._elements.body.querySelector(`#${this._activeDescendant}`);
      const captionText = document.createTextNode(activeDescendant.getAttribute('title'));
      caption.appendChild(captionText);
    }
  }
  
  /** @ignore */
  _renderTable(year, month) {
    const firstDate = new DateTime.Moment([year, month - 1, 1]);
    let monthStartsAt = (firstDate.day() - this.startDay) % 7;
    const dateLocal = this._value ? this._value.clone().startOf('day') : null;
    
    if (monthStartsAt < 0) {
      monthStartsAt += 7;
    }
    
    const data = {
      // eslint-disable-next-line no-unused-vars
      dayNames: ARRAYOF7.map((currentIndex, index) => {
        const dayMoment = new DateTime.Moment().day((index + this.startDay) % 7);
        return {
          dayAbbr: dayMoment.format('dd'),
          dayFullName: dayMoment.format('dddd')
        };
      }, this),
  
      // eslint-disable-next-line no-unused-vars, arrow-body-style
      weeks: ARRAYOF6.map((currentWeekIndex, weekIndex) => {
        // eslint-disable-next-line no-unused-vars
        return ARRAYOF7.map((currentDayIndex, dayIndex) => {
          const result = {};
          const cssClass = this.disabled ? ['is-disabled'] : [];
          let ariaSelected = false;
          let ariaInvalid = false;
          const day = weekIndex * 7 + dayIndex - monthStartsAt;
          const cursor = new DateTime.Moment([year, month - 1]);
          // we use add() since 'day' could be a negative value
          cursor.add(day, 'days');
    
          const isCurrentMonth = cursor.month() + 1 === parseFloat(month);
          const dayOfWeek = new DateTime.Moment().day((dayIndex + this.startDay) % 7).format('dddd');
          const isToday = cursor.isSame(new DateTime.Moment(), 'day');
    
          const cursorLocal = cursor.clone().startOf('day');
    
          if (isToday) {
            cssClass.push('is-today');
          }
    
          if (dateLocal && cursorLocal.isSame(dateLocal, 'day')) {
            ariaSelected = true;
            cssClass.push('is-selected');
            if (this.invalid) {
              ariaInvalid = true;
              cssClass.push('is-invalid');
            }
          }
    
          if (isCurrentMonth) {
            cssClass.push('is-currentMonth');
            if (!this.disabled && isDateInRange(cursor, this.min, this.max)) {
              result.dateAttr = cursorLocal.format(INTERNAL_FORMAT);
              result.weekIndex = cursor.week();
              result.formattedDate = cursor.format('LL');
            }
          }
    
          result.isDisabled = this.disabled || !result.dateAttr;
          result.dateText = cursor.date();
          result.cssClass = cssClass.join(' ');
          result.isToday = isToday;
          result.ariaSelected = ariaSelected;
          result.ariaInvalid = ariaInvalid;
          result.dateLabel = dayOfWeek;
          result.weekIndex = cursor.week();
    
          return result;
        }, this);
      }, this)
    };
    
    const handles = {};
    table.call(handles, data);
    
    return handles.table;
  }
  
  /** @ignore */
  _requireCursor() {
    let cursor = this._cursor;
    if (!cursor || !cursor.isValid()) {
      // When its unknown what month we should be showing, use the set date. If that is not available, use 'today'
      cursor = (this._value ? this._value.clone().startOf('day') : new DateTime.Moment()).startOf('month');
      this._cursor = cursor;
    }
    
    return cursor;
  }
  
  /**
   Navigate to previous or next timeUnit interval.
   
   @param {String} unit
   Year, Month, Week, Day
   @param {Boolean} isNext
   Whether to navigate forward or backward.
   
   @private
   */
  _gotoPreviousOrNextTimeUnit(unit, isNext) {
    const direction = isNext ? 'left' : 'right';
    const operator = isNext ? 'add' : 'subtract';
    const el = this._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
    let currentActive;
    let currentMoment;
    let newMoment;
    let difference;
    
    if (unit !== timeUnit.MONTH && el) {
      currentActive = el.dataset.date;
      currentMoment = new DateTime.Moment(currentActive);
      newMoment = currentMoment[operator](1, unit);
      
      // make sure new moment is in range before transitioning
      if (this._isInRange(newMoment)) {
        difference = Math.abs(new DateTime.Moment(currentActive).diff(newMoment, 'days'));
        this._getToNewMoment(direction, operator, difference);
        this._setActiveDescendant();
      }
    }
    else {
      this._requireCursor();
      
      // if cursor is out of range
      if (!this._isInRange(this._cursor)) {
        
        // advance to closest value in range
        if (this._isBeforeMin(this._cursor)) {
          newMoment = this.min;
        }
        else if (this._isAfterMax(this._cursor)) {
          newMoment = this.max;
        }
        newMoment = new DateTime.Moment(newMoment);
        difference = Math.abs(this._cursor.diff(newMoment, 'days'));
        this._getToNewMoment(direction, operator, difference);
        this._setActiveDescendant();
        return;
      }
      
      this._cursor[operator](1, unit);
      this._renderCalendar(direction);
    }
  }
  
  /**
   Checks if the Calendar is valid or not. This is done by checking that the current value is between the
   provided <code>min</code> and <code>max</code> values. This check is only performed on user interaction.
   @ignore
   */
  _validateCalendar() {
    const isInvalid = !(this._value === null || isDateInRange(this._value, this.min, this.max));
    
    if (this.invalid !== isInvalid) {
      this.invalid = isInvalid;
    }
  }
  
  /** @ignore */
  _onNextOrPreviousMonthClick(event) {
    event.preventDefault();
    
    this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, this._elements.next === event.matchedTarget);
    event.matchedTarget.focus();
    this._validateCalendar();
  }
  
  /** @ignore */
  _getToNewMoment(direction, operator, difference) {
    const el = this._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
    let currentActive;
    
    if (el) {
      currentActive = el.dataset.date;
    }
    else {
      this._requireCursor();
      currentActive = this._cursor.format(INTERNAL_FORMAT);
    }
    
    const currentMoment = new DateTime.Moment(currentActive);
    const currentMonth = currentMoment.month();
    const currentYear = currentMoment.year();
    const newMoment = currentMoment[operator](difference, 'days');
    const newMonth = newMoment.month();
    const newYear = newMoment.year();
    const newMomentValue = newMoment.format(INTERNAL_FORMAT);
    
    if (newMonth !== currentMonth) {
      this._requireCursor();
      this._cursor[operator](1, 'months');
      this._renderCalendar(direction);
    }
    else if (newMonth === currentMonth && newYear !== currentYear) {
      this._requireCursor();
      this._cursor[operator](1, 'years');
      this._renderCalendar(direction);
    }
  
    const dateQuery = `.coral3-Calendar-date[data-date^=${JSON.stringify(newMomentValue)}]`;
    const newDescendant = this._elements.body.querySelector(dateQuery);
    if (newDescendant) {
      this._activeDescendant = newDescendant.parentNode.getAttribute('id');
    }
  }
  
  /** @ignore */
  _onDayMouseDown(event) {
    this._activeDescendant = event.target.parentNode.id;
    this._setActiveDescendant();
    this._elements.body.focus();
    this._validateCalendar();
  }
  
  /** @ignore */
  _onDayClick(event) {
    event.preventDefault();
    
    this._elements.body.focus();
    
    const date = new DateTime.Moment(event.target.dataset.date, INTERNAL_FORMAT);
    let dateLocal;
    
    // Carry over any user set time info
    if (this._value) {
      dateLocal = this._value.clone();
    }
    
    // Set attribute so a change event will be triggered if the user has selected a different date
    if (validateAsChangedAndValidMoment(date, dateLocal)) {
      this.value = date;
      this.trigger('change');
    }
    
    this._validateCalendar();
  }
  
  /** @ignore */
  _onEnterKey(event) {
    event.preventDefault();
    
    const el = this._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
    
    if (el) {
      el.click();
    }
    
    this._validateCalendar();
  }
  
  /** @ignore */
  _onUpKey(event) {
    event.preventDefault();
    
    this._gotoPreviousOrNextTimeUnit(timeUnit.WEEK, false);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onDownKey(event) {
    event.preventDefault();
    
    this._gotoPreviousOrNextTimeUnit(timeUnit.WEEK, true);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onRightKey(event) {
    event.preventDefault();
    
    this._gotoPreviousOrNextTimeUnit(timeUnit.DAY, true);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onLeftKey(event) {
    event.preventDefault();
    
    this._gotoPreviousOrNextTimeUnit(timeUnit.DAY, false);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onHomeOrEndKey(event) {
    event.preventDefault();
    const isHome = event.keyCode === Keys.keyToCode('home');
    const direction = '';
    const operator = isHome ? 'subtract' : 'add';
    const el = this._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
    
    if (el) {
      const currentActive = el.dataset.date;
      const currentMoment = new DateTime.Moment(currentActive);
      const difference = isHome ? currentMoment.date() - 1 : currentMoment.daysInMonth() - currentMoment.date();
      this._getToNewMoment(direction, operator, difference);
      this._setActiveDescendant();
    }
    
    this._validateCalendar();
  }
  
  /** @ignore */
  _onPageDownKey(event) {
    event.preventDefault();
    this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, true);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onPageUpKey(event) {
    event.preventDefault();
    this._gotoPreviousOrNextTimeUnit(timeUnit.MONTH, false);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onCtrlPageDownKey(event) {
    event.preventDefault();
    this._gotoPreviousOrNextTimeUnit(timeUnit.YEAR, true);
    this._validateCalendar();
  }
  
  /** @ignore */
  _onCtrlPageUpKey(event) {
    event.preventDefault();
    this._gotoPreviousOrNextTimeUnit(timeUnit.YEAR, false);
    this._validateCalendar();
  }
  
  /**
   sets focus to appropriate descendant
   */
  focus() {
    if (!this.contains(document.activeElement) && !this.disabled) {
      this._setActiveDescendant();
      this._elements.body.focus();
    }
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'startday',
      'startDay',
      'headerformat',
      'headerFormat',
      'min',
      'max',
      'valueformat',
      'valueFormat'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    this.setAttribute('role', 'region');
    
    // Default reflected attribute
    if (!this._valueFormat) { this.valueFormat = INTERNAL_FORMAT; }
    
    const frag = document.createDocumentFragment();
    
    // Render template
    frag.appendChild(this._elements.input);
    frag.appendChild(this._elements.header);
    frag.appendChild(this._elements.body);
    
    /// Clean Up (cloneNode support)
    while (this.firstChild) {
      this.removeChild(this.firstChild);
    }
    
    this.appendChild(frag);
    
    // Render the calendar body if it's empty
    if (!this._elements.body.firstElementChild) {
      this._renderCalendar();
    }
  }
}

export default Calendar;
