<<<<<<< HEAD
=======
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
var PacienteCreateComponent = (function () {
    function PacienteCreateComponent(formBuilder) {
        this.formBuilder = formBuilder;
        this.estados = ["temporal", "identificado", "validado", "recienNacido", "extranjero"];
        this.sexos = ["femenino", "masculino", "otro"];
        this.generos = ["femenino", "masculino", "otro"];
        this.estadosCiviles = ["casado", "separado", "divorciado", "viudo", "soltero", "otro"];
        this.tiposContactos = ["telefonoFijo", "telefonoCelular", "email"];
        this.paises = [];
        this.provincias = [];
        this.localidades = [];
        this.barrios = [];
    }
    PacienteCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.provinciaService.get()
            .subscribe(function (resultado) { return _this.provincias = resultado; });
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            apellido: ['', forms_1.Validators.required],
            alias: [''],
            documento: ['', forms_1.Validators.required],
            fechaNacimiento: [''],
            estado: [''],
            sexo: [''],
            genero: [''],
            estadoCivil: [''],
            contacto: this.formBuilder.array([
                this.iniContacto(1)
            ])
        });
    };
    PacienteCreateComponent.prototype.iniContacto = function (rank) {
        // Inicializa contacto
        var cant = 0;
        var fecha = new Date();
        return this.formBuilder.group({
            tipo: [''],
            valor: [''],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    };
    PacienteCreateComponent.prototype.addContacto = function () {
        // agrega formMatricula 
        var control = this.createForm.controls['contacto'];
        control.push(this.iniContacto(control.length));
    };
    PacienteCreateComponent.prototype.removeContacto = function (i) {
        // elimina formMatricula
        var control = this.createForm.controls['contacto'];
        control.removeAt(i);
    };
    PacienteCreateComponent.prototype.onSave = function (model, isvalid) {
        debugger;
        if (isvalid) {
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    PacienteCreateComponent.prototype.onCancel = function () {
        //this.data.emit(null)
    };
    PacienteCreateComponent = __decorate([
        core_1.Component({
            selector: 'paciente-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/paciente/paciente-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder])
    ], PacienteCreateComponent);
    return PacienteCreateComponent;
}());
exports.PacienteCreateComponent = PacienteCreateComponent;
>>>>>>> altaPaciente
//# sourceMappingURL=paciente-create.component.js.map