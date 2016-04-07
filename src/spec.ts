/// <reference path="../node_modules/angular2/typings/browser.d.ts"/>
/// <reference path="../typings/main/ambient/jasmine/jasmine.d.ts"/>

import {it, describe, expect, beforeEach, inject} from 'angular2/testing';

describe('Sanity unit test', () => {
    it('Should believe that true is true', () => {
        expect(true).toEqual(true);
    });
});