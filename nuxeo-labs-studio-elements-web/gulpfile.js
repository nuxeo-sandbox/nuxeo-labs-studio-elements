'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var gulpPlugins = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var merge = require('merge-stream');
var path = require('path');
var fs = require('fs');
var glob = require('glob');
var historyApiFallback = require('connect-history-api-fallback');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var APP = 'src/main/app',
    DIST = 'target/classes/nuxeo.war/nuxeo-labs-studio-elements';

var styleTask = function (stylesPath, srcs) {
  return gulp.src(srcs.map(function(src) {
      return path.join(APP, stylesPath, src);
    }))
    .pipe(gulpPlugins.changed(stylesPath, {extension: '.css'}))
    .pipe(gulpPlugins.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/' + stylesPath))
    .pipe(gulpPlugins.if('*.css', gulpPlugins.minifyCss()))
    .pipe(gulp.dest(DIST + '/' + stylesPath))
    .pipe(gulpPlugins.size({title: stylesPath}));
};

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
  return styleTask('styles', ['**/*.css']);
});

gulp.task('elements', function () {
  return styleTask('elements', ['**/*.css']);
});

// Lint JavaScript
gulp.task('jshint', function () {
  return gulp.src([
      APP + '/scripts/app.js',
      APP + '/elements/**/*.js',
      APP + '/elements/**/*.html'
    ])
    .pipe(reload({stream: true, once: true}))
    .pipe(gulpPlugins.jshint.extract()) // Extract JS from .html files
    .pipe(gulpPlugins.jshint())
    .pipe(gulpPlugins.jshint.reporter('jshint-stylish'))
    .pipe(gulpPlugins.if(!browserSync.active, gulpPlugins.jshint.reporter('fail')));
});

// Optimize Images
gulp.task('images', function () {
  return gulp.src(APP + '/images/**/*')
    .pipe(gulpPlugins.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(DIST + '/images'))
    .pipe(gulpPlugins.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function () {
  var app = gulp.src([APP + '/*'], {
    dot: true
  }).pipe(gulp.dest(DIST));


  var bower = gulp.src([
    'bower_components/**/*'
  ]).pipe(gulp.dest(DIST + '/bower_components'));

  var elements = gulp.src([APP + '/elements/**/*.html'])
    .pipe(gulp.dest(DIST + '/elements'));

  //var swBootstrap = gulp.src(['bower_components/platinum-sw/bootstrap/*.js'])
  //  .pipe(gulp.dest('dist/elements/bootstrap'));

  //var swToolbox = gulp.src(['bower_components/sw-toolbox/*.js'])
  //    .pipe(gulp.dest('dist/sw-toolbox'));

  var vulcanized = gulp.src([APP + '/elements/elements.html'])
    .pipe(gulpPlugins.rename('elements.vulcanized.html'))
    .pipe(gulp.dest(DIST + '/elements'));

  return merge(app, bower, elements, vulcanized)
    .pipe(gulpPlugins.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src([APP + '/fonts/**'])
    .pipe(gulp.dest(DIST + '/fonts'))
    .pipe(gulpPlugins.size({title: 'fonts'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  return gulp.src([APP +'/**/*.html', '!' + APP + '/{elements,test}/**/*.html'])
    // Replace path for vulcanized assets
    .pipe(gulpPlugins.if('*.html', gulpPlugins.replace('elements/elements.html', 'elements/elements.vulcanized.html')))
    // Concatenate And Minify JavaScript
    .pipe(gulpPlugins.if('*.js', gulpPlugins.uglify({preserveComments: 'some'})))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe(gulpPlugins.if('*.css', gulpPlugins.minifyCss()))
    .pipe(gulpPlugins.useref())
    // Minify Any HTML
    .pipe(gulpPlugins.if('*.html', gulpPlugins.minifyHtml({
      quotes: true,
      empty: true,
      spare: true
    })))
    // Output Files
    .pipe(gulp.dest(DIST))
    .pipe(gulpPlugins.size({title: 'html'}));
});

// Vulcanize imports
gulp.task('vulcanize', function () {
  var DEST_DIR = DIST + '/elements';

  return gulp.src(DIST + '/elements/elements.vulcanized.html')
    .pipe(gulpPlugins.vulcanize({
      dest: DEST_DIR,
      strip: true,
      inlineCss: true,
      inlineScripts: true
    }))
    .on( "error", function( err ) {
       console.log( err );
    })
    .pipe(gulp.dest(DEST_DIR))
    .pipe(gulpPlugins.size({title: 'vulcanize'}));
});

// Delete all unnecessary bower dependencies
gulp.task('dist:bower', function (cb) {
  del([
    DIST + '/bower_components/**/*',
    '!' + DIST + '/bower_components/jquery',
    '!' + DIST + '/bower_components/jquery/dist',
    '!' + DIST + '/bower_components/jquery/dist/jquery.min.js',
    '!' + DIST + '/bower_components/moment',
    '!' + DIST + '/bower_components/moment/min',
    '!' + DIST + '/bower_components/moment/min/moment-with-locales.min.js',  
    '!' + DIST + '/bower_components/webcomponentsjs',
    '!' + DIST + '/bower_components/webcomponentsjs/webcomponents-lite.min.js'
  ], cb);
});

// Generate a list of files that should be precached when serving from 'dist'.
// The list will be consumed by the <platinum-sw-cache> element.
gulp.task('precache', function (callback) {
  var dir = DIST;

  glob('{elements,scripts,styles}/**/*.*', {cwd: dir}, function(error, files) {
    if (error) {
      callback(error);
    } else {
      files.push('index.html', './', 'bower_components/webcomponentsjs/webcomponents-lite.min.js');
      var filePath = path.join(dir, 'precache.json');
      fs.writeFile(filePath, JSON.stringify(files), callback);
    }
  });
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', DIST]));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles', 'elements', 'images'], function () {
  // setup our local proxy
  var proxyOptions = require('url').parse('https://localhost:8443/nuxeo');
  proxyOptions.route = '/nuxeo';
  browserSync({
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
   // https: true,
    server: {
      baseDir: ['.tmp', APP],
      middleware: [ require('proxy-middleware')(proxyOptions) ],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch([APP + '/**/*.html'], reload);
  gulp.watch([APP + '/styles/**/*.css'], ['styles', reload]);
  gulp.watch([APP + '/elements/**/*.css'], ['elements', reload]);
  gulp.watch([APP + '/{scripts,elements}/**/*.js'], ['jshint']);
  gulp.watch([APP + '/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    //https: true,
    server: DIST,
    middleware: [ historyApiFallback() ]
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence(
    ['copy', 'styles'],
    'elements',
    ['images', 'fonts', 'html'],
    'vulcanize', 'dist:bower',
    cb);
    // Note: add , 'precache' , after 'vulcanize', if your are going to use Service Worker
});

// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}
