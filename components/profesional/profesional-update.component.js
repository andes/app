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
var pais_service_1 = require('./../../services/pais.service');
var provincia_service_1 = require('./../../services/provincia.service');
var localidad_service_1 = require('./../../services/localidad.service');
var especialidad_service_1 = require('./../../services/especialidad.service');
var enumerados = require('./../../utils/enumerados');
var ProfesionalUpdateComponent = (function () {
    function ProfesionalUpdateComponent(formBuilder, paisService, provinciaService, localidadService, profesionalService, especialidadService) {
        this.formBuilder = formBuilder;
        this.paisService = paisService;
        this.provinciaService = provinciaService;
        this.localidadService = localidadService;
        this.profesionalService = profesionalService;
        this.especialidadService = especialidadService;
        this.data = new core_1.EventEmitter();
        this.paises = [];
        this.provincias = [];
        this.localidades = [];
        this.todasProvincias = [];
        this.todasLocalidades = [];
        this.todasEspecialidades = [];
        this.especialidadesActuales = [];
    }
    ProfesionalUpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //Carga arrays
        this.sexos = enumerados.getSexo();
        this.generos = enumerados.getGenero();
        this.tipoComunicacion = enumerados.getTipoComunicacion();
        this.estadosCiviles = enumerados.getEstadoCivil();
        this.paisService.get().subscribe(function (resultado) { return _this.paises = resultado; });
        this.provinciaService.get().subscribe(function (resultado) { return _this.todasProvincias = resultado; });
        this.localidadService.get().subscribe(function (resultado) { return _this.todasLocalidades = resultado; });
        this.especialidadService.get().subscribe(function (resultado) {
            _this.todasEspecialidades = resultado;
        });
        //Cargo los valores actuales [Ojo que no esta funcionando el tema de fechas]
        this.fechaNacimientoActual = this.dateToText(this.ProfesionalHijo.fechaNacimiento);
        this.fechaFallecidoActual = this.dateToText(this.ProfesionalHijo.fechaFallecimiento);
        debugger;
        this.updateForm = this.formBuilder.group({
            id: [this.ProfesionalHijo.id],
            nombre: [this.ProfesionalHijo.nombre, forms_1.Validators.required],
            apellido: [this.ProfesionalHijo.apellido, forms_1.Validators.required],
            documento: [this.ProfesionalHijo.documento, forms_1.Validators.required],
            contacto: this.formBuilder.array([]),
            fechaNacimiento: [''],
            fechaFallecimiento: [''],
            sexo: [this.ProfesionalHijo.sexo],
            genero: [this.ProfesionalHijo.genero],
            direccion: this.formBuilder.array([]),
            estadoCivil: [this.ProfesionalHijo.estadoCivil],
            foto: [''],
            rol: [this.ProfesionalHijo.rol, forms_1.Validators.required],
            especialidad: this.formBuilder.array([]),
            matriculas: this.formBuilder.array([])
        });
        //Cargo arrays selecciondaos
        this.loadEspecialidades();
        this.loadMatriculas();
        this.loadDirecciones();
    };
    ProfesionalUpdateComponent.prototype.dateToText = function (myDate) {
        if (myDate) {
            var fecha1 = myDate.toString();
            var fecha2 = new Date(Date.parse(fecha1));
            var mes = fecha2.getMonth() + 1;
            var fechaSal = fecha2.getDate().toString() + "/" + mes.toString() + "/" + fecha2.getFullYear().toString();
            return fechaSal;
        }
        else
            return "";
    };
    ProfesionalUpdateComponent.prototype.textToDate = function (myDate) {
        var fecha2 = new Date(Date.parse(myDate));
        return fecha2;
    };
    ProfesionalUpdateComponent.prototype.setDireccion = function (objDireccion) {
        //OJO revisar en el create el tema de los paises, localidades, etc no los guarda como obj solo el id
        debugger;
        return this.formBuilder.group({
            valor: [objDireccion.valor],
            codigoPostal: [objDireccion.codigoPostal],
            ubicacion: this.formBuilder.group({
                pais: [objDireccion.ubicacion.pais],
                provincia: [objDireccion.ubicacion.provincia],
                localidad: [objDireccion.ubicacion.localidad]
            }),
            ranking: [objDireccion.ranking],
            activo: [objDireccion.activo]
        });
    };
    ProfesionalUpdateComponent.prototype.loadDirecciones = function () {
        var cantDirecciones = this.ProfesionalHijo.direccion.length;
        var control = this.updateForm.controls['direccion'];
        debugger;
        if (cantDirecciones > 0) {
            for (var i = 0; i < cantDirecciones; i++) {
                var objDireccion = this.ProfesionalHijo.direccion[i];
                control.push(this.setDireccion(objDireccion));
            }
        }
    };
    ProfesionalUpdateComponent.prototype.setEspecialidad = function (myId, myName) {
        return this.formBuilder.group({
            id: [myId],
            nombre: [myName],
        });
    };
    ProfesionalUpdateComponent.prototype.loadEspecialidades = function () {
        var cantidadEspecialidadesActuales = this.ProfesionalHijo.especialidad.length;
        var control = this.updateForm.controls['especialidad'];
        //Si tiene al menos una especialidad
        if (cantidadEspecialidadesActuales > 0) {
            for (var i = 0; i < cantidadEspecialidadesActuales; i++) {
                var id = this.ProfesionalHijo.especialidad[i].id;
                var nombre = this.ProfesionalHijo.especialidad[i].nombre;
                control.push(this.setEspecialidad(id, nombre));
            }
        }
    };
    ProfesionalUpdateComponent.prototype.setMatricula = function (objMat) {
        return this.formBuilder.group({
            numero: [objMat.numero, forms_1.Validators.required],
            descripcion: [objMat.descripcion],
            activo: [objMat.activo],
            fechaInicio: [objMat.fechaInicio],
            fechaVencimiento: [objMat.fechaVencimiento],
        });
    };
    ProfesionalUpdateComponent.prototype.iniMatricula = function () {
        // Inicializa matrícula nueva
        return this.formBuilder.group({
            numero: ['', forms_1.Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
            activo: [true]
        });
    };
    ProfesionalUpdateComponent.prototype.loadMatriculas = function () {
        var cantidadMatriculasActuales = this.ProfesionalHijo.matriculas.length;
        var control = this.updateForm.controls['matriculas'];
        //Si tienen al menos una matrículas
        if (cantidadMatriculasActuales > 0) {
            for (var i = 0; i < cantidadMatriculasActuales; i++) {
                var objMatricula;
                objMatricula = this.ProfesionalHijo.matriculas[i];
                control.push(this.setMatricula(objMatricula));
            }
        }
    };
    ProfesionalUpdateComponent.prototype.addMatricula = function () {
        // agrega formMatricula 
        var control = this.updateForm.controls['matriculas'];
        control.push(this.iniMatricula());
    };
    ProfesionalUpdateComponent.prototype.removeMatricula = function (i) {
        // elimina formMatricula
        var control = this.updateForm.controls['matriculas'];
        control.removeAt(i);
    };
    ProfesionalUpdateComponent.prototype.onSave = function (model, isvalid) {
        /*
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.activo = true;
            
            model.domicilio.localidad = this.myLocalidad;
            var ff = model.fechaNacimiento;
            model.fechaNacimiento = this.textToDate(ff);
            model.matriculas.forEach(e => { e.fechaInicio = this.textToDate(e.fechaInicio);
                                            e.fechaVencimiento = this.textToDate(e.fechaVencimiento);
                                         });

            
            profOperation = this.profesionalService.put(model);
            profOperation.subscribe(resultado => { this.data.emit(resultado); });

        } else {
            alert("Complete datos obligatorios");
        }
        */
    };
    ProfesionalUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Input('selectedProfesional'), 
        __metadata('design:type', Object)
    ], ProfesionalUpdateComponent.prototype, "ProfesionalHijo", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], ProfesionalUpdateComponent.prototype, "data", void 0);
    ProfesionalUpdateComponent = __decorate([
        core_1.Component({
            selector: 'profesional-update',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/profesional/profesional-update.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, pais_service_1.PaisService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, profesional_service_1.ProfesionalService, especialidad_service_1.EspecialidadService])
    ], ProfesionalUpdateComponent);
    return ProfesionalUpdateComponent;
}());
exports.ProfesionalUpdateComponent = ProfesionalUpdateComponent;
//# sourceMappingURL=profesional-update.component.js.map