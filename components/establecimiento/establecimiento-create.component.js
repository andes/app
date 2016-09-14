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
var establecimiento_service_1 = require('./../../services/establecimiento.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var provincia_service_1 = require('./../../services/provincia.service');
var tipoEstablecimiento_service_1 = require('./../../services/tipoEstablecimiento.service');
var EstablecimientoCreateComponent = (function () {
    function EstablecimientoCreateComponent(formBuilder, establecimientoService, provinciaService, tipoEstablecimientoService) {
        this.formBuilder = formBuilder;
        this.establecimientoService = establecimientoService;
        this.provinciaService = provinciaService;
        this.tipoEstablecimientoService = tipoEstablecimientoService;
        this.data = new core_1.EventEmitter();
        this.localidades = [];
    }
    EstablecimientoCreateComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.provinciaService.get()
            .subscribe(function (resultado) {
            _this.provincias = resultado;
            _this.localidades = _this.provincias[0].localidades;
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
            tipoEstablecimiento: [''],
        });
    };
    EstablecimientoCreateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var estOperation = void 0;
            debugger;
            model.habilitado = true;
            estOperation = this.establecimientoService.post(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EstablecimientoCreateComponent.prototype.getLocalidades = function (index) {
        this.localidades = this.provincias[index].localidades;
    };
    EstablecimientoCreateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], EstablecimientoCreateComponent.prototype, "data", void 0);
    EstablecimientoCreateComponent = __decorate([
        core_1.Component({
            selector: 'establecimiento-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/establecimiento/establecimiento-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, establecimiento_service_1.EstablecimientoService, provincia_service_1.ProvinciaService, tipoEstablecimiento_service_1.TipoEstablecimientoService])
    ], EstablecimientoCreateComponent);
    return EstablecimientoCreateComponent;
}());
exports.EstablecimientoCreateComponent = EstablecimientoCreateComponent;
//# sourceMappingURL=establecimiento-create.component.js.map