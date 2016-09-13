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
var establecimiento_service_1 = require('./../../services/establecimiento.service');
var provincia_service_1 = require('./../../services/provincia.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var EstablecimientoUpdateComponent = (function () {
    function EstablecimientoUpdateComponent(formBuilder, establecimientoService, provinciaService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.establecimientoService = establecimientoService;
        this.provinciaService = provinciaService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
        this.localidades = [];
    }
    EstablecimientoUpdateComponent.prototype.ngOnInit = function () {
        var _this = this;
        //CArga de combos
        this.provinciaService.get()
            .subscribe(function (resultado) { return _this.provincias = resultado; });
        this.provinciaService.getLocalidades(this.establecimientoHijo.domicilio.provincia)
            .subscribe(function (resultado) { return _this.localidades = resultado.localidades; });
        this.tipoEstablecimientoService.get()
            .subscribe(function (resultado) { _this.tipos = resultado; });
        this.updateForm = this.formBuilder.group({
            nombre: [this.establecimientoHijo.nombre, forms_1.Validators.required],
            nivelComplejidad: [this.establecimientoHijo.nivelComplejidad],
            descripcion: [this.establecimientoHijo.descripcion, forms_1.Validators.required],
            codigo: this.formBuilder.group({
                sisa: [this.establecimientoHijo.codigo.sisa, forms_1.Validators.required],
                cuie: [this.establecimientoHijo.codigo.cuie],
                remediar: [this.establecimientoHijo.codigo.remediar],
            }),
            domicilio: this.formBuilder.group({
                calle: [this.establecimientoHijo.domicilio.calle, forms_1.Validators.required],
                numero: [this.establecimientoHijo.domicilio.numero],
                provincia: [this.establecimientoHijo.domicilio.provincia],
                localidad: [this.establecimientoHijo.domicilio.localidad]
            }),
            tipoEstablecimiento: ['']
        });
        this.myProvincia = this.establecimientoHijo.domicilio.provincia;
        this.myTipoEst = this.establecimientoHijo.tipoEstablecimiento;
    };
    EstablecimientoUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        debugger;
        if (isvalid) {
            var estOperation = void 0;
            model.tipoEstablecimiento = this.myTipoEst;
            model.habilitado = this.establecimientoHijo.habilitado;
            estOperation = this.establecimientoService.put(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EstablecimientoUpdateComponent.prototype.getLocalidades = function (index) {
        debugger;
        this.localidades = this.provincias[index].localidades;
    };
    EstablecimientoUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Input('selectedEst'), 
        __metadata('design:type', Object)
    ], EstablecimientoUpdateComponent.prototype, "establecimientoHijo", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], EstablecimientoUpdateComponent.prototype, "data", void 0);
    EstablecimientoUpdateComponent = __decorate([
        core_1.Component({
            selector: 'establecimiento-update',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/establecimiento/establecimiento-update.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, establecimiento_service_1.EstablecimientoService, provincia_service_1.ProvinciaService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], EstablecimientoUpdateComponent);
    return EstablecimientoUpdateComponent;
}());
exports.EstablecimientoUpdateComponent = EstablecimientoUpdateComponent;
//# sourceMappingURL=establecimiento-update.component.js.map