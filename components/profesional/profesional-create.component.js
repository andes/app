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
var forms_1 = require('@angular/forms');
// import { FORM_DIRECTIVES } from '@angular/common';
var profesional_service_1 = require('./../../services/profesional.service');
var provincia_service_1 = require('./../../services/provincia.service');
var ProfesionalCreateComponent = (function () {
    function ProfesionalCreateComponent(formBuilder, provinciaService, profesionalService) {
        this.formBuilder = formBuilder;
        this.provinciaService = provinciaService;
        this.profesionalService = profesionalService;
        this.data = new core_1.EventEmitter();
        this.tipos = ["DNI", "LC", "LE", "PASS"];
        this.localidades = [];
    }
    ProfesionalCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.provinciaService.get()
            .subscribe(function (resultado) { return _this.provincias = resultado; });
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            apellido: [''],
            tipoDni: [''],
            numeroDni: ['', forms_1.Validators.required],
            fechaNacimiento: [''],
            domicilio: this.formBuilder.group({
                calle: ['', forms_1.Validators.required],
                numero: [''],
                provincia: [''],
                localidad: ['']
            }),
            telefono: [''],
            email: [''],
            matriculas: this.formBuilder.array([
                this.iniMatricula()
            ])
        });
    };
    ProfesionalCreateComponent.prototype.iniMatricula = function () {
        // Inicializa matrículas
        return this.formBuilder.group({
            numero: ['', forms_1.Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
            vigente: [false]
        });
    };
    ProfesionalCreateComponent.prototype.addMatricula = function () {
        // agrega formMatricula 
        var control = this.createForm.controls['matriculas'];
        control.push(this.iniMatricula());
    };
    ProfesionalCreateComponent.prototype.removeMatricula = function (i) {
        // elimina formMatricula
        var control = this.createForm.controls['matriculas'];
        control.removeAt(i);
    };
    ProfesionalCreateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        debugger;
        if (isvalid) {
            var profOperation = void 0;
            model.habilitado = true;
            profOperation = this.profesionalService.post(model);
            profOperation.subscribe(function (resultado) { debugger; _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    ProfesionalCreateComponent.prototype.getLocalidades = function (index) {
        this.localidades = this.provincias[index].localidades;
    };
    ProfesionalCreateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], ProfesionalCreateComponent.prototype, "data", void 0);
    ProfesionalCreateComponent = __decorate([
        core_1.Component({
            selector: 'profesional-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/profesional/profesional-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, provincia_service_1.ProvinciaService, profesional_service_1.ProfesionalService])
    ], ProfesionalCreateComponent);
    return ProfesionalCreateComponent;
}());
exports.ProfesionalCreateComponent = ProfesionalCreateComponent;
//# sourceMappingURL=profesional-create.component.js.map