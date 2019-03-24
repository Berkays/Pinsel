'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minify = require('gulp-clean-css');
var uglify = require('gulp-uglify');
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

const watched = Object.values(compiled_assets);

const _move = () => {
    return gulp.src(moved_assets, { base: base_path })
        .pipe(cache('move'))
        .pipe(gulp.dest(dist_path))
};

const _js = (done) => {
    return glob(compiled_assets.js, { matchBase: false}, function (err, files) {
        if (err) done(err);

        var tasks = files.map(function(entry) {
        var dir = path.relative(base_path,entry);
        dir = path.dirname(dir);

        return browserify({ entries: [entry] })
            .bundle()
            .pipe(cache('js'))
            .pipe(source(entry))
            .pipe(rename({ dirname: dir }))
            .pipe(gulp.dest(dist_path));
        });
    es.merge(tasks).on('end',done);
    });
};

const _less = () => {
    return gulp.src(compiled_assets.less_css, { base: base_path })
        .pipe(cache('less'))
        .pipe(less()) // compile to css
        .pipe(minify()) // minify
        .pipe(gulp.dest(dist_path)) // output
        .pipe(browserSync.reload({ stream: true })); // reload on change
};

const _css = () => {
    return gulp.src(compiled_assets.css, { base: base_path })
        .pipe(cache('css'))
        .pipe(minify()) // minify
        .pipe(gulp.dest(dist_path)) // output
        .pipe(browserSync.reload({ stream: true })); // reload on change
};

const _image = () => {
    return gulp.src(compiled_assets.images, { base: base_path })
        .pipe(cache('image'))
        .pipe(image())
        .pipe(gulp.dest(dist_path));
};

const _nodemon = () => {
    return nodemon({
        script: 'server.js',
        env: { 'NODE_ENV': 'development' }
    });
};

const _browsersync = () => {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: [
            // "public/dist/**/*.*",
            "views/*.pug"],
        port: 3001
    });
    gulp.watch(watched, gulp.parallel('build'));
};

const _clean = () => {
    return gulp.src(dist_path, { read: false, allowEmpty: true })
        .pipe(clean());
};

gulp.task('clean', gulp.series(_clean));
gulp.task('build', gulp.parallel(_js, _less, _css, _image, _move));
gulp.task('sync', gulp.series(_clean, 'build', gulp.parallel(_nodemon, _browsersync)));
