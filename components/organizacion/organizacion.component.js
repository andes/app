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
var organizacion_update_component_1 = require('./organizacion-update.component');
var organizacion_service_1 = require('./../../services/organizacion.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var OrganizacionComponent = (function () {
    function OrganizacionComponent(formBuilder, organizacionService) {
        this.formBuilder = formBuilder;
        this.organizacionService = organizacionService;
        this.showcreate = false;
        this.showupdate = false;
        this.checked = true;
    }
    OrganizacionComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });
        this.searchForm.valueChanges.debounceTime(200).subscribe(function (value) {
            var codSisa = value.codigoSisa ? value.codigoSisa : "";
            _this.loadOrganizacionesFiltrados(codSisa, value.nombre);
        });
        this.loadOrganizaciones();
    };
    OrganizacionComponent.prototype.loadOrganizaciones = function () {
        var _this = this;
        this.organizacionService.get()
            .subscribe(function (organizaciones) { return _this.organizaciones = organizaciones; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    OrganizacionComponent.prototype.loadOrganizacionesFiltrados = function (codigoSisa, nombre) {
        var _this = this;
        this.organizacionService.getByTerm(codigoSisa, nombre)
            .subscribe(function (organizaciones) { return _this.organizaciones = organizaciones; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    OrganizacionComponent.prototype.onReturn = function (objOrganizacion) {
        this.showcreate = false;
        this.showupdate = false;
        this.loadOrganizaciones();
    };
    OrganizacionComponent.prototype.onDisable = function (objOrganizacion) {
        var _this = this;
        this.organizacionService.disable(objOrganizacion)
            .subscribe(function (dato) { return _this.loadOrganizaciones(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    OrganizacionComponent.prototype.onEnable = function (objOrganizacion) {
        var _this = this;
        this.organizacionService.enable(objOrganizacion)
            .subscribe(function (dato) { return _this.loadOrganizaciones(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    OrganizacionComponent.prototype.onEdit = function (objOrganizacion) {
        this.showcreate = false;
        this.showupdate = true;
        debugger;
        this.selectedOrg = objOrganizacion;
    };
    OrganizacionComponent = __decorate([
        core_1.Component({
            selector: 'organizaciones',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, organizacion_update_component_1.OrganizacionUpdateComponent],
            templateUrl: 'components/organizacion/organizacion.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, organizacion_service_1.OrganizacionService])
    ], OrganizacionComponent);
    return OrganizacionComponent;
}());
exports.OrganizacionComponent = OrganizacionComponent;
//# sourceMappingURL=organizacion.component.js.map