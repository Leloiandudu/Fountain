'use strict';

var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var browserSync = require('browser-sync');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

var watch = require('gulp-watch');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');

var envify = require('envify');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;

var paths = {
   src: './src/main.js',
   dst: '../WikiFountain.Server/Scripts/',
   dstName: 'app.js',
};

var lessPaths = {
   watch: './src/**/*.less',
   src: './src/main.less',
   dst: '../WikiFountain.Server/Content/',
   dstName: 'app.css',
};

function createBrowserify() {
   return browserify(Object.assign({
      entries: paths.src,
      ignoreWatch: ['**/node_modules/**'],
      poll: true,
   }, watchify.args)).transform('envify', {
      global: true,
      _: 'purge',
      NODE_ENV: argv.release ? 'production' : 'development',
   }).transform('babelify', {
      global: true,
      ignore: /\/node_modules\/(?!(react-day-picker)\/)/,
      'presets': [ 'es2015', 'react' ],
      'plugins': [ 'transform-async-to-generator', 'transform-object-rest-spread' ]
   });
}

function runBrowserify(b) {
   return b
      .bundle()
      .on('error', notify.onError())
      .pipe(source(paths.dstName))
      .pipe(buffer())
      .pipe(gulpif(argv.release, uglify()))
      .pipe(gulp.dest(paths.dst))
      .pipe(browserSync.stream({ once: true }));
}

function runLess() {
   return gulp.src(lessPaths.src)
      .pipe(less())
      .on('error', notify.onError())
      .pipe(gulpif(argv.release, minifyCSS()))
      .pipe(rename(lessPaths.dstName))
      .pipe(gulp.dest(lessPaths.dst));
};

gulp.task('serve', function() {
   browserSync({
      proxy: 'http://localhost:61712/',
      open: false,
      host: '192.168.1.2',
      ghostMode: false,
   });
})

gulp.task('javascript', function() {
   return runBrowserify(createBrowserify());
});

gulp.task('less', function() {
   return runLess();
});

gulp.task('watchify', function() {
   var b = watchify(createBrowserify());
   b.on('update', rebundle).on('time', time => notify().write('Done in ' + (time / 1000).toFixed(1) + ' seconds'));
   return rebundle();

   function rebundle() {
      return runBrowserify(b)
   }
});

gulp.task('watch', [ 'watchify', 'serve', 'less' ], function() {
   watch(lessPaths.watch, () => runLess().pipe(browserSync.stream()));
});

gulp.task('default', [ 'javascript', 'less' ]);