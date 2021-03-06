var gulp = require('gulp');
var jasmine = require('gulp-jasmine');
var browserify = require('browserify');
var path = require('path');
var vinylSourceStream = require('vinyl-source-stream');
var karma = require('karma');

module.exports = function (opts) {

  gulp.task('test', [
    'jasmine',
    'karma'
  ]);

  gulp.task('jasmine', [ 'tsc' ], function () {
    return gulp.src(opts.testFiles).
      pipe(jasmine({
        verbose: true,
        includeStackTrace: true
      }));
  });

  // build version of preboot to be used for karma testing
  gulp.task('karma.build', [ 'tsc' ], function () {
    var karmaEntryPoint = path.join(opts.distDir, 'test/preboot_karma');
    var browserRoot = path.join(opts.distDir, 'src/browser');
    var karmaDest = path.join(opts.distDir, 'karma');

    var b = browserify({
      entries: [karmaEntryPoint],
      basedir: browserRoot,
      browserField: false
    });

    return b.bundle().
      pipe(vinylSourceStream('preboot_karma.js')).
      pipe(gulp.dest(karmaDest));
  });

  gulp.task('karma', ['karma.build'], function (done) {
    var karmaCode = path.join(opts.distDir, 'karma/preboot_karma.js');
    var karmaConfig = {
      port: 9201,
      runnerPort: 9301,
      captureTimeout: 20000,
      growl: true,
      colors: true,
      browsers: [
        'PhantomJS'
      ],
      reporters: [
        'progress'
      ],
      plugins: [
        'karma-jasmine',
        'karma-phantomjs-launcher',
        'karma-chrome-launcher'
      ],
      frameworks: ['jasmine'],
      singleRun: true,
      autoWatch: false,
      files: [karmaCode]
    };
    
    var server = new karma.Server(karmaConfig, done);
    return server.start();
  });
};
