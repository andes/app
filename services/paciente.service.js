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
var PacienteService = (function () {
    function PacienteService(http) {
        this.http = http;
        this.pacienteUrl = 'http://localhost:3002/api/paciente'; // URL to web api
    }
    PacienteService.prototype.get = function () {
        return this.http.get(this.pacienteUrl)
            .map(function (res) { return res.json(); })
            .catch(this.handleError); //...errors if any*/
    };
    PacienteService.prototype.post = function (paciente) {
        debugger;
        var bodyString = JSON.stringify(paciente); // Stringify payload
        var headers = new http_1.Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        var options = new http_1.RequestOptions({ headers: headers }); // Create a request option
        return this.http.post(this.pacienteUrl, bodyString, options) // ...using post request
            .map(function (res) { return res.json(); }) // ...and calling .json() on the response to return data
            .catch(this.handleError); //...errors if any
    };
    PacienteService.prototype.getBySerch = function (apellido, nombre, documento, estado, fechaNac, sexo) {
        debugger;
        return this.http.get(this.pacienteUrl + "?apellido=" + apellido + "&nombre=" + nombre + "&documento=" + documento +
            "&estado=" + estado + "&fechaNac=" + fechaNac + "&sexo=" + sexo)
            .map(function (res) { return res.json(); })
            .catch(this.handleError); //...errors if any*/
    };
    //    disable(profesional: IProfesional): Observable<IProfesional> {
    //          profesional.activo = false;
    //         let bodyString = JSON.stringify(profesional); // Stringify payload
    //         let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //         let options       = new RequestOptions({ headers: headers }); // Create a request option
    //         return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
    //                          .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
    //                          .catch(this.handleError); //...errors if any
    //     } 
    //     enable(profesional: IProfesional): Observable<IProfesional> {
    //          profesional.activo = true;
    //         let bodyString = JSON.stringify(profesional); // Stringify payload
    //         let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //         let options       = new RequestOptions({ headers: headers }); // Create a request option
    //         return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
    //                          .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
    //                          .catch(this.handleError); //...errors if any
    //     } 
    //     put(profesional: IProfesional): Observable<IProfesional> {
    //         let bodyString = JSON.stringify(profesional); // Stringify payload
    //         let headers      = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    //         let options       = new RequestOptions({ headers: headers }); // Create a request option
    //         return this.http.put(this.profesionalUrl + "/" + profesional.id, bodyString, options) // ...using post request
    //                          .map((res:Response) => res.json()) // ...and calling .json() on the response to return data
    //                          .catch(this.handleError); //...errors if any
    //     } 
    PacienteService.prototype.handleError = function (error) {
        console.log(error.json());
        return Rx_1.Observable.throw(error.json().error || 'Server error');
    };
    PacienteService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], PacienteService);
    return PacienteService;
}());
exports.PacienteService = PacienteService;
//# sourceMappingURL=paciente.service.js.map