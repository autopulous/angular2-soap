'use strict';

Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

__karma__.loaded = function () {}; // Prevent Karma's synchronous start

System.config({
    packages: {
        'base/app': {
            defaultExtension: false,
            format: 'register',
            map: Object.keys(window.__karma__.files).filter(onlyApplicationFiles).reduce(function createPathRecords(pathMap, applicationPath) {
                // creates local module name mapping to global path with karma's fingerprint in path
                var moduleName = applicationPath.replace(/^\/base\/app\//, './').replace(/\.js$/, '');
                pathMap[moduleName] = applicationPath + '?' + window.__karma__.files[applicationPath];
                return pathMap;
            }, {})
        }
    }
});

Promise.all(
    Object.keys(window.__karma__.files) // All files served by Karma.
        .filter(onlyTestFiles)
        .map(function (moduleName) {
            return System.import(moduleName); // loads all spec files via their global module names
        }))
    .then(function () {
        __karma__.start();
    }, function (error) {
        __karma__.error(error.stack || error);
    });

function onlyApplicationFiles(filePath) {
    if (/\/base\/app\/(?!.*spec\.js$).*\.js$/.test(filePath)) console.log("Component filePath: " + filePath);
    return /\/base\/app\/(?!.*spec\.js$).*\.js$/.test(filePath);
}

function onlyTestFiles(filePath) {
    if (/spec\.js$/.test(filePath)) console.log("Test filePath: " + filePath);
    return /spec\.js$/.test(filePath);
}