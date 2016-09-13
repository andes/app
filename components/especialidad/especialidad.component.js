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
var especialidad_update_component_1 = require('./especialidad-update.component');
var especialidad_service_1 = require('./../../services/especialidad.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var EspecialidadComponent = (function () {
    function EspecialidadComponent(formBuilder, especialidadService) {
        this.formBuilder = formBuilder;
        this.especialidadService = especialidadService;
        this.showcreate = false;
        this.showupdate = false;
    }
    EspecialidadComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });
        this.searchForm.valueChanges.debounceTime(200).subscribe(function (value) {
            var codSisa = value.codigoSisa ? value.codigoSisa : "";
            _this.loadEspecialidadesFiltradas(codSisa, value.nombre);
        });
        this.loadEspecialidades();
    };
    EspecialidadComponent.prototype.loadEspecialidades = function () {
        var _this = this;
        this.especialidadService.get()
            .subscribe(function (especialidades) { return _this.especialidades = especialidades; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EspecialidadComponent.prototype.loadEspecialidadesFiltradas = function (codigoSisa, nombre) {
        var _this = this;
        this.especialidadService.getByTerm(codigoSisa, nombre)
            .subscribe(function (especialidades) { return _this.especialidades = especialidades; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EspecialidadComponent.prototype.onReturn = function (objEspecialidad) {
        this.showcreate = false;
        this.showupdate = false;
        this.loadEspecialidades();
    };
    EspecialidadComponent.prototype.onDisable = function (objEspecialidad) {
        var _this = this;
        this.especialidadService.disable(objEspecialidad)
            .subscribe(function (dato) { return _this.loadEspecialidades(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    EspecialidadComponent.prototype.onEdit = function (objEspecialidad) {
        this.showcreate = false;
        this.showupdate = true;
        this.selectedEsp = objEspecialidad;
    };
    EspecialidadComponent = __decorate([
        core_1.Component({
            selector: 'especialidades',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, especialidad_update_component_1.EspecialidadUpdateComponent],
            templateUrl: 'components/especialidad/especialidad.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, especialidad_service_1.EspecialidadService])
    ], EspecialidadComponent);
    return EspecialidadComponent;
}());
exports.EspecialidadComponent = EspecialidadComponent;
//# sourceMappingURL=especialidad.component.js.map