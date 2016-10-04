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
var organizacion_service_1 = require('./../../services/organizacion.service');
var IOrganizacion_1 = require('./../../interfaces/IOrganizacion');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var provincia_service_1 = require('./../../services/provincia.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var OrganizacionCreateComponent = (function () {
    function OrganizacionCreateComponent(formBuilder, organizacionService, provinciaService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.organizacionService = organizacionService;
        this.provinciaService = provinciaService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
        this.localidades = [];
        this.tiposcom = IOrganizacion_1.tipoCom;
    }
    OrganizacionCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //this.tiposcom = tipoCom;
        this.keys = Object.keys(this.tiposcom);
        this.keys = this.keys.slice(this.keys.length / 2);
        this.provinciaService.get()
            .subscribe(function (resultado) {
            _this.provincias = resultado;
            //this.localidades = this.provincias[0].localidades;
        });
        this.tipoEstablecimientoService.get()
            .subscribe(function (resultado) { _this.tipos = resultado; });
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            nivelComplejidad: [''],
            descripcion: ['', forms_1.Validators.required],
            codigo: this.formBuilder.group({
                sisa: ['', forms_1.Validators.required],
                cuie: [''],
                remediar: [''],
            }),
            domicilio: this.formBuilder.group({
                calle: ['', forms_1.Validators.required],
                numero: [''],
                provincia: [''],
                localidad: ['']
            }),
            telecom: this.formBuilder.group({
                tipo: [''],
                valor: [''],
                ranking: [''],
                activo: ['']
            }),
            tipoEstablecimiento: [''],
        });
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
    OrganizacionCreateComponent.prototype.getLocalidades = function (index) {
        // this.localidades= this.provincias[index].localidades;
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
        __metadata('design:paramtypes', [forms_1.FormBuilder, organizacion_service_1.OrganizacionService, provincia_service_1.ProvinciaService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], OrganizacionCreateComponent);
    return OrganizacionCreateComponent;
}());
exports.OrganizacionCreateComponent = OrganizacionCreateComponent;
//# sourceMappingURL=organizacion-create.component.js.map