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
var barrio_service_1 = require('./../../services/barrio.service');
var localidad_service_1 = require('./../../services/localidad.service');
var provincia_service_1 = require('./../../services/provincia.service');
var pais_service_1 = require('./../../services/pais.service');
var enumerados = require('./../../utils/enumerados');
var PacienteCreateComponent = (function () {
    function PacienteCreateComponent(formBuilder, PaisService, ProvinciaService, LocalidadService, BarrioService) {
        this.formBuilder = formBuilder;
        this.PaisService = PaisService;
        this.ProvinciaService = ProvinciaService;
        this.LocalidadService = LocalidadService;
        this.BarrioService = BarrioService;
        this.estados = [];
        this.sexos = [];
        this.generos = [];
        this.estadosCiviles = [];
        this.tiposContactos = [];
        this.paises = [];
        this.provincias = [];
        this.localidades = [];
        this.barrios = [];
    }
    PacienteCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.PaisService.get().subscribe(function (resultado) { debugger; _this.paises = resultado; });
        this.ProvinciaService.get().subscribe(function (resultado) { return _this.provincias = resultado; });
        this.LocalidadService.get().subscribe(function (resultado) { return _this.localidades = resultado; });
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();
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
            ]),
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: [''],
                        barrio: ['']
                    }),
                    ranking: [''],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
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
    PacienteCreateComponent.prototype.filtrarProvincias = function (idPais) {
        this.provincias = this.provincias.filter(function (p) { return p.pais._id == idPais; });
    };
    PacienteCreateComponent.prototype.filtrarLocalidades = function (idProvincia) {
        this.localidades = this.localidades.filter(function (loc) { return loc.provincia._id == idProvincia; });
    };
    PacienteCreateComponent = __decorate([
        core_1.Component({
            selector: 'paciente-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/paciente/paciente-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, pais_service_1.PaisService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, barrio_service_1.BarrioService])
    ], PacienteCreateComponent);
    return PacienteCreateComponent;
}());
exports.PacienteCreateComponent = PacienteCreateComponent;
//# sourceMappingURL=paciente-create.component.js.map