/// <reference path="../node_modules/angular2/typings/browser.d.ts"/>
/// <reference path="../node_modules/autopulous-xdom2jso/src/xdom2jso.ts"/>

import convert = xdom2jso.convert;

import {Injectable, Output, EventEmitter} from 'angular2/core';

@Injectable()
export class SoapService {
    @Output() SoapResponseEvent:EventEmitter<{}> = new EventEmitter(true);

    private debug:boolean = false;

    private username:string = '';
    private password:string = '';

    private targetNamespace:string = '';

    private servicePort:number = 0;
    private serviceRoot:string = '';

    private serviceUrl:string = '';

    private requestSuffix:string = "Request";
    private responseSuffix:string = "Response";

    constructor(servicePort:number, serviceRoot:string, targetNamespace?:string, requestSuffix?:string, responseSuffix?:string) {
        if (undefined !== targetNamespace) this.targetNamespace = targetNamespace;

        this.setEndpoint(servicePort, serviceRoot);
        this.setMethodSuffixes(requestSuffix, responseSuffix);
    }

    public setEndpoint(servicePort:number, serviceRoot:string) {
        this.servicePort = servicePort;
        this.serviceRoot = serviceRoot;
        this.serviceUrl = this.servicePort + this.serviceRoot;
    };

    public setMethodSuffixes(requestSuffix?:string, responseSuffix?:string) {
        if (undefined !== requestSuffix) this.requestSuffix = requestSuffix;
        if (undefined !== responseSuffix) this.responseSuffix = responseSuffix;
    };

    public setCredentials(username:string, password:string) {
        this.username = username;
        this.password = password;
    };

    public setMode(debug:boolean) {
        this.debug = debug;
    };

    public post(method:string, parameters:any):void {
        var soapAction:string = this.targetNamespace + '/' + encodeURIComponent(method);

        var xmlHttp:XMLHttpRequest = new XMLHttpRequest();

        xmlHttp.open("POST", this.serviceUrl, true);

        xmlHttp.setRequestHeader("SOAPAction", soapAction);
        xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");

        xmlHttp.onreadystatechange = () => {
            if (4 == xmlHttp.readyState) {
                var responseNodeList:any = xmlHttp.responseXML.getElementsByTagNameNS('*', method + this.responseSuffix);

                var jso:{} = convert(responseNodeList[0]);

                this.SoapResponseEvent.emit(jso);
            }
        };

        var requestBody:string = this.toXml(parameters);

        //
        // Replace the SOAP-ENV as needed for the webservices that you are invoking
        //

        var request:string =
            "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
            "<SOAP-ENV:Header>" +
            "<wsse:Security SOAP-ENV:mustUnderstand=\"1\" xmlns:wsse=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd\" soapenv =\"http://schemas.xmlsoap.org/soap/envelope/\">" +
            "<wsse:UsernameToken wsu:ld=\"UsernameToken-104\" xmlns:wsu=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\" >" +
            "<wsse:Username>" + this.username + "</wsse:Username>" +
            "<wsse:Password Type=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText\">" + this.password + "</wsse:Password>" +
            "</wsse:UsernameToken>" +
            "</wsse:Security>" +
            "</SOAP-ENV:Header>" +
            "<SOAP-ENV:Body>" +
            requestBody +
            "</SOAP-ENV:Body>" +
            "</SOAP-ENV:Envelope>";

        xmlHttp.send(request);
    }

    private toXml(parameters:any):string {
        var xml:string = "";

        switch (typeof(parameters)) {
            case "string":
                xml += parameters.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                break;

            case "number":
            case "boolean":
                xml += parameters.toString();
                break;

            case "object":
                if (parameters.constructor.toString().indexOf("function Date()") > -1) { // Date
                    var year:string = parameters.getFullYear().toString();

                    var month:string = (parameters.getMonth() + 1).toString();
                    month = (month.length == 1) ? "0" + month : month;

                    var date:string = parameters.getDate().toString();
                    date = (date.length == 1) ? "0" + date : date;

                    var hours:string = parameters.getHours().toString();
                    hours = (hours.length == 1) ? "0" + hours : hours;

                    var minutes:string = parameters.getMinutes().toString();
                    minutes = (minutes.length == 1) ? "0" + minutes : minutes;

                    var seconds:string = parameters.getSeconds().toString();
                    seconds = (seconds.length == 1) ? "0" + seconds : seconds;

                    var milliseconds:string = parameters.getMilliseconds().toString();

                    var tzminutes:number = Math.abs(parameters.getTimezoneOffset());

                    var tzhours:number = 0;

                    while (tzminutes >= 60) {
                        tzhours++;
                        tzminutes -= 60;
                    }

                    var tzminute:string = (tzminutes.toString().length == 1) ? "0" + tzminutes.toString() : tzminutes.toString();
                    var tzhour:string = (tzhours.toString().length == 1) ? "0" + tzhours.toString() : tzhours.toString();

                    var timezone:string = ((parameters.getTimezoneOffset() < 0) ? "+" : "-") + tzhour + ":" + tzminute;

                    xml += year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds + timezone;
                }
                else if (parameters.constructor.toString().indexOf("function Array()") > -1) { // Array
                    for (var parameter in parameters) {
                        if (parameters.hasOwnProperty(parameter)) {
                            if (!isNaN(+parameter)) {  // linear array
                                (/function\s+(\w*)\s*\(/ig).exec(parameters[parameter].constructor.toString());

                                var type = RegExp.$1;

                                switch (type) {
                                    case "":
                                        type = typeof(parameters[parameter]);
                                        break;
                                    case "String":
                                        type = "string";
                                        break;
                                    case "Number":
                                        type = "int";
                                        break;
                                    case "Boolean":
                                        type = "bool";
                                        break;
                                    case "Date":
                                        type = "DateTime";
                                        break;
                                }
                                xml += this.toElement(type, parameters[parameter]);
                            }
                            else { // associative array
                                xml += this.toElement(parameter, parameters[parameter]);
                            }
                        }
                    }
                }
                else { // Object or custom function
                    for (var parameter in parameters) {
                        if (parameters.hasOwnProperty(parameter)) {
                            xml += this.toElement(parameter, parameters[parameter]);
                        }
                    }
                }
                break;

            default:
                throw new Error("SOAP SERVICE: type '" + typeof(parameters) + "' is not supported");
        }

        return xml;
    }

    private toElement(elementName:string, parameters:any):string {
        var elementContent:string = this.toXml(parameters);

        if ("" === elementContent) {
            return "<" + elementName + "/>";
        }
        else {
            return "<" + elementName + ">" + elementContent + "</" + SoapService.stripTagAttributes(elementName) + ">";
        }
    }

    private static stripTagAttributes(parameter:string):string {
        var attributedParameter:string = parameter + ' ';

        return attributedParameter.slice(0, attributedParameter.indexOf(' '));
    }
}