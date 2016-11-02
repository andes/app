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
var profesional_update_component_1 = require('./profesional-update.component');
var profesional_create_component_1 = require('./profesional-create.component');
var profesional_service_1 = require('./../../services/profesional.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var ProfesionalComponent = (function () {
    function ProfesionalComponent(formBuilder, profesionalService) {
        this.formBuilder = formBuilder;
        this.profesionalService = profesionalService;
        this.showcreate = false;
        this.showupdate = false;
    }
    ProfesionalComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.searchForm = this.formBuilder.group({
            apellido: [''],
            nombre: [''],
            documento: ['']
        });
        this.searchForm.valueChanges.debounceTime(200).subscribe(function (value) {
            _this.loadProfesionalesFiltrados(value.apellido, value.nombre, value.documento);
        });
        this.loadProfesionales();
    };
    ProfesionalComponent.prototype.loadProfesionales = function () {
        var _this = this;
        this.profesionalService.get()
            .subscribe(function (profesionales) { return _this.profesionales = profesionales; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    ProfesionalComponent.prototype.loadProfesionalesFiltrados = function (apellido, nombre, documento) {
        var _this = this;
        if (apellido || nombre || documento) {
            this.profesionalService.getByTerm(apellido, nombre, documento)
                .subscribe(function (profesionales) { return _this.profesionales = profesionales; }, //Bind to view
            function (//Bind to view
                err) {
                if (err) {
                    console.log(err);
                }
            });
        }
        else {
            this.loadProfesionales();
        }
    };
    ProfesionalComponent.prototype.onReturn = function (objProfesional) {
        this.showcreate = false;
        this.showupdate = false;
        if (objProfesional) {
            this.loadProfesionales();
        }
    };
    ProfesionalComponent.prototype.onDisable = function (objProfesional) {
        var _this = this;
        this.profesionalService.disable(objProfesional)
            .subscribe(function (dato) { return _this.loadProfesionales(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    ProfesionalComponent.prototype.onEnable = function (objProfesional) {
        var _this = this;
        this.profesionalService.enable(objProfesional)
            .subscribe(function (dato) { return _this.loadProfesionales(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    ProfesionalComponent.prototype.onEdit = function (objProfesional) {
        this.showupdate = true;
        this.selectedProfesional = objProfesional;
    };
    ProfesionalComponent = __decorate([
        core_1.Component({
            selector: 'profesionales',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, profesional_update_component_1.ProfesionalUpdateComponent, profesional_create_component_1.ProfesionalCreateComponent],
            templateUrl: 'components/profesional/profesional.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, profesional_service_1.ProfesionalService])
    ], ProfesionalComponent);
    return ProfesionalComponent;
}());
exports.ProfesionalComponent = ProfesionalComponent;
//# sourceMappingURL=profesional.component.js.map