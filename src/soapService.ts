import {Injectable, Output, EventEmitter} from 'angular2/core';

interface typeDefinition {
    targetNamespace:string;
    name:string;
    type:string;
    minOccurs:string;
    maxOccurs:string;
}

@Injectable()
export class SoapService {
    @Output() SoapResponseEvent:EventEmitter<{}> = new EventEmitter(true);

    private debug:boolean = false;

    private username:string = '';
    private password:string = '';

    private servicePort:number = 0;
    private serviceRoot:string = '';
    private wsdlName:string = '';

    private serviceUrl:string = '';
    private wsdlUrl:string = '';

    private requestSuffix:string = "Request";
    private responseSuffix:string = "Response";

    private tagAttributeSeparator:string = ' ';
    private namespaceSeparator:string = ':';

    private wsdlDeclarationCache = [];
    private wsdlDeclarations;

    constructor(servicePort:number, serviceRoot:string, wsdlName?:string, requestSuffix?:string, responseSuffix?:string) {
        this.setEndpoint(servicePort, serviceRoot, wsdlName);
        this.setMethodSuffixes(requestSuffix, responseSuffix);
    }

    public setEndpoint(servicePort:number, serviceRoot:string, wsdlName?:string) {
        this.servicePort = servicePort;
        this.serviceRoot = serviceRoot;
        this.serviceUrl = servicePort + serviceRoot;

        if (undefined !== wsdlName) {
            this.wsdlName = wsdlName;
            this.wsdlUrl = servicePort + serviceRoot + wsdlName;
        }
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
        var wsdlDeclarations = this.wsdlDeclarationCache[this.serviceUrl] + ""; // Try to retrieve the WSDL abstract for the service URL from cache

        if ("" === wsdlDeclarations || "undefined" === wsdlDeclarations) {
            this.requestAfterWsdlLoad(method, parameters);
        }
        else {
            this.request(method, parameters);
        }
    }

    private requestAfterWsdlLoad(method:string, parameters:any):void {
        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("GET", this.wsdlUrl, true);

        xmlHttp.onreadystatechange = () => {
            if (4 == xmlHttp.readyState) {
                var wsdl = xmlHttp.responseXML;

                this.wsdlDeclarations = {};
                this.wsdlDeclarations.documentTargetNamespace = SoapService.determineTargetNamespace(wsdl.documentElement, "");
                this.wsdlDeclarations.typeDefinitions = this.getTypeDefinitions(wsdl);

                this.wsdlDeclarationCache[this.serviceUrl] = this.wsdlDeclarations;

                this.request(method, parameters);
            }
        };

        xmlHttp.send(null);
    }

    private request(method:string, parameters:any):void {
        var soapAction = this.wsdlDeclarations.documentTargetNamespace + '/' + encodeURIComponent(method);

        var xmlHttp = new XMLHttpRequest();

        xmlHttp.open("POST", this.serviceUrl, true);

        xmlHttp.setRequestHeader("SOAPAction", soapAction);
        xmlHttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");

        xmlHttp.onreadystatechange = () => {
            if (4 == xmlHttp.readyState) {
                var responseNodeList = xmlHttp.responseXML.getElementsByTagNameNS('*', method + this.responseSuffix);

                var obj = this.node2object(responseNodeList[0], this.wsdlDeclarations.typeDefinitions);

                this.SoapResponseEvent.emit(obj);
            }
        };

        var requestBody:string = this.toXml(parameters);

        // Replace the SOAP-ENV as needed for the webservice that you are invoking

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

    private getTypeDefinitions(element:Node):typeDefinition[] {
        var typeDefinitions:typeDefinition[] = [];

        _getTypeDefinitions(element, "");

        return typeDefinitions;

        function _getTypeDefinitions(element:Node, targetNamespace:string):void {
            targetNamespace = this.determineTargetNamespace(element, targetNamespace);

            for (var child = element.firstChild; child; child = child.nextSibling) {
                if (1 == child.nodeType) { // ELEMENT_NODE
                    _getTypeDefinitions(child, targetNamespace);
                }
            }

            if ("element" == element.nodeName || "attribute" == element.nodeName) {
                var nameAttribute, typeAttribute, minOccursAttribute, maxOccursAttribute;
                var name, elementName, typeDefinition;

                nameAttribute = element.attributes["name"];

                if (null != nameAttribute) {
                    typeAttribute = element.attributes["type"];
                }
                else {
                    nameAttribute = element.attributes["ref"];
                    typeAttribute = undefined;
                }

                if (null != nameAttribute) {
                    name = this.stripNamespace(nameAttribute.value);

                    elementName = targetNamespace + ":" + name;

                    typeDefinition = typeDefinitions[elementName];

                    if ("undefined" === typeof typeDefinition) {
                        typeDefinition = {};
                        typeDefinition.targetNamespace = targetNamespace;
                        typeDefinition.name = name;
                    }

                    if ("undefined" != typeof typeAttribute) typeDefinition.type = typeAttribute.value;

                    minOccursAttribute = element.attributes["minOccurs"];
                    if ("undefined" != typeof minOccursAttribute) typeDefinition.minOccurs = minOccursAttribute.value;

                    maxOccursAttribute = element.attributes["maxOccurs"];
                    if ("undefined" != typeof maxOccursAttribute) typeDefinition.maxOccurs = maxOccursAttribute.value;

                    typeDefinitions[elementName] = typeDefinition;
                }
            }
        }
    }

    private stripNamespace(elementName:string):string {
        return elementName.slice(elementName.indexOf(this.namespaceSeparator) + 1);
    }

    private node2object(node:Node, typeDefinitions:typeDefinition[]):{} {
        var childNode:Node;

        if (null == node) { // null node
            return null;
        }

        var nodeType:number = node.nodeType;

        if (nodeTypes.ATTRIBUTE == nodeType) { // attribute node
            return SoapService.extractAttributeValue(node, typeDefinitions);
        }
        else if (nodeTypes.TEXT == nodeType || nodeTypes.CDATA_SECTION == nodeType) { // text or CDATA section node
            return SoapService.extractElementValue(node, typeDefinitions);
        }

        if (nodeTypes.ELEMENT == node.childNodes.length) {
            childNode = node.childNodes[0];

            if (nodeTypes.TEXT == childNode.nodeType || nodeTypes.CDATA_SECTION == childNode.nodeType) { // leaf node
                return this.node2object(childNode, typeDefinitions);
            }
        }

        if ("unbounded" === SoapService.getMaxOccurs(node, typeDefinitions)) { // list node
            var nodeList = [];

            for (var childIndex:number = node.childNodes.length; 0 <= --childIndex;) {
                nodeList[nodeList.length] = this.node2object(node.childNodes[childIndex], typeDefinitions);
            }

            return nodeList;
        }

        // object node

        var obj:{} = null;

        var attributes:NamedNodeMap = node.attributes;

        if (0 < attributes.length) { // element attributes
            obj = {};

            for (var attributeIndex:number = attributes.length; 0 <= --attributeIndex;) {
                var attribute:Attr = attributes[attributeIndex];
                obj[node.namespaceURI + ":" + attribute.nodeName] = this.node2object(attribute, typeDefinitions);
            }
        }

        if (node.hasChildNodes()) { // element children
            if (null == obj) obj = {};

            for (var childIndex:number = node.childNodes.length; 0 <= --childIndex;) {
                childNode = node.childNodes[childIndex];
                obj[childNode.namespaceURI + ":" + childNode.localName] = this.node2object(childNode, typeDefinitions);
            }
        }

        return obj;
    }

    private static determineTargetNamespace(element:Node, targetNamespace:string):string {
        var attributes:NamedNodeMap = element.attributes;

        if (attributes) {
            for (var attributeIndex:number = attributes.length; 0 <= --attributeIndex;) {
                var attribute = attributes[attributeIndex];

                if ("targetNamespace" == attribute.name) {
                    targetNamespace = attribute.value;
                    break;
                }
            }
        }

        if ("/" == targetNamespace.charAt(targetNamespace.length - 1)) {
            return targetNamespace.slice(0, targetNamespace.length - 2);
        }
        else {
            return targetNamespace;
        }
    }

    private static getTargetNamespace(node:Node, typeDefinitions:typeDefinition[]):string {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        return "undefined" != typeof typeDefinition ? typeDefinition.targetNamespace : '';
    }

    private static getName(node, typeDefinitions):string {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        return "undefined" != typeof typeDefinition ? typeDefinition.name : '';
    }

    private static getType(node, typeDefinitions:typeDefinition[]):string {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        return "undefined" != typeof typeDefinition ? typeDefinition.type : '';
    }

    private static getMinOccurs(node, typeDefinitions:typeDefinition[]):string {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        return "undefined" != typeof typeDefinition ? typeDefinition.minOccurs : '1';
    }

    private static getMaxOccurs(node, typeDefinitions:typeDefinition[]):string {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        return "undefined" != typeof typeDefinition ? typeDefinition.maxOccurs : '1';
    }

    private static extractAttributeValue(node, typeDefinitions:typeDefinition[]):any {
        return SoapService.typeConvertValue(node.nodeValue, node, typeDefinitions);
    }

    private static extractElementValue(node, typeDefinitions:typeDefinition[]):any {
        return SoapService.typeConvertValue(node.nodeValue, node.parentNode, typeDefinitions);
    }

    private static typeConvertValue(value:any, node:Node, typeDefinitions:typeDefinition[]):any {
        var nodeName:string = node.namespaceURI + ":" + node.localName;
        var typeDefinition:typeDefinition = typeDefinitions[nodeName];

        var type:string = ("undefined" == typeof typeDefinition + "" ? "" : typeDefinition.type).toLowerCase();

        switch (type) {
            default:
            case "string":
                return (value != null) ? value + "" : "";
            case "boolean":
                return value + "" == "true";
            case "int":
            case "long":
                return (value != null) ? parseInt(value + "", 10) : 0;
            case "double":
                return (value != null) ? parseFloat(value + "") : 0;
            case "date":
            case "datetime":
                if (value == null) return null;

                value = value + "";
                value = value.substring(0, (value.lastIndexOf(".") == -1 ? value.length : value.lastIndexOf(".")));
                value = value.replace(/T/gi, " ");
                value = value.replace(/-/gi, "/");

                var dateTime = new Date();
                dateTime.setTime(Date.parse(value));
                return dateTime;
        }
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
                    var year = parameters.getFullYear().toString();

                    var month = (parameters.getMonth() + 1).toString();
                    month = (month.length == 1) ? "0" + month : month;

                    var date = parameters.getDate().toString();
                    date = (date.length == 1) ? "0" + date : date;

                    var hours = parameters.getHours().toString();
                    hours = (hours.length == 1) ? "0" + hours : hours;

                    var minutes = parameters.getMinutes().toString();
                    minutes = (minutes.length == 1) ? "0" + minutes : minutes;

                    var seconds = parameters.getSeconds().toString();
                    seconds = (seconds.length == 1) ? "0" + seconds : seconds;

                    var milliseconds = parameters.getMilliseconds().toString();

                    var tzminutes = Math.abs(parameters.getTimezoneOffset());

                    var tzhours = 0;

                    while (tzminutes >= 60) {
                        tzhours++;
                        tzminutes -= 60;
                    }

                    tzminutes = (tzminutes.toString().length == 1) ? "0" + tzminutes.toString() : tzminutes.toString();
                    tzhours = (tzhours.toString().length == 1) ? "0" + tzhours.toString() : tzhours.toString();

                    var timezone = ((parameters.getTimezoneOffset() < 0) ? "+" : "-") + tzhours + ":" + tzminutes;

                    xml += year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "." + milliseconds + timezone;
                }
                else if (parameters.constructor.toString().indexOf("function Array()") > -1) { // Array
                    for (var parameter:any in parameters) {
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
                    for (var parameter:any in parameters) {
                        if (parameters.hasOwnProperty(parameter)) {
                            xml += this.toElement(parameter, parameters[parameter]);
                        }
                    }
                }
                break;

            default:
                throw new Error("SOAP SERVICE: type '" + typeof(parameters) + "' is not supported");
                break;
        }

        return xml;
    }

    private toElement(elementName:string, parameters:any):string {
        var elementContent:string = this.toXml(parameters);

        if ("" === elementContent) {
            return "<" + elementName + "/>";
        }
        else {
            return "<" + elementName + ">" + elementContent + "</" + this.stripTagAttributes(elementName) + ">";
        }
    }

    private stripTagAttributes(parameter:string):string {
        var attributedParameter:string = parameter + this.tagAttributeSeparator;

        return attributedParameter.slice(0, attributedParameter.indexOf(this.tagAttributeSeparator));
    }
}