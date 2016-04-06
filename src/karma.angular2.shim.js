Error.stackTraceLimit = Infinity;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

__karma__.loaded = function () {}; // Prevent Karma's synchronous start

System.config({
    packages: {
        'base/app': {
            defaultExtension: false,
            format: 'register',
            map: Object.keys(window.__karma__.files).filter(forApplicationFiles).reduce(applicationPackageMapBuilder, {})
        }
    }
});

System.import('angular2/src/platform/browser/browser_adapter')
    .then(function (browser_adapter) {
        browser_adapter.BrowserDomAdapter.makeCurrent();
    })
    .then(function () {
        return Promise.all(resolveTestFiles());
    })
    .then(function () {
        __karma__.start();
    }, function (error) {
        __karma__.error(error.stack || error);
    });

function applicationPackageMapBuilder(applicationPackageMap, applicationFilePath) {
    var packageName = applicationFilePath.replace(/^\/base\/app\//, './').replace(/\.js$/, '');

    applicationPackageMap[packageName] = applicationFilePath + '?' + window.__karma__.files[applicationFilePath];
    return applicationPackageMap;
}

function resolveTestFiles() {
    return Object.keys(window.__karma__.files).filter(forTestFiles).map(function (packageName) {
        return System.import(packageName);
    });
}

function forApplicationFiles(filePath) {
    if (/\/base\/app\/(?!.*spec\.js$).*\.js$/.test(filePath)) console.log("Component filePath: " + filePath);

    return /\/base\/app\/(?!.*spec\.js$).*\.js$/.test(filePath);
}

function forTestFiles(filePath) {
    if (/spec\.js$/.test(filePath)) console.log("Test filePath: " + filePath);

    return /spec\.js$/.test(filePath);
}