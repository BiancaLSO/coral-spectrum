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
module.exports = function(gulp) {
  const fs = require('fs');
  const exec = require('child_process').exec;
  const plumber = require('gulp-plumber');
  const modifyFile = require('gulp-modify-file');
  
  const regExp = /.*class extends superClass {/g;
  
  // @todo due to https://github.com/nanopx/gulp-esdoc/issues/19, we can't use gulp-esdoc
  gulp.task('docs', function(cb) {
    
    // @todo due to https://github.com/esdoc/esdoc/issues/455, use class def
    gulp.src(['src/scripts/*Mixin.js', 'coralui-mixin-*/src/scripts/*Mixin.js'])
      .pipe(plumber())
      .pipe(modifyFile((content, path) => {
        const className = path.split('/').pop().slice(0, -3);
        return content.replace(regExp, `class ${className} extends superClass {`);
      }))
      .pipe(gulp.dest(function(file) {
        return file.base;
      }));
    
    // @todo due to https://github.com/esdoc/esdoc/issues/432, we have to manually create a fake README
    try {
      fs.writeFileSync('README.md', '', { flag: 'wx' });
    }
    catch (e) {}
    
    const p = exec('node_modules/.bin/esdoc -c node_modules/coralui-gulp/configs/esdoc.conf.js', (err) => {
      
      // @todo due to https://github.com/esdoc/esdoc/issues/455, revert class def
      gulp.src(['src/scripts/*Mixin.js', 'coralui-mixin-*/src/scripts/*Mixin.js'])
        .pipe(plumber())
        .pipe(modifyFile((content, path) => {
          const className = path.split('/').pop().slice(0, -3);
          return content.replace(`class ${className} extends superClass {`, `const ${className} = (superClass) => class extends superClass {`);
        }))
        .pipe(gulp.dest(function(file) {
          return file.base;
        }));
      
      cb(err);
    });
    
    p.stdout.pipe(process.stdout);
  });
};
