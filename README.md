# Angular 2 SOAP client service (pre-release - do not use)

## Description

An Angular 2 service to make SOAP webservice requests.

```
import {SoapService} from 'soapService';

export class SomeClass {
    private soapService:SoapService = new SoapService(servicePort, serviceRoot);

    someFunction() {
        this.soapService.post(method, parameters);
    }
}
```

The SOAP webservice response is converted into a JavaScript object for processing by an application. 

## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Usage
1: Clone the Git repository
```
git clone https://github.com/autopulous/angular2-soap.git
```
2: Install packages (from the command line)
```
npm install
```
3: Start server (includes gulp watcher and auto refresh) 
```
npm start
```