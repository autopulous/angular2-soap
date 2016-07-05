'use strict';

module.exports = function (config) {
    config.set({
        basePath: './',

        files: [
            // paths loaded by Karma
            {pattern: 'node_modules/es6-shim/es6-shim.js', included: true, watched: false},
            {pattern: 'node_modules/zone.js/dist/zone.js', included: true, watched: false},
            {pattern: 'node_modules/reflect-metadata/Reflect.js', included: true, watched: false},

            {pattern: 'node_modules/rxjs/**/*.js', included: false, watched: false},
            {pattern: 'node_modules/@angular/**/*.js', included: false, watched: false},

            {pattern: 'node_modules/systemjs/dist/system.src.js', included: true, watched: false},
            {pattern: 'node_modules/autopulous-xdom/xdom.js', included: true, watched: false},
            {pattern: 'node_modules/autopulous-xdom2jso/xdom2jso.js', included: true, watched: false},

            {pattern: 'src/systemjs.config.js', included: true, watched: false},

            // shim
            {pattern: 'src/karma.@angular.shim.js', included: true, watched: false},

            // paths loaded via module imports
            {pattern: 'dist/**/*.js', served: true, included: false, watched: true},

            // paths to support debugging with source maps in dev tools
            {pattern: 'src/**/*.ts', included: false, watched: false},
            {pattern: 'map/**/*.js.map', included: false, watched: false}
        ],

        // proxied base paths
        proxies: {
            // required for component assets fetched by Angular
            '/vendor/': '/base/node_modules/'
        },

        autoWatch: true,

        logLevel: config.LOG_DEBUG,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-spec-reporter'],

        reporters: ["spec"],

        specReporter: {
            maxLogLines: 50,
            suppressFailed: false,
            suppressPassed: false,
            suppressSkipped: false,
            suppressErrorSummary: true
        }
    });
};

console.log('Reminder: if no tests ran, make sure that those were built and that the karma.@angular.shim.js file is in the app/ directory');
console.log('');