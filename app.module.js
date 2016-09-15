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
var tipoEstablecimiento_service_1 = require('./services/tipoEstablecimiento.service');
var provincia_service_1 = require('./services/provincia.service');
var http_1 = require('@angular/http');
var establecimiento_service_1 = require('./services/establecimiento.service');
var especialidad_service_1 = require('./services/especialidad.service');
var establecimiento_create_component_1 = require('./components/establecimiento/establecimiento-create.component');
var establecimiento_component_1 = require('./components/establecimiento/establecimiento.component');
var especialidad_create_component_1 = require('./components/especialidad/especialidad-create.component');
var especialidad_component_1 = require('./components/especialidad/especialidad.component');
var profesional_component_1 = require('./components/profesional/profesional.component');
var profesional_service_1 = require('./services/profesional.service');
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var app_component_1 = require('./app.component');
var forms_1 = require("@angular/forms");
var app_routing_1 = require('./app.routing');
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [platform_browser_1.BrowserModule, forms_1.ReactiveFormsModule, http_1.HttpModule, app_routing_1.routing],
            declarations: [app_component_1.AppComponent, establecimiento_component_1.EstablecimientoComponent, establecimiento_create_component_1.EstablecimientoCreateComponent, especialidad_component_1.EspecialidadComponent, especialidad_create_component_1.EspecialidadCreateComponent, profesional_component_1.ProfesionalComponent],
            bootstrap: [app_component_1.AppComponent],
            providers: [establecimiento_service_1.EstablecimientoService, provincia_service_1.ProvinciaService, tipoEstablecimiento_service_1.TipoEstablecimientoService, especialidad_service_1.EspecialidadService, profesional_service_1.ProfesionalService]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map