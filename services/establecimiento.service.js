"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
require('rxjs/add/operator/toPromise');
var Rx_1 = require('rxjs/Rx');
// Import RxJs required methods
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
var EstablecimientoService = (function () {
    function EstablecimientoService(http) {
        this.http = http;
        this.establecimientoUrl = 'http://localhost:3002/api/establecimiento'; // URL to web api
    }
    EstablecimientoService.prototype.get = function () {
        return this.http.get(this.establecimientoUrl)
            .map(function (res) { return res.json(); })
            .catch(this.handleError); //...errors if any*/
    };
    EstablecimientoService.prototype.getByTerm = function (codigoSisa, nombre) {
        return this.http.get(this.establecimientoUrl + "?codigoSisa=" + codigoSisa + "&nombre=" + nombre)
            .map(function (res) { return res.json(); })
            .catch(this.handleError); //...errors if any*/
    };
    EstablecimientoService.prototype.post = function (establecimiento) {
        var bodyString = JSON.stringify(establecimiento); // Stringify payload
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var options = new http_1.RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.establecimientoUrl, bodyString, options) // ...using post request
            .map(function (res) { return res.json(); }) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    };
    EstablecimientoService.prototype.put = function (establecimiento) {
        var bodyString = JSON.stringify(establecimiento); // Stringify payload
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var options = new http_1.RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.establecimientoUrl + "/" + establecimiento._id, bodyString, options) // ...using post request
            .map(function (res) { return res.json(); }) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    };
    EstablecimientoService.prototype.disable = function (establecimiento) {
        establecimiento.habilitado = false;
        establecimiento.fechaBaja = new Date();
        console.log(establecimiento.fechaBaja);
        var bodyString = JSON.stringify(establecimiento); // Stringify payload
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var options = new http_1.RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.establecimientoUrl + "/" + establecimiento._id, bodyString, options) // ...using post request
            .map(function (res) { return res.json(); }) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    };
    EstablecimientoService.prototype.enable = function (establecimiento) {
        establecimiento.habilitado = true;
        var bodyString = JSON.stringify(establecimiento); // Stringify payload
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var options = new http_1.RequestOptions({ headers: headers }); // Create a request option
        return this.http.put(this.establecimientoUrl + "/" + establecimiento._id, bodyString, options) // ...using post request
            .map(function (res) { return res.json(); }) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    };
    EstablecimientoService.prototype.handleError = function (error) {
        console.log(error.json());
        return Rx_1.Observable.throw(error.json().error || 'Server error');
    };
    EstablecimientoService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], EstablecimientoService);
    return EstablecimientoService;
}());
exports.EstablecimientoService = EstablecimientoService;
//# sourceMappingURL=establecimiento.service.js.map