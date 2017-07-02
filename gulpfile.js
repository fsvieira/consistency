var gulp = require('gulp');
var gutil = require('gulp-util');
var es = require('event-stream');

var bower = require('bower');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var sh = require('shelljs');

var packageJSON  = require('./package');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var htmlhint = require("gulp-htmlhint");
var csslint = require('gulp-csslint');
var obfuscate = require('gulp-obfuscate');

var del = require('del');
var webmake = require('gulp-webmake');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var optipng = require('imagemin-optipng');

var electron = require('gulp-electron');
var packageJson = require('./package.json');

var jshintConfig = packageJSON.jshintConfig;
jshintConfig.lookup = false;

/* TODO: clean up tasks:
  - Dev mode,
  - Dist mode
*/

/* build commands */
gulp.task('js:dev:build', function(){
	return gulp.src([
		'www-dev/js/app.dev.js',
	])
		.pipe(webmake())
		.pipe(rename("app.bundle.js"))
		.pipe(gulp.dest('www-dev/js/'));
});

gulp.task('watch', ['check:www', 'dev:www'], function() {
  gulp.watch(['www-dev/**/*', '!www-dev/js/app.bundle.js'], ['dev:www']);
});

gulp.task('watch:android', ['android-dev'], function() {
  gulp.watch(['www-dev/**/*', '!www-dev/js/app.bundle.js'], ['android-dev']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

gulp.task('check:www', function() {
	var js = gulp.src([
		'www-dev/**/*.js',
		'!www-dev/js/libs/*.js',
		'!www-dev/lib/**/*',
		'!www-dev/js/app.bundle.js'
	])
		.pipe(jshint(jshintConfig))
		.pipe(jshint.reporter('checkstyle'))
		.pipe(jshint.reporter('fail'))
		.pipe(jscs(packageJSON.jscsConfig));

	var html = gulp.src(["www-dev/**/*.html", '!www-dev/lib/**/*'])
		.pipe(htmlhint());
	
	var css = gulp.src(["www-dev/**/*.css", '!www-dev/lib/**/*'])
		.pipe(csslint(packageJSON.cssConfig))
		.pipe(csslint.reporter());

	return es.merge(js, html, css);

});

gulp.task('build', function(){
	return gulp.src([
		'www-dev/js/app.js',
	])
		.pipe(webmake())
		.pipe(rename("app.bundle.js"))
		.pipe(gulp.dest('www-dev/js/'));
});

gulp.task('clean:www', function (cb) {
	del(['www/*'], cb);
});

gulp.task('dev:android', ['build'], function () {
	
	var cp = gulp.src([
		'www-dev/**/*.{html,css}',
		'!www-dev/res/**/*',
		'!www-dev/lib/**/*'
	])
		.pipe(gulp.dest('www/'));
		
	var js = gulp.src([
		'www-dev/js/app.bundle.js',
	])
	.pipe(gulp.dest('www/js/'));
		
	return es.merge(cp, js);

});


gulp.task('dev:www', ['js:dev:build'], function () {
	
	var cp = gulp.src([
		'www-dev/**/*.{html,css}',
		'!www-dev/res/**/*',
		'!www-dev/lib/**/*'
	])
		.pipe(gulp.dest('www/'));
		
	var js = gulp.src([
		'www-dev/js/app.bundle.js',
	])
		.pipe(concat('app.bundle.js'))
		.pipe(gulp.dest('www/js/'));
		
	return es.merge(cp, js);

});

gulp.task('dev:desktop', ['js:dev:build'], function () {
	
	var cp = gulp.src([
		'www-dev/**/*.{html,css}',
		'www-dev/js/app.electron.js',
		'!www-dev/res/**/*',
		'!www-dev/lib/**/*'
	])
		.pipe(gulp.dest('desktop/'));
		
	var js = gulp.src([
		'www-dev/js/app.bundle.js',
	])
		.pipe(concat('app.bundle.js'))
		.pipe(gulp.dest('desktop/js/'));
		
	return es.merge(cp, js);

});

gulp.task('dist:www', ['check:www', 'clean:www', 'build'], function () {
	var js = gulp.src([
		'www-dev/js/app.bundle.js', 
	])
		.pipe(uglify())
		.pipe(gulp.dest('www/js/'));
	
	var ionicJS = gulp.src([
		'www-dev/lib/ionic/js/ionic.bundle.js',
	])
		.pipe(uglify())
		.pipe(gulp.dest('www/lib/ionic/js/'));
	
	var css = gulp.src([
		'www-dev/**/*.css', 
		'!www-dev/**/*.min.css',
		'!www-dev/lib/angular/*'
	])
		.pipe(minifyCSS())
		.pipe(gulp.dest('./www/'));

	var index = gulp.src([
		'www-dev/index.html' 
	])
		.pipe(minifyHTML())
		.pipe(gulp.dest('./www/'));

	var html = gulp.src([
		'www-dev/templates/**/*.html' 
	])
		.pipe(minifyHTML())
		.pipe(gulp.dest('./www/templates/'));

	var images = gulp.src([
		'www-dev/img/**/*.png',
	])
		.pipe(optipng({optimizationLevel: 3})())
		.pipe(gulp.dest('www/img/'));

	var res = gulp.src([
		'www-dev/res/**/*.png',
	])
		.pipe(optipng({optimizationLevel: 3})())
		.pipe(gulp.dest('www/res/'));

	var res2 = gulp.src([
		'www-dev/res/**/*.{gif,json,mp3,json.bz2}',
		'www-dev/res/*.mp4',
	])
		.pipe(gulp.dest('www/res/'));
	
	var gifs = gulp.src([
		'www-dev/img/**/*.gif',
	])
		.pipe(gulp.dest('www/img/'));
	
	var fonts = gulp.src([
		'www-dev/lib/ionicons/fonts/ionicons.{ttf,woff}',
	])
		.pipe(gulp.dest('www/lib/ionicons/fonts/'));

	return es.merge(js, ionicJS, css, index, html, images, res, res2, gifs, fonts);

});

gulp.task('android-dev', ["dev:android"], function (done) {
	sh.exec('cordova run android');
	done();
});


gulp.task('desktop', function() {
 
    gulp.src("")
    .pipe(electron({
        src: './desktop',
        packageJson: packageJson,
        release: './release',
        cache: './cache',
        version: 'v1.6.2',
        packaging: true,
        // token: 'abc123...',
        platforms: ['win32-ia32', 'darwin-x64', 'linux-x64'],
        platformResources: {
            darwin: {
                CFBundleDisplayName: packageJson.name,
                CFBundleIdentifier: packageJson.name,
                CFBundleName: packageJson.name,
                CFBundleVersion: packageJson.version,
                // icon: 'gulp-electron.icns'
            },
            win: {
                "version-string": packageJson.version,
                "file-version": packageJson.version,
                "product-version": packageJson.version,
                "icon": 'resources/icon.ico'
            },
            linux: {
			}
        }
    }))
    .pipe(gulp.dest(""));
});


