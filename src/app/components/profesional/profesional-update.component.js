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
        this.updateForm = this.formBuilder.group({
            id: [this.ProfesionalHijo.id],
            nombre: [this.ProfesionalHijo.nombre, forms_1.Validators.required],
            apellido: [this.ProfesionalHijo.apellido, forms_1.Validators.required],
            documento: [this.ProfesionalHijo.documento, forms_1.Validators.required],
            contacto: this.formBuilder.array([]),
            fechaNacimiento: [this.ProfesionalHijo.fechaNacimiento],
            fechaFallecimiento: [this.ProfesionalHijo.fechaFallecimiento],
            sexo: [this.ProfesionalHijo.sexo],
            genero: [this.ProfesionalHijo.genero],
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [this.ProfesionalHijo.direccion[0].valor],
                    codigoPostal: [this.ProfesionalHijo.direccion[0].codigoPostal],
                    ubicacion: this.formBuilder.group({
                        pais: [this.ProfesionalHijo.direccion[0].ubicacion.pais],
                        provincia: [this.ProfesionalHijo.direccion[0].ubicacion.provincia],
                        localidad: [this.ProfesionalHijo.direccion[0].ubicacion.localidad]
                    }),
                    ranking: [this.ProfesionalHijo.direccion[0].ranking],
                    activo: [this.ProfesionalHijo.direccion[0].activo]
                })
            ]),
            estadoCivil: [this.ProfesionalHijo.estadoCivil],
            foto: [''],
            rol: [this.ProfesionalHijo.rol, forms_1.Validators.required],
            especialidad: this.formBuilder.array([]),
            matriculas: this.formBuilder.array([])
        });
        //Cargo arrays selecciondaos
        this.loadEspecialidades();
        this.loadMatriculas();
        this.loadContactos();
        //---- lo dejamos para despues this.loadDirecciones()
    };
    ProfesionalUpdateComponent.prototype.filtrarProvincias = function (indiceSelected) {
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) {
            return p.pais.id == idPais;
        });
        this.localidades = [];
    };
    ProfesionalUpdateComponent.prototype.filtrarLocalidades = function (indiceSelected) {
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) {
            return p.provincia.id == idProvincia;
        });
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
    /*************************PARA REVISAR ********************************************************************/
    // setDireccion(objDireccion: any) {
    //     //OJO revisar en el create el tema de los paises, localidades, etc no los guarda como obj solo el id
    //     debugger;
    //     return this.formBuilder.group({
    //         valor: [objDireccion.valor],
    //         codigoPostal: [objDireccion.codigoPostal],
    //         ubicacion: this.formBuilder.group({
    //             pais: [objDireccion.ubicacion.pais],
    //             provincia: [objDireccion.ubicacion.provincia],
    //             localidad: [objDireccion.ubicacion.localidad]
    //         }),
    //         ranking: [objDireccion.ranking],
    //         activo: [objDireccion.activo]
    //     })
    // }
    // loadDirecciones() {
    //     var cantDirecciones = this.ProfesionalHijo.direccion.length;
    //     const control = < FormArray > this.updateForm.controls['direccion'];
    //     debugger;
    //     if (cantDirecciones > 0) {
    //         for (var i = 0; i < cantDirecciones; i++) {
    //             var objDireccion: any = this.ProfesionalHijo.direccion[i];
    //             control.push(this.setDireccion(objDireccion)) 
    //         }
    //     }
    // }
    /*****************************************************PARA REVISAR ********************************************************************/
    /*Código de contactos*/
    ProfesionalUpdateComponent.prototype.initContacto = function (rank) {
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
    ProfesionalUpdateComponent.prototype.addContacto = function () {
        var control = this.updateForm.controls['contacto'];
        control.push(this.initContacto(control.length + 1));
    };
    ProfesionalUpdateComponent.prototype.removeContacto = function (indice) {
        var control = this.updateForm.controls['contacto'];
        control.removeAt(indice);
    };
    ProfesionalUpdateComponent.prototype.setContacto = function (cont) {
        debugger;
        return this.formBuilder.group({
            tipo: [cont.tipo],
            valor: [cont.valor],
            ranking: [cont.ranking],
            ultimaActualizacion: [cont.ultimaActualizacion],
            activo: [cont.activo]
        });
    };
    ProfesionalUpdateComponent.prototype.loadContactos = function () {
        var cantidadContactosActuales = this.ProfesionalHijo.contacto.length;
        var control = this.updateForm.controls['contacto'];
        if (cantidadContactosActuales > 0) {
            for (var i = 0; i < cantidadContactosActuales; i++) {
                var contacto = this.ProfesionalHijo.contacto[i];
                control.push(this.setContacto(contacto));
            }
        }
    };
    ProfesionalUpdateComponent.prototype.iniEspecialidad = function () {
        return this.formBuilder.group({
            nombre: []
        });
    };
    ProfesionalUpdateComponent.prototype.setEspecialidad = function (myId, myName) {
        return this.formBuilder.group({
            id: [myId],
            nombre: [myName],
        });
    };
    ProfesionalUpdateComponent.prototype.addEspecialidad = function () {
        var e = (document.getElementById("ddlEspecialidades"));
        var indice = e.selectedIndex;
        var id = this.todasEspecialidades[indice].id;
        var nombre = this.todasEspecialidades[indice].nombre;
        var control = this.updateForm.controls['especialidad'];
        control.push(this.setEspecialidad(id, nombre));
    };
    ProfesionalUpdateComponent.prototype.removeEspecialidad = function (i) {
        var control = this.updateForm.controls['especialidad'];
        control.removeAt(i);
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
        var _this = this;
        debugger;
        /*Vamos a tener que revisar que pasa con las fechas */
        if (isvalid) {
            var profOperation = void 0;
            profOperation = this.profesionalService.put(model);
            profOperation.subscribe(function (resultado) {
                _this.data.emit(resultado);
            });
        }
        else {
            alert("Complete datos obligatorios");
        }
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