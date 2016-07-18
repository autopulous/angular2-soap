# Angular 2 SOAP client service
## Description
`autopulous-angular2-soap` is a module to make SOAP requests and receive SOAP responses as a JavaScript object (JSO).
## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
## API
### `constructor(servicePort, serviceRoot, targetNamespace)`
SoapService constructor - invoked via Angular 2 `provider`, or JavaScript `new` 
#### `servicePort`
argument `string`

the protocol, resource name, and port upon which the service endpoint is deployed
#### `serviceRoot`
argument `string`
 
the path to the webservice endpoint
#### `targetNamespace`
optional argument `string`
 
prefixes the webservice method in the HTTP request header `SOAPAction`
### `envelopeBuilder`
property **`(requestBody:string) => string`**

a callback function to build the SOAP request envelope
### `jsoResponseHandler`
property `(response:{}) => void`
 
a callback function to receive the JavaScript webservice response object (https://github.com/autopulous/xdom2jso.git)
### `xmlResponseHandler` 
property `(response:NodeListOf<Element>) => void`

a callback function to asynchronously consume the XML webservice response 
### `localNameMode`
property `boolean`

when `true` causes the XML webservice response conversion to omit `ELEMENT` and `ATTRIBUTE` name namespaces within the JavaScript object
### `debugMode`
property `boolean`
 
when `true` causes webservice request/response debug messages to be sent to the console
### `testMode`
property `boolean`

when `true` causes the HTTP request to be processed synchronously and sets `debugMode` to true (used for unit testing or diagnostics)

### `post(method, parameters, responseRoot)`
method returning `void`

#### `method`
argument `string`
 
HTTP request header `SOAPAction` method 
#### `parameters`
argument `{}` (JavaScript object)

the body of the webservice request
#### `responseRoot`
optional argument `string`
 
the starting `ELEMENT` within the XML webservice response from which to convert into the JavaScript response object
## Usage Notes
* By default `autopulous-angular2-soap` processes SOAP responses asynchronously (this behavior is overridden by setting `testMode`)

## Example
A user authentication service to make SOAP requests and process SOAP responses.

`user.authenticator.ts`

    import {Component} from "@angular/core";
    import {SoapService} from "../soap.service";

    @Component({
        selector: 'authenticator',
        templateUrl: 'app/authenticator.component.html',
        providers: [SoapService]
    })

    export class UserAuthentication {
        private servicePort:string = 'http://172.16.62.111:8091';
        private servicePath:string = '/your-application-ws/ws/';
        private targetNamespace:string = '';

        private responseJso:{} = null;

        private soapService:SoapService;

        constructor() {
            this.soapService = new SoapService(this.servicePort, this.servicePath, this.targetNamespace);
            this.soapService.envelopeBuilder = this.envelopeBuilder;
            this.soapService.jsoResponseHandler = (response:{}) => {this.responseJso = response};
            this.soapService.localNameMode = true;
        }

        private username:string = '';
        private password:string = '';

        public login(username:string, password:string) {
            var method:string = 'Login';
            var parameters:{}[] = [];

            this.username = username;
            this.password = password;

            parameters['LoginRequest xmlns="urn:application:security:messages:1:0"'] = UserAuthentication.userLogin(username, password);

            this.soapService.post(method, parameters);
        }

        private static userLogin(username, password):{}[] {
            var parameters:{}[] = [];

            parameters["UserName"] = username;
            parameters['Password'] = password;

            return parameters;
        }

        private envelopeBuilder(requestBody:string):string {
            return "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
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
        }
    }
    
`index.html`

Load module dependencies `autopulous-xdom` and `autopulous-xdom2jso`

    <!DOCTYPE html>
    <html>
        <head>
            ... 
                 
            <script src="vendor/autopulous-angular2-soap/vendor/autopulous-xdom/xdom.js"></script>
            <script src="vendor/autopulous-angular2-soap/vendor/autopulous-xdom2jso/xdom2jso.js"></script>
            
            ...
        </head>
        <body>
            ...
        </body>
    </html>
    
`systemjs.config.js`

Configure SystemJS to load `autopulous-angular2-soap`
    
    'use strict';
    
    System.config ({
        // tell the SystemJS loader where to look for packages and components
    
        map: {
            ...
            
            'autopulous-angular2-soap': 'vendor/autopulous-angular2-soap',
            
            ...
        },
    
        // tell the SystemJS loader how to load when no filename and/or no extension
    
        packages: {
            ...
                
            'autopulous-angular2-soap': { defaultExtension: 'js' },
            
            ...
        }
    });
    
## To modify/customize this package within your development environment
1: Clone the `Git` repository

    git clone https://github.com/autopulous/angular2-soap.git
2: Install packages (from the command line)
    
    npm install
3: Start build/test servers (from the command line) (invokes `Gulp` watcher and `Karma` auto refresh)

    npm run "unit test continuously"
3a: Alternatively: create/use your preferred build/test methodology to automate the development process

## To include this package within your project
1: Within your project's `package.json` file include the Angular2 SOAP client within the `dependencies` section

    "autopulous-angular2-soap": "0.4.7"
2: Implement calls to the package as illustrated in the example code (above)