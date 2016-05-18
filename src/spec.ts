///<reference path="../node_modules/angular2-in-memory-web-api/typings/browser.d.ts"/>

import {it, describe, expect, beforeEach, beforeEachProviders, inject, injectAsync} from '@angular/core/testing';

import {SoapService} from "./soap.service";

var method:string = 'ExecuteLogin';
var requestRoot:string = `ExecuteLoginRequest`;
var responseRoot:string = `ExecuteLoginResponse`;

var servicePort:string = 'http://172.16.62.123:8091';
var serviceRoot:string = '/vertex-enterprise-ws/ws/';
var targetNamespace:string = 'http://www.vertexinc.com/gto/schema/definitions';

var username:string = 'info@vertexSMB.com';
var password:string = 'OKMzaq123*()';

var soapService:SoapService = null;

var responseJso:{} = null;
var responseXml:NodeListOf<Element> = null;

describe('SOAP SERVICE: unit tests', () => {
    describe('Prove that the unit tests are wired correctly', () => {
        it('Should prove that these tests are executing by verifying that true equals true', () => {
            expect(true).toEqual(true);
        });
    });

    describe('Prove that the service is instantiated correctly', () => {
        it('Should not throw any exceptions when setting configuration parameters', () => {
            soapService = new SoapService(servicePort, serviceRoot, targetNamespace);
            soapService.envelopeBuilder = envelopeBuilder;
            soapService.xmlResponseHandler = (response:NodeListOf<Element>) => {responseXml = response};
            soapService.jsoResponseHandler = (response:{}) => {responseJso = response};
            soapService.testMode = true;
            soapService.testMode = false;
            soapService.debugMode = true;
            soapService.debugMode = false;
            soapService.localNameMode = true;
            soapService.localNameMode = false;
        });
    });

    describe('Prove that SOAP requests work', () => {
        it('Should be able to gat a SOAP webservice response', () => {
            soapService = new SoapService(servicePort, serviceRoot);
            soapService.testMode = true;
            soapService.localNameMode = false;
            soapService.envelopeBuilder = envelopeBuilder;
            soapService.xmlResponseHandler = (response:NodeListOf<Element>) => {responseXml = response};
            soapService.jsoResponseHandler = (response:{}) => {responseJso = response};

            executeLogin(soapService, username, password);

            expect(responseXml).not.toBeNull();
            expect(responseJso).not.toBeNull();
        });

        it('Should be able to get a namespace stripped the SOAP webservice response', () => {
            soapService = new SoapService(servicePort, serviceRoot, targetNamespace);
            soapService.testMode = true;
            soapService.localNameMode = true;
            soapService.envelopeBuilder = envelopeBuilder;
            soapService.xmlResponseHandler = (response:NodeListOf<Element>) => {responseXml = response};
            soapService.jsoResponseHandler = (response:{}) => {responseJso = response};

            executeLogin(soapService, username, password);

            expect(responseXml).not.toBeNull();
            expect(responseJso).not.toBeNull();
        });
    });
});

function envelopeBuilder(requestBody:string):string {
    var soapRequest:string =
        "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
        "<SOAP-ENV:Header>" +
        "<wsse:Security SOAP-ENV:mustUnderstand=\"1\" xmlns:wsse=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" soapenv =\"http://schemas.xmlsoap.org/soap/envelope/\">" +
        "<wsse:UsernameToken wsu:ld=\"UsernameToken-104\" xmlns:wsu=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\" >" +
        "<wsse:Username>" + username + "</wsse:Username>" +
        "<wsse:Password Type=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText\">" + password + "</wsse:Password>" +
        "</wsse:UsernameToken>" +
        "</wsse:Security>" +
        "</SOAP-ENV:Header>" +
        "<SOAP-ENV:Body>" +
        requestBody +
        "</SOAP-ENV:Body>" +
        "</SOAP-ENV:Envelope>";

    return soapRequest;
}

function executeLogin(soapService:SoapService, username:string, password:string) {
    var parameters:any = {};

    parameters[requestRoot + ' xmlns="urn:vertexinc:enterprise:platform:security:messages:1:0"'] = executeLoginRequest(username, password);

    soapService.post(method, parameters, responseRoot);
}

function executeLoginRequest(username:string, password:string):{}[] {
    var parameters:any = {};

    parameters['RequestContext xmlns="urn:vertexinc:enterprise:platform:common:1:0"'] = requestContext();
    parameters['UserLogin xmlns="urn:vertexinc:enterprise:platform:security:1:0"'] = userLogin(username, password);

    return parameters;
}

function requestContext():{}[] {
    var parameters:any = {};

    parameters["AsOfDate"] = todayString();
    parameters['ApplicationName'] = 'VE';
    parameters['ApplicationVersion'] = '6.0.0.04.00';
    parameters['BrowserDate'] = todayString();
    parameters['BrowserTimeZoneOffset'] = new Date().getTimezoneOffset();

    return parameters;
}

function userLogin(username:string, password:string):{}[] {
    var parameters:any = {};

    parameters["UserName"] = username;
    parameters['Password'] = password;

    return parameters;
}

function todayString():string {
    return dateString(new Date());
}

function dateString(date:Date):string {
    var yyyy:string = date.getFullYear() + '';

    var month:number = date.getMonth() + 1;
    var mm:string = (10 > month ? '0' : '') + month;

    var day:number = date.getDate();
    var dd:string = (10 > day ? '0' : '') + day;

    return yyyy + '-' + mm + '-' + dd;
}