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
var paciente_update_component_1 = require('./paciente-update.component');
var paciente_create_component_1 = require('./paciente-create.component');
var paciente_service_1 = require('./../../services/paciente.service');
var enumerados = require('./../../utils/enumerados');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var PacienteComponent = (function () {
    function PacienteComponent(formBuilder, pacienteService) {
        this.formBuilder = formBuilder;
        this.pacienteService = pacienteService;
        this.showcreate = false;
        this.showupdate = false;
        this.error = false;
        this.mensaje = "";
        this.estados = [];
        this.sexos = [];
        this.checked = true;
    }
    PacienteComponent.prototype.ngOnInit = function () {
        this.sexos = enumerados.getSexo();
        this.estados = enumerados.getEstados();
        this.searchForm = this.formBuilder.group({
            nombre: [''],
            apellido: [''],
            documento: [''],
            sexo: [''],
            estado: [''],
            fechaNacimiento: ['']
        });
        /*this.searchForm.valueChanges.debounceTime(200).subscribe((form) => {
            this.loadPacientes(form.nombre, form.apellido,form.documento,form.sexo,form.estado,form.fechaNacimiento);
        })*/
    };
    PacienteComponent.prototype.loadPaciente = function () {
        var _this = this;
        this.error = false;
        var formulario = this.searchForm.value;
        this.pacienteService.getBySerch(formulario.apellido, formulario.nombre, formulario.documento, formulario.estado, formulario.fechaNacimiento, formulario.sexo)
            .subscribe(function (pacientes) { return _this.pacientes = pacientes; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
                _this.error = true;
                return;
            }
        });
    };
    PacienteComponent.prototype.findPacientes = function () {
        this.error = false;
        var formulario = this.searchForm.value;
        if ((formulario.apellido == "") && (formulario.nombre == "") && (formulario.documento == "") &&
            (formulario.sexo == "") && (formulario.estado == "") && (formulario.fechaNacimiento == "")) {
            this.error = true;
            this.mensaje = "Debe completar al menos un campo de búsqueda";
            return;
        }
        this.loadPaciente();
    };
    PacienteComponent.prototype.onDisable = function (objPaciente) {
        var _this = this;
        this.error = false;
        this.pacienteService.disable(objPaciente)
            .subscribe(function (dato) { return _this.loadPaciente(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
                _this.error = true;
                _this.mensaje = "Ha ocurrido un error";
                return;
            }
        });
    };
    PacienteComponent.prototype.onReturn = function (objPaciente) {
        this.showcreate = false;
        this.showupdate = false;
        if (objPaciente) {
            this.loadPaciente();
        }
    };
    PacienteComponent.prototype.onEnable = function (objPaciente) {
        var _this = this;
        this.error = false;
        this.pacienteService.enable(objPaciente)
            .subscribe(function (dato) { return _this.loadPaciente(); }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    PacienteComponent.prototype.onEdit = function (objPaciente) {
        this.showcreate = false;
        this.showupdate = true;
        this.selectedPaciente = objPaciente;
    };
    PacienteComponent = __decorate([
        core_1.Component({
            selector: 'pacientes',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, paciente_create_component_1.PacienteCreateComponent, paciente_update_component_1.PacienteUpdateComponent],
            templateUrl: 'components/paciente/paciente.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, paciente_service_1.PacienteService])
    ], PacienteComponent);
    return PacienteComponent;
}());
exports.PacienteComponent = PacienteComponent;
//# sourceMappingURL=paciente.component.js.map