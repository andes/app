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
var PacienteUpdateComponent = (function () {
    function PacienteUpdateComponent(formBuilder, PaisService, ProvinciaService, LocalidadService, BarrioService, pacienteService, financiadorService) {
        this.formBuilder = formBuilder;
        this.PaisService = PaisService;
        this.ProvinciaService = ProvinciaService;
        this.LocalidadService = LocalidadService;
        this.BarrioService = BarrioService;
        this.pacienteService = pacienteService;
        this.financiadorService = financiadorService;
        this.data = new core_1.EventEmitter();
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
        this.showCargar = false;
        this.error = false;
        this.mensaje = "";
        this.barrios = [];
        this.obrasSociales = [];
        this.pacRelacionados = [];
        this.direccion = [];
    }
    PacienteUpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.PaisService.get().subscribe(function (resultado) { return _this.paises = resultado; });
        this.ProvinciaService.get().subscribe(function (resultado) { return _this.todasProvincias = resultado; });
        this.LocalidadService.get().subscribe(function (resultado) { return _this.todasLocalidades = resultado; });
        this.financiadorService.get().subscribe(function (resultado) { return _this.obrasSociales = resultado; });
        this.showCargar = false;
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.estados = enumerados.getEstados();
        this.relacionTutores = enumerados.getRelacionTutor();
        this.updateForm = this.formBuilder.group({
            id: [this.pacienteHijo.id],
            nombre: [this.pacienteHijo.nombre],
            apellido: [this.pacienteHijo.apellido],
            alias: [this.pacienteHijo.alias],
            documento: [this.pacienteHijo.documento],
            fechaNacimiento: [this.pacienteHijo.fechaNacimiento],
            estado: [this.pacienteHijo.estado],
            sexo: [this.pacienteHijo.sexo],
            genero: [this.pacienteHijo.genero],
            estadoCivil: [this.pacienteHijo.estadoCivil],
            contacto: this.formBuilder.array([]),
            direccion: this.formBuilder.array([]),
            financiador: this.formBuilder.array([]),
            relaciones: this.formBuilder.array([]),
            activo: [true]
        });
        this.pacienteHijo.contacto.forEach(function (element) {
            _this.addContacto(element);
        });
        this.pacienteHijo.financiador.forEach(function (element) {
            _this.addFinanciador(element);
        });
        this.pacienteHijo.direccion.forEach(function (element) {
            _this.addDireccion(element);
        });
        this.pacienteHijo.relaciones.forEach(function (element) {
            _this.addRelacion(element);
        });
    };
    PacienteUpdateComponent.prototype.iniDireccion = function (unaDireccion) {
        var _this = this;
        // Inicializa contacto
        debugger;
        if (unaDireccion) {
            if (unaDireccion.ubicacion) {
                if (unaDireccion.ubicacion.pais) {
                    this.myPais = unaDireccion.ubicacion.pais;
                    if (unaDireccion.ubicacion.provincia) {
                        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == _this.myPais.id; });
                        this.myProvincia = unaDireccion.ubicacion.provincia;
                        if (unaDireccion.ubicacion.localidad) {
                            this.localidades = this.todasLocalidades.filter(function (loc) { return loc.provincia.id == _this.myProvincia.id; });
                            this.myLocalidad = unaDireccion.ubicacion.localidad;
                        }
                    }
                }
            }
            return this.formBuilder.group({
                valor: [unaDireccion.valor],
                ubicacion: this.formBuilder.group({
                    pais: [this.myPais],
                    provincia: [this.myProvincia],
                    localidad: [this.myLocalidad]
                }),
                ranking: [unaDireccion.ranking],
                codigoPostal: [unaDireccion.codigoPostal],
                ultimaActualizacion: [unaDireccion.ultimaActualizacion],
                activo: [unaDireccion.activo]
            });
        }
        else {
            return this.formBuilder.group({
                valor: [''],
                ubicacion: this.formBuilder.group({
                    pais: [''],
                    provincia: [''],
                    localidad: ['']
                }),
                ranking: [],
                codigoPostal: [''],
                ultimaActualizacion: [''],
                activo: [true]
            });
        }
    };
    PacienteUpdateComponent.prototype.iniContacto = function (unContacto) {
        // Inicializa contacto
        var cant = 0;
        var fecha = new Date();
        if (unContacto) {
            return this.formBuilder.group({
                tipo: [unContacto.tipo],
                valor: [unContacto.valor],
                ranking: [unContacto.ranking],
                ultimaActualizacion: [unContacto.ultimaActualizacion],
                activo: [unContacto.activo]
            });
        }
        else {
            var control = this.updateForm.value.contacto;
            return this.formBuilder.group({
                tipo: [''],
                valor: [''],
                ranking: [control.lenght],
                ultimaActualizacion: [''],
                activo: [true]
            });
        }
    };
    PacienteUpdateComponent.prototype.iniFinanciador = function (unFinanciador) {
        // form Financiador u obra Social
        var cant = 0;
        var fecha = new Date();
        if (unFinanciador) {
            return this.formBuilder.group({
                entidad: [unFinanciador.entidad],
                ranking: [unFinanciador.ranking],
                fechaAlta: [unFinanciador.fechaAlta],
                fechaBaja: [unFinanciador.fechaBaja],
                activo: [unFinanciador.activo]
            });
        }
        else {
            return this.formBuilder.group({
                entidad: [''],
                ranking: [''],
                fechaAlta: [''],
                fechaBaja: [''],
                activo: ['']
            });
        }
    };
    PacienteUpdateComponent.prototype.iniRelacion = function (unaRelacion) {
        debugger;
        if (unaRelacion) {
            return this.formBuilder.group({
                relacion: [unaRelacion.relacion],
                referencia: [unaRelacion.referencia],
                apellido: [unaRelacion.apellido],
                nombre: [unaRelacion.nombre],
                documento: [unaRelacion.documento]
            });
        }
        else {
            return this.formBuilder.group({
                relacion: [''],
                referencia: [''],
                apellido: [''],
                nombre: [''],
                documento: ['']
            });
        }
    };
    PacienteUpdateComponent.prototype.addContacto = function (unContacto) {
        // agrega formMatricula 
        var control = this.updateForm.controls['contacto'];
        control.push(this.iniContacto(unContacto));
    };
    PacienteUpdateComponent.prototype.removeContacto = function (i) {
        // elimina formMatricula
        var control = this.updateForm.controls['contacto'];
        control.removeAt(i);
    };
    PacienteUpdateComponent.prototype.addDireccion = function (unaDireccion) {
        debugger;
        // agrega formMatricula 
        var control = this.updateForm.controls['direccion'];
        control.push(this.iniDireccion(unaDireccion));
    };
    PacienteUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        debugger;
        if (isvalid) {
            var operacionPac = void 0;
            operacionPac = this.pacienteService.put(model);
            operacionPac.subscribe(function (resultado) {
                _this.data.emit(resultado);
            });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    PacienteUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    PacienteUpdateComponent.prototype.filtrarProvincias = function (indexPais, i) {
        debugger;
        // const control = <FormGroup> this.updateForm.value.direccion[i].ubicacion;
        // control.setValue({provincia:null});
        var pais = this.paises[(indexPais)];
        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == pais.id; });
    };
    PacienteUpdateComponent.prototype.filtrarLocalidades = function (indexProvincia) {
        var provincia = this.provincias[(indexProvincia)];
        this.localidades = this.todasLocalidades.filter(function (loc) { return loc.provincia.id == provincia.id; });
    };
    PacienteUpdateComponent.prototype.addFinanciador = function (unFinanciador) {
        // agrega form Financiador u obra Social
        var control = this.updateForm.controls['financiador'];
        control.push(this.iniFinanciador(unFinanciador));
    };
    PacienteUpdateComponent.prototype.removeFinanciador = function (i) {
        // elimina form Financiador u obra Social
        var control = this.updateForm.controls['financiador'];
        control.removeAt(i);
    };
    PacienteUpdateComponent.prototype.addRelacion = function (unaRelacion) {
        // agrega form Financiador u obra Social
        var control = this.updateForm.controls['relaciones'];
        control.push(this.iniRelacion(unaRelacion));
    };
    PacienteUpdateComponent.prototype.removeRelacion = function (i) {
        // elimina form Financiador u obra Social
        var control = this.updateForm.controls['relaciones'];
        control.removeAt(i);
    };
    PacienteUpdateComponent.prototype.buscarPacRelacionado = function () {
        var _this = this;
        this.error = false;
        //var formsRel = this.createForm.value.relaciones[i];
        var nombre = document.getElementById("relNombre").value;
        var apellido = document.getElementById("relApellido").value;
        var documento = document.getElementById("relDocumento").value;
        if ((nombre == "") && (apellido == "") && (documento == "")) {
            this.error = true;
            this.mensaje = "Debe completar al menos un campo de búsqueda";
            return;
        }
        this.pacienteService.getBySerch(apellido, nombre, documento, "", null, "")
            .subscribe(function (resultado) {
            debugger;
            if (resultado.length > 0) {
                _this.pacRelacionados = resultado;
                _this.showCargar = false;
                _this.error = false;
                _this.mensaje = "";
            }
            else {
                _this.pacRelacionados = [];
                _this.showCargar = true;
                _this.error = true;
                _this.mensaje = "No se encontraron datos precargados";
            }
        });
    };
    PacienteUpdateComponent.prototype.setRelacion = function (relacion, nombre, apellido, documento, referencia) {
        var reOID = referencia ? referencia : null;
        return this.formBuilder.group({
            relacion: [relacion],
            referencia: [reOID],
            apellido: [apellido],
            nombre: [nombre],
            documento: [documento]
        });
    };
    PacienteUpdateComponent.prototype.validar = function (paciente) {
        debugger;
        var relacion = document.getElementById("relRelacion").value;
        var control = this.updateForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, paciente.nombre, paciente.apellido, paciente.documento, paciente.id));
        document.getElementById("relRelacion").value = "";
        document.getElementById("relNombre").value = "";
        document.getElementById("relApellido").value = "";
        document.getElementById("relDocumento").value = "";
        this.showCargar = false;
        this.error = false;
        this.mensaje = "";
        this.pacRelacionados = [];
    };
    PacienteUpdateComponent.prototype.cargarDatos = function () {
        debugger;
        this.error = false;
        this.mensaje = "";
        var relacion = document.getElementById("relRelacion").value;
        var nombre = document.getElementById("relNombre").value;
        var apellido = document.getElementById("relApellido").value;
        var documento = document.getElementById("relDocumento").value;
        if ((nombre == "") || (apellido == "") || (documento == "") || (relacion == "")) {
            this.error = true;
            this.mensaje = "Debe completar los datos solicitados";
            return;
        }
        var control = this.updateForm.controls['relaciones'];
        control.push(this.setRelacion(relacion, nombre, apellido, documento, ""));
        document.getElementById("relRelacion").value = "";
        document.getElementById("relNombre").value = "";
        document.getElementById("relApellido").value = "";
        document.getElementById("relDocumento").value = "";
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], PacienteUpdateComponent.prototype, "data", void 0);
    __decorate([
        core_1.Input('selectedPaciente'), 
        __metadata('design:type', Object)
    ], PacienteUpdateComponent.prototype, "pacienteHijo", void 0);
    PacienteUpdateComponent = __decorate([
        core_1.Component({
            selector: 'paciente-update',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/paciente/paciente-update.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, pais_service_1.PaisService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, barrio_service_1.BarrioService, paciente_service_1.PacienteService, financiador_service_1.FinanciadorService])
    ], PacienteUpdateComponent);
    return PacienteUpdateComponent;
}());
exports.PacienteUpdateComponent = PacienteUpdateComponent;
//# sourceMappingURL=paciente-update.component.js.map