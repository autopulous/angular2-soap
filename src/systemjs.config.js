'use strict';

System.config({
    // tell the SystemJS loader where to look for packages and components

    map: {
        'application': '.',
        '@angular': 'vendor/@angular',
        'rxjs': 'vendor/rxjs'
    },

    // tell the SystemJS loader how to load when no filename and/or no extension

    packages: {
        'application': {defaultExtension: 'js'},
        '@angular/common': {main:'index.js', defaultExtension: 'js'},
        '@angular/compiler': {main:'index.js', defaultExtension: 'js'},
        '@angular/core': {main:'index.js', defaultExtension: 'js'},
        '@angular/http': {main:'index.js', defaultExtension: 'js'},
        '@angular/platform-browser': {main:'index.js', defaultExtension: 'js'},
        '@angular/platform-browser-dynamic': {main:'index.js', defaultExtension: 'js'},
        '@angular/upgrade': {main:'index.js', defaultExtension: 'js'},
        'rxjs': {defaultExtension: 'js'}
    }
});