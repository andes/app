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
var barrio_service_1 = require('./../../services/barrio.service');
var localidad_service_1 = require('./../../services/localidad.service');
var pais_service_1 = require('./../../services/pais.service');
var organizacion_service_1 = require('./../../services/organizacion.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var provincia_service_1 = require('./../../services/provincia.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var enumerados = require('./../../utils/enumerados');
var OrganizacionCreateComponent = (function () {
    function OrganizacionCreateComponent(formBuilder, organizacionService, PaisService, provinciaService, ProvinciaService, LocalidadService, BarrioService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.organizacionService = organizacionService;
        this.PaisService = PaisService;
        this.provinciaService = provinciaService;
        this.ProvinciaService = ProvinciaService;
        this.LocalidadService = LocalidadService;
        this.BarrioService = BarrioService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
    }
    OrganizacionCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.tiposcom = enumerados.getTipoComunicacion();
        this.tiposContactos = enumerados.getTipoComunicacion();
        this.PaisService.get().subscribe(function (resultado) { _this.paises = resultado; });
        this.ProvinciaService.get().subscribe(function (resultado) { _this.todasProvincias = resultado; });
        this.LocalidadService.get().subscribe(function (resultado) { _this.todasLocalidades = resultado; });
        this.tipoEstablecimientoService.get()
            .subscribe(function (resultado) { _this.tipos = resultado; });
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            nivelComplejidad: [''],
            codigo: this.formBuilder.group({
                sisa: ['', forms_1.Validators.required],
                cuie: [''],
                remediar: [''],
            }),
            tipoEstablecimiento: [''],
            telecom: this.formBuilder.array([
                this.formBuilder.group({
                    tipo: [''],
                    valor: [''],
                    ranking: [''],
                    activo: ['']
                }),
            ]),
            direccion: this.formBuilder.array([
                this.formBuilder.group({
                    valor: [''],
                    ubicacion: this.formBuilder.group({
                        pais: [''],
                        provincia: [''],
                        localidad: ['']
                    }),
                    ranking: [''],
                    codigoPostal: [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                })
            ]),
            contacto: this.formBuilder.array([])
        });
    };
    OrganizacionCreateComponent.prototype.iniContacto = function () {
        // Inicializa contacto
        var cant = 0;
        var fecha = new Date();
        return this.formBuilder.group({
            proposito: [''],
            nombre: [''],
            apellido: [''],
            tipo: [''],
            valor: [''],
            activo: [true]
        });
    };
    OrganizacionCreateComponent.prototype.addContacto = function () {
        // agrega formMatricula 
        var control = this.createForm.controls['contacto'];
        control.push(this.iniContacto());
    };
    OrganizacionCreateComponent.prototype.removeContacto = function (i) {
        // elimina formMatricula
        var control = this.createForm.controls['contacto'];
        control.removeAt(i);
    };
    OrganizacionCreateComponent.prototype.filtrarProvincias = function (indiceSelected) {
        var idPais = this.paises[indiceSelected].id;
        this.provincias = this.todasProvincias.filter(function (p) { return p.pais.id == idPais; });
        this.localidades = [];
    };
    OrganizacionCreateComponent.prototype.filtrarLocalidades = function (indiceSelected) {
        var idProvincia = this.provincias[indiceSelected].id;
        this.localidades = this.todasLocalidades.filter(function (p) { return p.provincia.id == idProvincia; });
    };
    OrganizacionCreateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var estOperation = void 0;
            model.activo = true;
            estOperation = this.organizacionService.post(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    OrganizacionCreateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], OrganizacionCreateComponent.prototype, "data", void 0);
    OrganizacionCreateComponent = __decorate([
        core_1.Component({
            selector: 'organizacion-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/organizacion/organizacion-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, organizacion_service_1.OrganizacionService, pais_service_1.PaisService, provincia_service_1.ProvinciaService, provincia_service_1.ProvinciaService, localidad_service_1.LocalidadService, barrio_service_1.BarrioService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], OrganizacionCreateComponent);
    return OrganizacionCreateComponent;
}());
exports.OrganizacionCreateComponent = OrganizacionCreateComponent;
//# sourceMappingURL=organizacion-create.component.js.map