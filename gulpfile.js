'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minify = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var streamify = require('gulp-streamify');
const image = require('gulp-image');
var browserify = require('browserify');
var rename = require('gulp-rename');
var path = require('path');

var source = require('vinyl-source-stream');
var glob = require('glob')
var es = require('event-stream');

var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var clean = require('gulp-clean');
var cache = require('gulp-cached');

const base_path = './public/src/';
const dist_path = './public/dist/';

const compiled_assets = {
    css: './public/src/stylesheets/**/*.css',
    less_css: './public/src/stylesheets/**/*.less',
    js: './public/src/scripts/**/*.js',
    images: './public/src/images/*'
};

const moved_assets = [
    './public/src/**/*.json'
];

const _move = () => {
    return gulp.src(moved_assets, { base: base_path })
        .pipe(cache('move'))
        .pipe(gulp.dest(dist_path))
};

const _js = (done) => {
    return glob(compiled_assets.js, { matchBase: false }, function (err, files) {
        if (err) done(err);

        var tasks = files.map(function (entry) {
            var dir = path.relative(base_path, entry);
            dir = path.dirname(dir);

            return browserify({ entries: [entry] })
                .bundle().on('error', (error) => console.error(error))
                .pipe(source(entry))
                .pipe(cache('js'))
                //.pipe(streamify(uglify()))
                .pipe(rename({ dirname: dir }))
                .pipe(gulp.dest(dist_path));
        });
        es.merge(tasks).on('end', done);
    });
};

const _less = () => {
    return gulp.src(compiled_assets.less_css, { base: base_path })
        .pipe(cache('less'))
        .pipe(less()).on('error', (error) => console.error(error)) // compile to css
        .pipe(minify()).on('error', (error) => console.error(error)) // minify
        .pipe(gulp.dest(dist_path)) // output
        .pipe(browserSync.reload({ stream: true })); // reload on change
};

const _css = () => {
    return gulp.src(compiled_assets.css, { base: base_path })
        .pipe(cache('css'))
        .pipe(minify()).on('error', (error) => console.error(error)) // minify
        .pipe(gulp.dest(dist_path)) // output
        .pipe(browserSync.reload({ stream: true })); // reload on change
};

const _image = () => {
    return gulp.src(compiled_assets.images, { base: base_path })
        .pipe(cache('image'))
        .pipe(image()).on('error', (error) => console.error(error))
        .pipe(gulp.dest(dist_path));
};

const _server = (cb) => {
    var started = false;
    return nodemon({
        script: 'server.js',
        ignore: ['!(server.js)'],
        env: { 'NODE_ENV': 'development' }
    }).on('start', () => {
        if (!started) {
            cb();
            started = true;

            browserSync.init(null, {
                proxy: "http://localhost:3000",
                files: [
                    //"public/dist/**/*.*",
                    "views/*.pug"],
                port: 3001
            });

            gulp.watch('public/src/**/*.*', gulp.series('build'));
        }
    });
};

const _clean = () => {
    return gulp.src(dist_path, { read: false, allowEmpty: true })
        .pipe(clean());
};

gulp.task('clean', gulp.series(_clean));
gulp.task('build', gulp.parallel(_js, _less, _css, _image, _move));
gulp.task('sync', _server);
