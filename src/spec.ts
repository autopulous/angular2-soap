/// <reference path="../node_modules/angular2/typings/browser.d.ts"/>
/// <reference path="../typings/main/ambient/jasmine/jasmine.d.ts"/>

import {it, describe, expect, beforeEach, inject} from 'angular2/testing';
import {SoapService} from "./soap.service";

describe('soap service unit tests)', () => {
    describe('Prove that the tests are wired correctly', () => {
        it('Should prove that these tests are executing by verifying that true equals true', () => {
            expect(true).toEqual(true);
        });
    });

    describe('Prove that user interface elements are populating', () => {
        let soap:SoapService = new SoapService(80, "serviceRoot", "targetNamespace");

        it('Should not throw any excetions when setting configuration parameters', () => {
            soap.setMode(true);
            soap.setMethodSuffixes('request', 'response');
            soap.setCredentials('john.hart@vertexinc.com', '1q1q1q1q');
            soap.setEndpoint(80, "serviceRoot");
        });
    });
});