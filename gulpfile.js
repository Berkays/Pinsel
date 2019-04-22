'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var minify = require('gulp-clean-css');
var uglify = require('gulp-uglify-es').default;
const image = require('gulp-image');
var browserify = require('browserify');
var rename = require('gulp-rename');
var path = require('path');

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var glob = require('glob')
var merge = require('merge-stream');

var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var clean = require('gulp-clean');
var cache = require('gulp-cached');

const fs = require('fs')

const base_path = './public/src/';
const dist_path = './public/dist/';

const reload = () => {
    browserSync.reload();
    return;
};

const compiled_assets = {
    less: './public/src/stylesheets/*.less',
    less_entry: './public/src/stylesheets/style.less',
    js: './public/src/scripts/**/*.js',
    pug: './views/*.pug',
    image: './public/src/images/**/*'
};

const moved_assets = './public/src/config/**/*';

const _move = () => {
    return gulp.src(moved_assets, { base: base_path })
        .pipe(cache('move'))
        .pipe(gulp.dest(dist_path))
};

const _js = () => {
    var files = glob.sync(compiled_assets.js);
    console.log("Browserify:")
    console.log(files);
    var tasks = files.map(function (entry) {
        var dir = path.relative(base_path, entry);
        dir = path.dirname(dir);

        return browserify({ entries: [entry] })
            .bundle().on('error', (error) => console.error(error))
            .pipe(source(entry))
            .pipe(buffer())
            // .pipe(uglify())
            .on('error', function (err) { console.log(err) })
            .pipe(rename({ dirname: dir }))
            .pipe(gulp.dest(dist_path))
    });
    return merge(tasks).on('end', () => {
        browserSync.reload();
    });
};

const _js_watch = (entry) => {
    entry = './' + entry;
    entry = entry.replace(/\\/g, '/');
    console.log(entry);

    var dir = path.relative(base_path, entry);
    dir = path.dirname(dir);

    browserify({ entries: entry })
        .bundle().on('error', (error) => console.error(error))
        .pipe(source(entry))
        .pipe(cache('js'))
        //.pipe(buffer())
        //.pipe(uglify())
        .pipe(rename({ dirname: dir }))
        .pipe(gulp.dest(dist_path))
        .pipe(browserSync.reload({ stream: true }));
};

const _less = () => {
    return gulp.src(compiled_assets.less_entry, { base: base_path })
        .pipe(less()).on('error', (error) => console.error(error)) // compile to css
        .pipe(minify()).on('error', (error) => console.error(error)) // minify
        .pipe(gulp.dest(dist_path)) // output
        .pipe(browserSync.reload({ stream: true })); // reload on change
};

const _image = () => {
    return gulp.src(compiled_assets.image, { base: base_path })
        // .pipe(cache('image'))
        .pipe(image()).on('error', (error) => console.error(error))
        .pipe(gulp.dest(dist_path))
        .pipe(browserSync.reload({ stream: true }));
};


const _watch = () => {
    gulp.watch("./public/src/**/*").on('unlink', (file) => {
        var filePathFromSrc = path.relative(path.resolve('src'), file);
        var destFilePath = path.resolve('src', filePathFromSrc);

        destFilePath = destFilePath.replace('src', 'dist');
        console.log("Deleting: " + destFilePath);
        if (fs.existsSync(destFilePath)) {
            fs.unlinkSync(destFilePath);
        }
    });
    gulp.watch(compiled_assets.js).on('change', _js_watch);
    gulp.watch(compiled_assets.less, gulp.series(_less));
    gulp.watch(compiled_assets.image, gulp.series(_image));
    gulp.watch(moved_assets, gulp.series(_move));
    gulp.watch(compiled_assets.pug).on('change', () => {
        reload();
    });

}


const _server = (cb) => {
    var started = false;
    return nodemon({
        script: './bin/www',
        ignore: ['*.js'],
        env: { 'NODE_ENV': 'development' }
    }).on('start', () => {
        if (!started) {
            cb();
            started = true;

            browserSync.init(null, {
                proxy: "http://localhost:3000",
                port: 3001
            });
        }
    });
};

const _clean = () => {
    return gulp.src(dist_path, { read: false, allowEmpty: true })
        .pipe(clean());
};

gulp.task('clean', gulp.series(_clean));
gulp.task('build', gulp.parallel(_js, _less, _image, _move));
gulp.task('watch', _watch)
gulp.task('sync', gulp.series('build', gulp.parallel(_server, 'watch')));
gulp.task('serve', gulp.parallel(_server, 'watch'));
