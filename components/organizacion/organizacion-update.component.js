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
var localidad_service_1 = require('./../../services/localidad.service');
var pais_service_1 = require('./../../services/pais.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var organizacion_service_1 = require('./../../services/organizacion.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var provincia_service_1 = require('./../../services/provincia.service');
var enumerados = require('./../../utils/enumerados');
var OrganizacionUpdateComponent = (function () {
    function OrganizacionUpdateComponent(formBuilder, organizacionService, PaisService, ProvinciaService, LocalidadService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.organizacionService = organizacionService;
        this.PaisService = PaisService;
        this.ProvinciaService = ProvinciaService;
        this.LocalidadService = LocalidadService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
        this.todasProvincias = [];
        this.todasLocalidades = [];
    }
    OrganizacionUpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //Carga de combos
        this.tiposcom = enumerados.getTipoComunicacion();
        this.PaisService.get().subscribe(function (resultado) { _this.paises = resultado; });
        this.ProvinciaService.get().subscribe(function (resultado) { _this.todasProvincias = resultado; });
        this.LocalidadService.get().subscribe(function (resultado) { _this.todasLocalidades = resultado; });
        this.tipoEstablecimientoService.get().subscribe(function (resultado) { _this.tipos = resultado; });
        this.updateForm = this.formBuilder.group({
            nombre: [this.organizacionHijo.nombre, forms_1.Validators.required],
            nivelComplejidad: [this.organizacionHijo.nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [this.organizacionHijo.codigo.sisa, forms_1.Validators.required],
                cuie: [this.organizacionHijo.codigo.cuie],
                remediar: [this.organizacionHijo.codigo.remediar],
            }),
            tipoEstablecimiento: [this.organizacionHijo.tipoEstablecimiento],
            telecom: this.formBuilder.array([]),
            direccion: this.formBuilder.array([])
        });
        this.organizacionHijo.telecom.forEach(function (element) {
            var control = _this.updateForm.controls['telecom'];
            control.push(_this.formBuilder.group({
                tipo: [(element.tipo === undefined) ? "" : element.tipo],
                valor: [element.valor],
                ranking: [element.ranking],
                activo: [element.activo]
            }));
            debugger;
        });
        // this.organizacionHijo.direccion.forEach(element => {
        //     const control = <FormArray> this.updateForm.controls['direccion'];
        //     control.push(this.formBuilder.group({
        //         valor:[element.valor],
        //         codigoPostal:[element.codigoPostal],
        //         ubicacion: this.formBuilder.group({
        //             pais: [(element.ubicacion.pais === undefined)?{id:"",nombre:""}:element.ubicacion.pais],
        //             provincia: [(element.ubicacion.provincia === undefined)?{id:"",nombre:""}:element.ubicacion.provincia],
        //             localidad: [(element.ubicacion.localidad === undefined)?{id:"",nombre:""}:element.ubicacion.localidad]
        //         }),
        //         activo: [element.activo]
        //     }));
        //     this.myPais = (element.ubicacion.pais === undefined)?{id:"",nombre:""}:element.ubicacion.pais;
        //     this.myProvincia = (element.ubicacion.provincia === undefined)?{id:"",nombre:""}:element.ubicacion.provincia;
        //     this.myLocalidad = (element.ubicacion.localidad === undefined)?{id:"",nombre:""}:element.ubicacion.localidad;
        // });
        this.myTipoEst = (this.organizacionHijo.tipoEstablecimiento === undefined) ? { id: "", nombre: "" } :
            this.organizacionHijo.tipoEstablecimiento;
        this.loadDirecciones();
    };
    OrganizacionUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var estOperation = void 0;
            model.id = this.organizacionHijo.id;
            model.tipoEstablecimiento = this.myTipoEst;
            estOperation = this.organizacionService.put(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    OrganizacionUpdateComponent.prototype.filtrarProvincias = function (indiceSelected) {
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == idPais; });
        debugger;
        this.localidades = [];
    };
    OrganizacionUpdateComponent.prototype.filtrarLocalidades = function (indiceSelected) {
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) { return p.provincia.id == idProvincia; });
    };
    OrganizacionUpdateComponent.prototype.setDireccion = function (objDireccion) {
        var _this = this;
        //OJO revisar en el create el tema de los paises, localidades, etc no los guarda como obj solo el id
        debugger;
        if (objDireccion) {
            if (objDireccion.ubicacion) {
                if (objDireccion.ubicacion.pais) {
                    this.myPais = objDireccion.ubicacion.pais;
                    if (objDireccion.ubicacion.provincia) {
                        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == _this.myPais.id; });
                        this.myProvincia = objDireccion.ubicacion.provincia;
                        if (objDireccion.ubicacion.localidad) {
                            this.localidades = this.todasLocalidades.filter(function (loc) { return loc.provincia.id == _this.myProvincia.id; });
                            this.myLocalidad = objDireccion.ubicacion.localidad;
                        }
                    }
                }
            }
        }
        return this.formBuilder.group({
            valor: [objDireccion.valor],
            codigoPostal: [objDireccion.codigoPostal],
            ubicacion: this.formBuilder.group({
                pais: [this.myPais],
                provincia: [this.myProvincia],
                localidad: [this.myLocalidad]
            }),
            ranking: [objDireccion.ranking],
            activo: [objDireccion.activo]
        });
    };
    OrganizacionUpdateComponent.prototype.loadDirecciones = function () {
        var cantDirecciones = this.organizacionHijo.direccion.length;
        var control = this.updateForm.controls['direccion'];
        debugger;
        if (cantDirecciones > 0) {
            for (var i = 0; i < cantDirecciones; i++) {
                var objDireccion = this.organizacionHijo.direccion[i];
                control.push(this.setDireccion(objDireccion));
            }
        }
    };
    OrganizacionUpdateComponent.prototype.cambiarTipoEst = function (indiceSelected) {
        this.myTipoEst = this.tipos[indiceSelected];
    };
    OrganizacionUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    OrganizacionUpdateComponent.prototype.iniContacto = function (objContacto) {
        // Inicializa contacto
        var cant = 0;
        var fecha = new Date();
        debugger;
        return this.formBuilder.group({
            proposito: [objContacto.proposito],
            nombre: [''],
            apellido: [''],
            tipo: [''],
            valor: [''],
            activo: [true]
        });
    };
    OrganizacionUpdateComponent.prototype.addContacto = function (objContacto) {
        // agrega formMatricula 
        var control = this.updateForm.controls['contacto'];
        debugger;
        control.push(this.iniContacto(objContacto));
    };
    OrganizacionUpdateComponent.prototype.removeContacto = function (i) {
        // elimina formMatricula
        var control = this.updateForm.controls['contacto'];
        control.removeAt(i);
    };
    __decorate([
        core_1.Input('selectedOrg'), 
        __metadata('design:type', Object)
    ], OrganizacionUpdateComponent.prototype, "organizacionHijo", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], OrganizacionUpdateComponent.prototype, "data", void 0);
    OrganizacionUpdateComponent = __decorate([
        core_1.Component({
            selector: 'organizacion-update',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/organizacion/organizacion-update.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, organizacion_service_1.OrganizacionService, pais_service_1.PaisService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], OrganizacionUpdateComponent);
    return OrganizacionUpdateComponent;
}());
exports.OrganizacionUpdateComponent = OrganizacionUpdateComponent;
//# sourceMappingURL=organizacion-update.component.js.map