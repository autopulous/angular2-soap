'use strict';

module.exports = function (config) {
    config.set({
        basePath: '.',

        files: [
            // paths loaded by Karma
            'node_modules/systemjs/dist/system-polyfills.js',
            'node_modules/es6-shim/es6-shim.min.js',
            'node_modules/angular2/es6/dev/src/testing/shims_for_IE.js',
            'node_modules/angular2/bundles/angular2-polyfills.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/rxjs/bundles/Rx.js',
            'node_modules/angular2/bundles/angular2.dev.js',
            'node_modules/angular2/bundles/router.dev.js',
            'node_modules/angular2/bundles/http.js',
            'node_modules/angular2/bundles/testing.dev.js',
            'node_modules/autopulous-xdom/xdom.js',
            'node_modules/autopulous-xdom2jso/xdom2jso.js',

            // shim
            'app/karma.angular2.shim.js',

            // paths loaded via module imports
            {pattern: 'app/**/!(spec).js', served:true, included: false},
            {pattern: 'app/**/spec.js', served:true, included: false},

            // paths to support debugging with source maps in dev tools
            {pattern: 'src/**/*.ts', included: false, watched: false},
            {pattern: 'map/**/*.js.map', included: false, watched: false}
        ],

        // proxied base paths
        proxies: {
            // required for component assets fetched by Angular
            '/src/': '/base/src/'
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

console.log('Reminder: if no tests ran, make sure that those were built and that the karma.angular2.shim.js file is in the app/ directory');
console.log('');