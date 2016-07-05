/// <reference path="../node_modules/autopulous-xdom2jso/xdom2jso.d.ts"/>

import convert = xdom2jso.convert;

import {Injectable} from '@angular/core';

@Injectable()
export class SoapService {
    private debug:boolean = false;
    private asynchronous:boolean = true;
    private localName:boolean = false;

    private servicePort:string = '';
    private servicePath:string = '';
    private serviceUrl:string = '';

    private targetNamespace:string = '';

    private envelopeBuilder_:(requestBody:string) => string = null;
    private xmlResponseHandler_:(response:NodeListOf<Element>) => void = null;
    private jsoResponseHandler_:(response:{}) => void = null;

    constructor(servicePort:string, servicePath:string, targetNamespace?:string) {
        this.servicePort = servicePort;
        this.servicePath = servicePath;
        this.serviceUrl = servicePort + servicePath;

        if (undefined !== targetNamespace) this.targetNamespace = targetNamespace;
    }

    set envelopeBuilder(envelopeBuilder:(response:{}) => string) {
        this.envelopeBuilder_ = envelopeBuilder;
    }

    set jsoResponseHandler(responseHandler:(response:{}) => void) {
        this.jsoResponseHandler_ = responseHandler;
    }

    set xmlResponseHandler(responseHandler:(response:NodeListOf<Element>) => void) {
        this.xmlResponseHandler_ = responseHandler;
    }

    set localNameMode(on:boolean) {
        this.localName = on;
    }

    set debugMode(on:boolean) {
        this.debug = on;
    }

    set testMode(on:boolean) {
        this.debug = on;
        this.asynchronous = !on;
    }

    public post(method:string, parameters:any, responseRoot?:string):void {
        var request:string = this.toXml(parameters);
        var envelopedRequest:string = null != this.envelopeBuilder_ ? this.envelopeBuilder_(request) : request;

        if (this.debug) {
            console.log('target namespace: ' + this.targetNamespace);
            console.log('method: ' + method);
            console.log('service URL: ' + this.serviceUrl);
            console.log('request: ' + request);
            console.log('envelopedRequest: ' + envelopedRequest);
            console.log((this.asynchronous ? 'asynchronous' : 'synchronous') + ' ' + (this.localName ? 'without namespaces' : 'with namespaces (if returned by the webservice)'));
        }

        var xmlHttp:XMLHttpRequest = new XMLHttpRequest();

        xmlHttp.onreadystatechange = () => {
            if (this.debug) {
                console.log('XMLHttpRequest ready state: ' + xmlHttp.readyState);
            }

            if (4 == xmlHttp.readyState) {
                if (this.debug) {
                    console.log('XMLHttpRequest status: ' + xmlHttp.status);
                    console.log('XMLHttpRequest status text: ' + xmlHttp.statusText);
                    console.log('XMLHttpRequest response headers: ' + xmlHttp.getAllResponseHeaders());
                }

                var responseNodeList:NodeListOf<Element>;

                if (undefined === responseRoot) {
                    responseNodeList = xmlHttp.responseXML;
                }
                else {
                    responseNodeList = xmlHttp.responseXML.getElementsByTagNameNS('*', responseRoot);
                }

                if (null != this.xmlResponseHandler_) {
                    this.xmlResponseHandler_(responseNodeList);
                }

                if (null != this.jsoResponseHandler_) {
                    var response:{} = convert(responseNodeList[0], this.localName);

                    if (this.debug) {
                        console.log(JSON.stringify(response));
                    }

                    this.jsoResponseHandler_(response);
                }
            }
        };

        xmlHttp.open("POST", this.serviceUrl, this.asynchronous);

        xmlHttp.setRequestHeader("SOAPAction", this.targetNamespace + '/' + encodeURIComponent(method));
        xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");

        xmlHttp.send(envelopedRequest);
    }

    private toXml(parameters:any):string {
        var xml:string = "";
        var parameter:any;

        switch (typeof(parameters)) {
            case "string":
                xml += parameters.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                break;

            case "number":
            case "boolean":
                xml += parameters.toString();
                break;

            case "object":
                if (parameters.constructor.toString().indexOf("function Date()") > -1) {
                    let year:string = parameters.getFullYear().toString();
                    let month:string = ("0" + (parameters.getMonth() + 1).toString()).slice(-2);
                    let date:string = ("0" + parameters.getDate().toString()).slice(-2);
                    let hours:string = ("0" + parameters.getHours().toString()).slice(-2);
                    let minutes:string = ("0" + parameters.getMinutes().toString()).slice(-2);
                    let seconds:string = ("0" + parameters.getSeconds().toString()).slice(-2);
                    let milliseconds:string = parameters.getMilliseconds().toString();

                    let tzOffsetMinutes:number = Math.abs(parameters.getTimezoneOffset());
                    let tzOffsetHours:number = 0;

                    while (tzOffsetMinutes >= 60) {
                        tzOffsetHours++;
                        tzOffsetMinutes -= 60;
                    }

                    let tzMinutes:string = ("0" + tzOffsetMinutes.toString()).slice(-2);
                    let tzHours:string = ("0" + tzOffsetHours.toString()).slice(-2);

                    let timezone:string = ((parameters.getTimezoneOffset() < 0) ? "-" : "+") + tzHours + ":" + tzMinutes;

                    xml += year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds + timezone;
                }
                else if (parameters.constructor.toString().indexOf("function Array()") > -1) { // Array
                    for (parameter in parameters) {
                        if (parameters.hasOwnProperty(parameter)) {
                            if (!isNaN(parameter)) {  // linear array
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
                    for (parameter in parameters) {
                        if (parameters.hasOwnProperty(parameter)) {
                            xml += this.toElement(parameter, parameters[parameter]);
                        }
                    }
                }
                break;

            default:
                throw new Error("SoapService error: type '" + typeof(parameters) + "' is not supported");
        }

        return xml;
    }

    private toElement(tagNamePotentiallyWithAttributes:string, parameters:any):string {
        var elementContent:string = this.toXml(parameters);

        if ("" == elementContent) {
            return "<" + tagNamePotentiallyWithAttributes + "/>";
        }
        else {
            return "<" + tagNamePotentiallyWithAttributes + ">" + elementContent + "</" + SoapService.stripTagAttributes(tagNamePotentiallyWithAttributes) + ">";
        }
    }

    private static stripTagAttributes(tagNamePotentiallyWithAttributes:string):string {
        tagNamePotentiallyWithAttributes = tagNamePotentiallyWithAttributes + ' ';

        return tagNamePotentiallyWithAttributes.slice(0, tagNamePotentiallyWithAttributes.indexOf(' '));
    }
}