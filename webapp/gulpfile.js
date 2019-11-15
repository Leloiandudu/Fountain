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
var sourcemaps = require('gulp-sourcemaps');
var exorcist = require('exorcist');

var envify = require('envify');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var taskTime = require('./build/gulp-total-task-time');
var fs = require('fs');

var Package = require('./package.json');
var dependencies = Object.keys(Package.dependencies);
var additionalDependencies = [
   'moment/locale/az', 'moment/locale/be', 'moment/locale/bg', 'moment/locale/bn',
   'moment/locale/de', 'moment/locale/id', 'moment/locale/ja', 'moment/locale/ka',
   'moment/locale/lo', 'moment/locale/ml', 'moment/locale/ne', 'moment/locale/pt',
   'moment/locale/ru', 'moment/locale/sq', 'moment/locale/uk', 'moment/locale/vi',
   'moment/locale/zh-cn', 'moment/locale/hu', 'moment/locale/cs', 'moment/locale/sk'
];

taskTime.init(function(s) {
   notify().write('Done in ' + s.toFixed(1) + ' seconds');
});

var paths = {
   src: './src/main.js',
   dst: '../WikiFountain.Server/Scripts/',
   app: 'app.js',
   libs: 'libs.js',
};

var lessPaths = {
   watch: './src/**/*.less',
   src: './src/main.less',
   dst: '../WikiFountain.Server/Content/',
   dstName: 'app.css',
};

function createBrowserify(libs) {
   var b = browserify(Object.assign({
      entries: libs ? undefined : paths.src,
      ignoreWatch: ['**/node_modules/**'],
      poll: true,
      debug: !argv.release,
   }, watchify.args)).transform('envify', {
      global: true,
      _: 'purge',
      NODE_ENV: argv.release ? 'production' : 'development',
   }).transform('babelify', {
      global: true,
      ignore: /\/node_modules\//,
      'presets': [ 'es2015', 'react' ],
      'plugins': [ 'transform-async-to-generator', 'transform-object-rest-spread' ]
   });

   if (libs) {
      return b
         .require(dependencies)
         .require(additionalDependencies);
   } else {
      return b
         .external(dependencies)
         .external(additionalDependencies);
   }
}

function getSourceMapName(fn) {
   return fn + '.map';
}

function bundleBrowserify(b, dstName) {
   return b
      .bundle()
      .on('error', notify.onError())
      .pipe(gulpif(!argv.release, exorcist(getSourceMapName(paths.dst + dstName))))
      .pipe(source(dstName))
      .pipe(buffer())
      .pipe(gulpif(argv.release, uglify()))
      .pipe(gulp.dest(paths.dst));
}

function runBrowserify(b) {
   return bundleBrowserify(b, paths.app)
      .pipe(browserSync.stream({ once: true }));
}

function runLess() {
   return gulp.src(lessPaths.src)
      .pipe(gulpif(!argv.release, sourcemaps.init()))
      .pipe(less())
      .on('error', notify.onError())
      .pipe(gulpif(argv.release, minifyCSS()))
      .pipe(rename(lessPaths.dstName))
      .pipe(gulpif(!argv.release, sourcemaps.write()))
      .pipe(gulp.dest(lessPaths.dst));
}

gulp.task('libs', function() {
   return bundleBrowserify(createBrowserify(true), paths.libs);
});

gulp.task('serve', function() {
   browserSync({
      proxy: 'http://localhost:61712/',
      open: false,
      host: '192.168.1.2',
      ghostMode: false,
   });
});

gulp.task('javascript', function() {
   return runBrowserify(createBrowserify());
});

gulp.task('less', function() {
   return runLess();
});

gulp.task('watchify', function() {
   var b = watchify(createBrowserify());
   var shouldNotify = false;
   b.on('update', rebundle).on('time', time => shouldNotify && notify().write('Done in ' + (time / 1000).toFixed(1) + ' seconds'));
   return runBrowserify(b);

   function rebundle() {
      shouldNotify = true;
      return runBrowserify(b)
   }
});

gulp.task('clean', function(cb) {
   var all = [
      paths.dst + paths.app,
      getSourceMapName(paths.dst + paths.app),
      paths.dst + paths.libs,
      getSourceMapName(paths.dst + paths.libs),
      lessPaths.dst + lessPaths.dstName,
   ];

   var unlink = fn => new Promise((resolve, reject) => fs.unlink(fn, resolve));

   Promise.all(all.map(p => unlink(p))).then(() => cb());
});

gulp.task('watch', [ 'clean', 'libs', 'watchify', 'serve', 'less' ], function() {
   watch(lessPaths.watch, () => runLess().pipe(browserSync.stream()));
});

gulp.task('default', [ 'clean', 'libs', 'javascript', 'less' ]);
