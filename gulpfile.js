var syntax = 'scss', // Syntax: sass or scss;
	gmWatch = false; // ON/OFF GraphicsMagick watching "img/_src" folder (true/false). Linux install gm: sudo apt update; sudo apt install graphicsmagick

var gulp = require('gulp'),
	//	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	cleancss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	autoprefixer = require('gulp-autoprefixer'),
	notify = require('gulp-notify'),
	rsync = require('gulp-rsync'),
	imageResize = require('gulp-image-resize'),
	imagemin = require('gulp-imagemin'),
	del = require('del');

// Local Server
gulp.task('browser-sync', function () {
	browserSync({
		server: {
			baseDir: 'dist'
		},
		notify: false,
		// open: false,
		// online: false, // Work Offline Without Internet Connection
		// tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
	})
});

// Sass|Scss Styles
gulp.task('styles', function () {
	return gulp.src('src/' + syntax + '/**/*.' + syntax + '')
		.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
		.pipe(rename({ suffix: '.min', prefix: '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.stream())
});

// JS
gulp.task('scripts', function () {
	return gulp.src([
		'src/js/libs/jquery/jquery.min.js',
		'src/js/libs/popper/popper.min.js',
		'src/js/libs/bootstrap/bootstrap.min.js',
		'src/js/common.js', // Always at the end
	])
		.pipe(concat('scripts.min.js'))
		// .pipe(uglify()) // Mifify js (opt.)
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.reload({ stream: true }))
});

// HTML Live Reload
gulp.task('code', function () {
	return gulp.src('src/*.html')
		.pipe(gulp.dest('dist/'))
		.pipe(browserSync.reload({ stream: true }))
});

// Copy Fonts
gulp.task('copyfonts', function () {
	return gulp.src('src/fonts/**/*.{eot,svg,ttf,woff,woff2}')
		.pipe(gulp.dest('dist/fonts/'))
		.pipe(browserSync.reload({ stream: true }))
});

// Copy Favicon
gulp.task('favicon', function () {
	return gulp.src('src/img/favicon/*.{jpg,png,gif,webm,ico}')
		.pipe(gulp.dest('dist/img/favicon/'))
		.pipe(browserSync.reload({ stream: true }))
});

// Deploy
gulp.task('rsync', function () {
	return gulp.src('app/**')
		.pipe(rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
});

// Images @x1 & @x2 + Compression | Required graphicsmagick (sudo apt update; sudo apt install graphicsmagick)
gulp.task('img1x', function () {
	return gulp.src('src/img/*.*')
		.pipe(imageResize({ width: '50%' }))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/@1x/'))
});
gulp.task('img2x', function () {
	return gulp.src('src/img/*.*')
		.pipe(imageResize({ width: '100%' }))
		.pipe(imagemin())
		.pipe(gulp.dest('dist/img/@2x/'))
});

// Clean @*x IMG's
gulp.task('cleanimg', function () {
	return del(['dist/img/@*'], { force: true })
});

// TASKS____________________________________________________________________________
// Img Processing Task for Gulp 4
gulp.task('img', gulp.parallel('img1x', 'img2x'));

gulp.task('watch', function () {
	gulp.watch('src/' + syntax + '/**/*.' + syntax + '', gulp.parallel('styles'));
	gulp.watch(['js/libs/**/*.js', 'src/js/common.js'], gulp.parallel('scripts'));
	gulp.watch('src/*.html', gulp.parallel('code'));
	gulp.watch('src/fonts/**/*.*', gulp.parallel('copyfonts'));
	gulp.watch('src/img/favicon/*.{jpg,png,gif,webm,ico}', gulp.parallel('favicon'));
	gmWatch && gulp.watch('src/img/**/*', gulp.parallel('img')); // GraphicsMagick watching image sources if allowed.
});
gmWatch ? gulp.task('default', gulp.parallel('img', 'copyfonts', 'favicon', 'styles', 'scripts', 'browser-sync', 'watch'))
	: gulp.task('default', gulp.parallel('copyfonts', 'favicon', 'styles', 'scripts', 'browser-sync', 'watch'));


