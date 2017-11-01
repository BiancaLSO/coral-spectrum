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

const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const css = require('rollup-plugin-css-only');
const babel = require('rollup-plugin-babel');
const json = require('rollup-plugin-json');

module.exports = {
  plugins: [
    nodeResolve(),
    commonjs(),
    json(),
    css({ output: './build/css/coral.css'}),
    babel({
      presets: [
        [
          'env',
          {
            modules: false
          }
        ]
      ],
      plugins: [
        'babel-plugin-external-helpers'
      ]
    })
  ]
};
