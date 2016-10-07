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
var financiador_service_1 = require('./../../services/financiador.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var barrio_service_1 = require('./../../services/barrio.service');
var localidad_service_1 = require('./../../services/localidad.service');
var provincia_service_1 = require('./../../services/provincia.service');
var pais_service_1 = require('./../../services/pais.service');
var paciente_service_1 = require('./../../services/paciente.service');
var enumerados = require('./../../utils/enumerados');
var PacienteCreateComponent = (function () {
    function PacienteCreateComponent(formBuilder, PaisService, ProvinciaService, LocalidadService, BarrioService, pacienteService, financiadorService) {
        this.formBuilder = formBuilder;
        this.PaisService = PaisService;
        this.ProvinciaService = ProvinciaService;
        this.LocalidadService = LocalidadService;
        this.BarrioService = BarrioService;
        this.pacienteService = pacienteService;
        this.financiadorService = financiadorService;
        this.estados = [];
        this.sexos = [];
        this.generos = [];
        this.relacionTutores = [];
        this.estadosCiviles = [];
        this.tiposContactos = [];
        this.paises = [];
        this.provincias = [];
        this.todasProvincias = [];
        this.localidades = [];
        this.todasLocalidades = [];
        this.barrios = [];
        this.obrasSociales = [];
        this.pacRelacionados = [];
    }
    PacienteCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.PaisService.get().subscribe(function (resultado) { _this.paises = resultado; });
        this.ProvinciaService.get().subscribe(function (resultado) { _this.todasProvincias = resultado; });
        this.LocalidadService.get().subscribe(function (resultado) { _this.todasLocalidades = resultado; });
        this.financiadorService.get().subscribe(function (resultado) { _this.obrasSociales = resultado; });
        this.showCargar = false;
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();
        this.relacionTutores = enumerados.getRelacionTutor();
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            apellido: [''],
            alias: [''],
            documento: [''],
            fechaNacimiento: [],
            estado: ['', forms_1.Validators.required],
            sexo: [''],
            genero: [''],
            estadoCivil: [''],
            contacto: this.formBuilder.array([]),
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: [''],
                        barrio: ['']
                    }),
                    ranking: [1],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ]),
            financiador: this.formBuilder.array([]),
            relaciones: this.formBuilder.array([]),
            activo: [true]
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
    PacienteCreateComponent.prototype.iniFinanciador = function (rank) {
        // form Financiador u obra Social
        var cant = 0;
        var fecha = new Date();
        return this.formBuilder.group({
            entidad: [''],
            ranking: [rank],
            fechaAlta: [fecha],
            fechaBaja: [''],
            activo: [true]
        });
    };
    PacienteCreateComponent.prototype.iniRelacion = function () {
        return this.formBuilder.group({
            relacion: [''],
            referencia: [''],
            apellido: [''],
            nombre: [''],
            documento: ['']
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
            var operacionPac = void 0;
            operacionPac = this.pacienteService.post(model);
            operacionPac.subscribe(function (resultado) {
                debugger;
                console.log(resultado);
            });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    PacienteCreateComponent.prototype.onCancel = function () {
        //this.data.emit(null)
    };
    PacienteCreateComponent.prototype.findObject = function (objeto, dato) {
        return objeto.id === dato;
    };
    PacienteCreateComponent.prototype.filtrarProvincias = function (indexPais) {
        var pais = this.paises[(indexPais - 1)];
        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == pais.id; });
    };
    PacienteCreateComponent.prototype.filtrarLocalidades = function (indexProvincia) {
        var provincia = this.provincias[(indexProvincia - 1)];
        this.localidades = this.todasLocalidades.filter(function (loc) { return loc.provincia.id == provincia.id; });
    };
    PacienteCreateComponent.prototype.addFinanciador = function () {
        // agrega form Financiador u obra Social
        var control = this.createForm.controls['financiador'];
        control.push(this.iniFinanciador(control.length));
    };
    PacienteCreateComponent.prototype.removeFinanciador = function (i) {
        // elimina form Financiador u obra Social
        var control = this.createForm.controls['financiador'];
        control.removeAt(i);
    };
    PacienteCreateComponent.prototype.addRelacion = function () {
        // agrega form Financiador u obra Social
        var control = this.createForm.controls['relaciones'];
        control.push(this.iniRelacion());
    };
    PacienteCreateComponent.prototype.removeRelacion = function (i) {
        // elimina form Financiador u obra Social
        var control = this.createForm.controls['relaciones'];
        control.removeAt(i);
    };
    PacienteCreateComponent.prototype.buscarPacRelacionado = function () {
        var _this = this;
        debugger;
        //var formsRel = this.createForm.value.relaciones[i];
        var nombre = document.getElementById("relNombre").value;
        var apellido = document.getElementById("relApellido").value;
        var documento = document.getElementById("relDocumento").value;
        this.pacienteService.getBySerch(apellido, nombre, documento, "", null, "")
            .subscribe(function (resultado) {
            if (resultado)
                _this.pacRelacionados = resultado;
            else {
                _this.pacRelacionados = [];
                _this.showCargar = true;
            }
        });
    };
    PacienteCreateComponent.prototype.setRelacion = function (relacion, nombre, apellido, documento, referencia) {
        return this.formBuilder.group({
            relacion: [relacion],
            referencia: [referencia],
            apellido: [apellido],
            nombre: [nombre],
            documento: [documento]
        });
    };
    PacienteCreateComponent.prototype.validar = function (paciente) {
        debugger;
        var relacion = document.getElementById("relRelacion").value;
        var control = this.createForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, paciente.nombre, paciente.apellido, paciente.documento, paciente.id));
        document.getElementById("relRelacion").value = "";
        document.getElementById("relNombre").value = "";
        document.getElementById("relApellido").value = "";
        document.getElementById("relDocumento").value = "";
        this.pacRelacionados = [];
    };
    PacienteCreateComponent.prototype.cargarDatos = function () {
        debugger;
        var relacion = document.getElementById("relRelacion").value;
        var nombre = document.getElementById("relNombre").value;
        var apellido = document.getElementById("relApellido").value;
        var documento = document.getElementById("relDocumento").value;
        var control = this.createForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, nombre, apellido, documento, ""));
        document.getElementById("relRelacion").value = "";
        document.getElementById("relNombre").value = "";
        document.getElementById("relApellido").value = "";
        document.getElementById("relDocumento").value = "";
    };
    PacienteCreateComponent = __decorate([
        core_1.Component({
            selector: 'paciente-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/paciente/paciente-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, pais_service_1.PaisService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, barrio_service_1.BarrioService, paciente_service_1.PacienteService, financiador_service_1.FinanciadorService])
    ], PacienteCreateComponent);
    return PacienteCreateComponent;
}());
exports.PacienteCreateComponent = PacienteCreateComponent;
//# sourceMappingURL=paciente-create.component.js.map