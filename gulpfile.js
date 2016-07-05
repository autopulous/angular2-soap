'use strict';

var gulp = require ('gulp');
var runSequence = require ('run-sequence');

var node = './node_modules';
var src = './src';
var dist = './dist';
var webapp = './webapp';

var vendor = dist + '/vendor';

gulp.task ('delete-node-modules', function () {
    return clean ([node]);
});

gulp.task ('clean', function () {
    return clean ([dist, webapp, './*.log']);
});

function clean (patterns) {
    var del = require ('del');

    console.log ('deleting: ' + patterns);
    console.log ('Note: should this fail you might have one of the directories open in the terminal');

    return del (patterns);
}

gulp.task ('compile-modules', function () {
    var typescript = require ('gulp-typescript');

    return gulp.src ([src + '/**/*.ts', '!' + src + '/**/spec*.ts', './typings.d.ts'])
    .pipe (typescript (typescript.createProject ('./tsconfig.json')))
    .pipe (gulp.dest (dist + '/'));
});

gulp.task ('compile-modules-with-maps', function () {
    var sourcemaps = require ('gulp-sourcemaps');
    var typescript = require ('gulp-typescript');

    return gulp.src ([src + '/**/*.ts', '!' + src + '/**/spec*.ts', './typings.d.ts'])
    .pipe (typescript (typescript.createProject ('./tsconfig.json')))
    .pipe (sourcemaps.init ())
    .pipe (sourcemaps.write ('./'))
    .pipe (gulp.dest (dist + '/'));
});

gulp.task ('compile-tests', function () {
    var sourcemaps = require ('gulp-sourcemaps');
    var typescript = require ('gulp-typescript');

    return gulp.src ([src + '/**/spec*.ts', './typings.d.ts'])
    .pipe (typescript (typescript.createProject ('./tsconfig.json')))
    .pipe (sourcemaps.init ())
    .pipe (sourcemaps.write ('./'))
    .pipe (gulp.dest (dist + '/'));
});

gulp.task ('compile-typings', function () {
    var sourcemaps = require ('gulp-sourcemaps');
    var typescript = require ('gulp-typescript');

    return gulp.src ([src + '/**/*.ts', '!' + src + '/**/spec*.ts', './typings.d.ts'])
    .pipe (typescript (typescript.createProject ('./tsconfig.json'))).dts
    .pipe (gulp.dest (dist + '/'));
});

gulp.task ('copy-javascript', function () {
    return gulp.src ([src + '/**/*.js', '!' + src + '/karma.@angular.shim.js', '!' + src + '/systemjs.config.js'])
    .pipe (gulp.dest (dist + '/'));
});

gulp.task ('copy-metadata', function () {
    return gulp.src (['./src/package.json', 'README.md'])
    .pipe (gulp.dest (dist + '/'));
});

/* this task must be updated to correspond to the package.json for the third-party packages (node_modules) to include in the application distribution (vendor) */

gulp.task ('copy-vendor', function () {
    gulp.src ([node + '/autopulous-xdom/**/*.js'])
    .pipe (gulp.dest (vendor + '/autopulous-xdom'));

    return gulp.src ([node + '/autopulous-xdom2jso/**/*.js'])
    .pipe (gulp.dest (vendor + '/autopulous-xdom2jso'));
});

// Do not automatically perform a 'clean' when rebuilding the tests because Karma tends to gets stuck when files that it is monitoring are deleted

gulp.task ('rebuild-test', function () {
    runSequence ('compile-modules-with-maps', 'compile-tests', 'compile-css-with-maps', ['copy-html', 'copy-javascript', 'copy-images']);
});

gulp.task ('watch-dev', function () {
    gulp.watch ([src + '/**/*.ts'], ['compile-modules']);
    gulp.watch ([src + '/**/*.ts'], ['compile-modules-with-maps']);
    gulp.watch ([src + '/**/*.scss'], ['compile-css']);
    gulp.watch ([src + '/**/*.scss'], ['compile-css-with-maps']);
    gulp.watch ([src + '/**/*.html'], ['copy-html']);
    gulp.watch ([src + '/**/*.js'], ['copy-javascript']);
    gulp.watch ([src + '/**/*.+(ico|gif|jpg|jpeg|png)'], ['copy-images']);
});

gulp.task ('default', function () {
    gulp.watch ([src + '/**/*'], ['rebuild-test']);
});