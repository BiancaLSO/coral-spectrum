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

/** @ignore */
const getIndexOf = (el) => {
  const parent = el.parentNode;
  if (!parent) {
    return -1;
  }
  
  return Array.prototype.indexOf.call(parent.children, el);
};

/** @ignore */
const getSiblingsOf = (el, selector, type) => {
  const stack = [];
  
  // Returns siblings of el
  if (!type) {
    ['previousElementSibling', 'nextElementSibling'].forEach((direction) => {
      let sibling = el;
      while (sibling[direction]) {
        sibling = sibling[direction];
        if (sibling.matches(selector)) {
          stack.push(sibling);
        }
      }
    });
  }
  else {
    const direction = type.indexOf('next') === 0 ? 'nextElementSibling' : 'previousElementSibling';
    
    // All following siblings of el up to but not including the element matched by the selector
    if (type.indexOf('Until') !== -1) {
      const matches = function() {
        if (typeof selector === 'string') {
          return el[direction].matches(selector);
        }
        
        return el[direction] === selector;
      };
      
      while (el[direction] && !matches()) {
        stack.push(el = el[direction]);
      }
    }
    // All following siblings of el filtered by a selector.
    else if (type.indexOf('All') !== -1) {
      while (el[direction]) {
        el = el[direction];
        if (el.matches(selector)) {
          stack.push(el);
        }
      }
    }
    // Returns the sibling only if it matches that selector.
    else {
      const sibling = el[direction];
      return sibling && sibling.matches(selector) ? sibling : null;
    }
  }
  
  return stack;
};

/** @ignore */
const listToArray = (list) => {
  const res = [];
  for (let i = 0, listCount = res.length = list.length; i < listCount; i++) {
    res[i] = list[i];
  }
  return res;
};

/** @ignore */
const getColumns = (colgroup) => listToArray(colgroup.querySelectorAll('col[is="coral-table-column"]'));

/** @ignore */
const getRows = (sections) => {
  let rows = [];
  
  sections.forEach((section) => {
    if (section) {
      rows = rows.concat(listToArray(section.querySelectorAll('tr[is="coral-table-row"]')));
    }
  });
  
  return rows;
};

/** @ignore */
const getCells = (row) => listToArray(row.querySelectorAll('td[is="coral-table-cell"], th[is="coral-table-headercell"]'));

/** @ignore */
const getContentCells = (row) => listToArray(row.querySelectorAll('td[is="coral-table-cell"]'));

/** @ignore */
const getHeaderCells = (row) => listToArray(row.querySelectorAll('th[is="coral-table-headercell"]'));

/** @ignore */
const getCellByIndex = (row, index) => getCells(row).filter(cell => getIndexOf(cell) === index)[0] || null;

/**
 Enumeration for {@link TableHead}, {@link TableBody} and {@link TableFoot} divider values.
 
 @typedef {Object} TableSectionDividerEnum
 
 @property {String} NONE
 No divider.
 @property {String} ROW
 Row divider.
 @property {String} COLUMN
 Column divider.
 @property {String} CELL
 Row and Column divider.
 */
const divider = {
  NONE: 'none',
  ROW: 'row',
  COLUMN: 'column',
  CELL: 'cell'
};

/**
 Enumeration for {@link TableColumn} alignment options.
 
 @typedef {Object} TableColumnAlignmentEnum
 
 @property {String} LEFT
 Left alignment.
 @property {String} CENTER
 Center alignment.
 @property {String} RIGHT
 Right alignment.
 */
const alignment = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

export {
  divider,
  alignment,
  getColumns,
  getCells,
  getContentCells,
  getHeaderCells,
  getCellByIndex,
  getIndexOf,
  getSiblingsOf,
  getRows
};
