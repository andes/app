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
var establecimiento_update_component_1 = require('./establecimiento-update.component');
var establecimiento_service_1 = require('./../../services/establecimiento.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var EstablecimientoComponent = (function () {
    function EstablecimientoComponent(formBuilder, establecimientoService) {
        this.formBuilder = formBuilder;
        this.establecimientoService = establecimientoService;
        this.showcreate = false;
        this.showupdate = false;
        this.checked = true;
    }
    EstablecimientoComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });
        this.searchForm.valueChanges.debounceTime(200).subscribe(function (value) {
            var codSisa = value.codigoSisa ? value.codigoSisa : "";
            _this.loadEstablecimientosFiltrados(codSisa, value.nombre);
        });
        this.loadEstablecimientos();
    };
    EstablecimientoComponent.prototype.loadEstablecimientos = function () {
        var _this = this;
        this.establecimientoService.get()
            .subscribe(function (establecimientos) { return _this.establecimientos = establecimientos; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EstablecimientoComponent.prototype.loadEstablecimientosFiltrados = function (codigoSisa, nombre) {
        var _this = this;
        this.establecimientoService.getByTerm(codigoSisa, nombre)
            .subscribe(function (establecimientos) { return _this.establecimientos = establecimientos; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EstablecimientoComponent.prototype.onReturn = function (objEstablecimiento) {
        this.showcreate = false;
        this.showupdate = false;
        this.loadEstablecimientos();
    };
    EstablecimientoComponent.prototype.onDisable = function (objEstablecimiento) {
        var _this = this;
        this.establecimientoService.disable(objEstablecimiento)
            .subscribe(function (dato) { return _this.loadEstablecimientos(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EstablecimientoComponent.prototype.onEnable = function (objEstablecimiento) {
        var _this = this;
        this.establecimientoService.enable(objEstablecimiento)
            .subscribe(function (dato) { return _this.loadEstablecimientos(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EstablecimientoComponent.prototype.onEdit = function (objEstablecimiento) {
        this.showcreate = false;
        this.showupdate = true;
        debugger;
        this.selectedEst = objEstablecimiento;
    };
    EstablecimientoComponent = __decorate([
        core_1.Component({
            selector: 'establecimientos',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, establecimiento_update_component_1.EstablecimientoUpdateComponent],
            templateUrl: 'components/establecimiento/establecimiento.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, establecimiento_service_1.EstablecimientoService])
    ], EstablecimientoComponent);
    return EstablecimientoComponent;
}());
exports.EstablecimientoComponent = EstablecimientoComponent;
//# sourceMappingURL=establecimiento.component.js.map