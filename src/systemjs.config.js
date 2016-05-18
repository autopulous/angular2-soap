'use strict';

System.config({
    map: { // tell the System loader where to look for things
        '@angular': 'node_modules/@angular',

        'rxjs': 'node_modules/rxjs'
    },
    packages: { // tell the System loader how to load when no filename and/or no extension
        '@angular/common': {main: 'index.js', defaultExtension: 'js'},
        '@angular/compiler': {main: 'index.js', defaultExtension: 'js'},
        '@angular/core': {main: 'index.js', defaultExtension: 'js'},
        '@angular/http': {main: 'index.js', defaultExtension: 'js'},
        '@angular/platform-browser': {main: 'index.js', defaultExtension: 'js'},
        '@angular/platform-browser-dynamic': {main: 'index.js', defaultExtension: 'js'},
        '@angular/router': {main: 'index.js', defaultExtension: 'js'},
        '@angular/upgrade': {main: 'index.js', defaultExtension: 'js'},

        'rxjs': {defaultExtension: 'js'}
    }
});