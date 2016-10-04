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
var organizacion_service_1 = require('./../../services/organizacion.service');
var provincia_service_1 = require('./../../services/provincia.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var OrganizacionUpdateComponent = (function () {
    function OrganizacionUpdateComponent(formBuilder, organizacionService, provinciaService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.organizacionService = organizacionService;
        this.provinciaService = provinciaService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
        this.localidades = [];
    }
    OrganizacionUpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //Carga de combos
        this.provinciaService.get()
            .subscribe(function (resultado) { return _this.provincias = resultado; });
        // this.provinciaService.getLocalidades(this.organizacionHijo.domicilio.provincia)
        //     .subscribe(resultado => { this.localidades = resultado[0].localidades});
        this.tipoEstablecimientoService.get()
            .subscribe(function (resultado) { _this.tipos = resultado; });
        this.updateForm = this.formBuilder.group({
            nombre: [this.organizacionHijo.nombre, forms_1.Validators.required],
            nivelComplejidad: [this.organizacionHijo.nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [this.organizacionHijo.codigo.sisa, forms_1.Validators.required],
                cuie: [this.organizacionHijo.codigo.cuie],
                remediar: [this.organizacionHijo.codigo.remediar],
            }),
            // domicilio: this.formBuilder.group({
            //     calle: [this.organizacionHijo.domicilio.calle, Validators.required],
            //     numero: [this.organizacionHijo.domicilio.numero],
            //     provincia: [this.organizacionHijo.domicilio.provincia],
            //     localidad: []
            // }),
            tipoEstablecimiento: ['']
        });
        //    this.myProvincia=  this.organizacionHijo.domicilio.provincia;
        this.myTipoEst = this.organizacionHijo.tipoEstablecimiento;
        //    this.myLocalidad = this.organizacionHijo.domicilio.localidad;
    };
    OrganizacionUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        debugger;
        if (isvalid) {
            var estOperation = void 0;
            model.tipoEstablecimiento = this.myTipoEst;
            model.habilitado = this.organizacionHijo.activo;
            model._id = this.organizacionHijo._id;
            model.domicilio.localidad = this.myLocalidad;
            estOperation = this.organizacionService.put(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    OrganizacionUpdateComponent.prototype.getLocalidades = function (index) {
        //this.localidades = this.provincias[index].localidades;
    };
    OrganizacionUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
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
        __metadata('design:paramtypes', [forms_1.FormBuilder, organizacion_service_1.OrganizacionService, provincia_service_1.ProvinciaService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], OrganizacionUpdateComponent);
    return OrganizacionUpdateComponent;
}());
exports.OrganizacionUpdateComponent = OrganizacionUpdateComponent;
//# sourceMappingURL=organizacion-update.component.js.map