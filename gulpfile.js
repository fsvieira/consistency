const gulp = require('gulp');
const browserify = require('browserify');
const path = require('path');
const babelify = require("babelify");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

const BUILD_DEST = './site';

gulp.task('browserify', function () {
  return browserify(['site/js/main.js'])
      .transform(babelify)
      .bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest(path.join(BUILD_DEST, 'js')))
      .pipe(buffer());
});

