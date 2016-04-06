# Angular 2 Boilerplate Project (beta 13)

## Description
This boilerplate was derived from the [official Angular 2 documentation] (https://angular.io/docs/ts/latest/quickstart.html) to provide boilerplate code and application configuration that can be used to kickstart an Angular 2 project.

### Included

* A NPM `package.json` configuration file that manages AngularJS 2 and development component dependencies
* A Gulp `gulpfile.js` script to build and maintain the project contents
* A Bowsersync `bs-config.json` settings file for the lite-server
* Typescript `tsconfig.json` files to control the compilation of the development and test typescript source files
* Karma `karma.config.js` file to control the execution of Jasmine unit tests
* A Karma shim to enable Karma unit test with AngularJS 2 components 

* A development directory layout
* A unit test directory layout
* An application source directory layout
* An application unit test source directory layout

#### Notable choices

* `ntypescript` overrides the _default_ Typescript compiler (see: `gulpfile.js`)

## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Prerequisites
The following must be installed to use the boilerplate:

* `node.js`
* `npm`

## Usage
1: Clone the Git repository
```
git clone https://github.com/autopulous/angularjs2-boilerplate.git
```
2: Install packages (from the command line)
```
npm install
```
3: Start server (includes gulp watcher and auto refresh) 
```
npm start
```

## Issues (todo list)

Figure out how to get relative `templateUrl` references to work with Systemjs

http://stackoverflow.com/questions/34556154/using-relative-path-for-templateurl-in-angular2-component-with-systemjs