'use strict';

module.exports = function (config) {
    config.set({
        basePath: '.',

        files: [
            // paths loaded via Angular's component compiler (these paths will be rewritten, see proxies section)
            {pattern: 'app/**/*.html', included: false},
            {pattern: 'app/**/*.css', included: false},

            // paths loaded by Karma
            'node_modules/angular2/bundles/angular2-polyfills.js',
            'node_modules/systemjs/dist/system.src.js',
            'node_modules/rxjs/bundles/Rx.js',
            'node_modules/angular2/bundles/angular2.dev.js',
            'node_modules/angular2/bundles/testing.dev.js',

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