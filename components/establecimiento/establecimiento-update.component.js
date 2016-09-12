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
var EstablecimientoUpdateComponent = (function () {
    function EstablecimientoUpdateComponent(formBuilder, establecimientoService) {
        this.formBuilder = formBuilder;
        this.establecimientoService = establecimientoService;
        this.data = new core_1.EventEmitter();
        /*Datos externos que deberían venir de algún servicio*/
        this.tipos = [{ nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion: 'C1' }, { nombre: 'Centro de Salud', descripcion: 'Centro de Salud', clasificacion: 'C2' },
            { nombre: 'Posta Sanitaria', descripcion: 'Posta Sanitaria', clasificacion: 'C3' }];
        this.provincias = [{ nombre: 'Neuquen', localidades: [{ nombre: 'Confluencia', codigoPostal: 8300 }, { nombre: 'Plottier', codigoPostal: 8389 }] },
            { nombre: 'Rio Negro', localidades: [{ nombre: 'Cipolletti', codigoPostal: 830890 }, { nombre: 'Cinco Saltos', codigoPostal: 8303 }] }];
        this.localidades = [];
    }
    EstablecimientoUpdateComponent.prototype.ngOnInit = function () {
        debugger;
        this.myTipoEst = this.selectedEst.tipoEstablecimiento;
        this.createForm = this.formBuilder.group({
            nombre: [this.selectedEst.nombre, forms_1.Validators.required],
            nivelComplejidad: [this.selectedEst.nivelComplejidad],
            descripcion: [this.selectedEst.descripcion, forms_1.Validators.required],
            codigo: this.formBuilder.group({
                sisa: [this.selectedEst.codigo.sisa, forms_1.Validators.required],
                cuie: [this.selectedEst.codigo.cuie],
                remediar: [this.selectedEst.codigo.remediar],
            }),
            domicilio: this.formBuilder.group({
                calle: [this.selectedEst.domicilio.calle, forms_1.Validators.required],
                numero: [this.selectedEst.domicilio.numero]
            }),
            tipoEstablecimiento: [],
            provincia: [''],
            localidad: ['']
        });
        //this.createForm.value = this.selectedEst;
    };
    EstablecimientoUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var estOperation = void 0;
            model.habilitado = true;
            estOperation = this.establecimientoService.post(model);
            estOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EstablecimientoUpdateComponent.prototype.getLocalidades = function (index) {
        this.localidades = this.provincias[index].localidades;
    };
    EstablecimientoUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Object)
    ], EstablecimientoUpdateComponent.prototype, "selectedEst", void 0);
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
        __metadata('design:paramtypes', [forms_1.FormBuilder, establecimiento_service_1.EstablecimientoService])
    ], EstablecimientoUpdateComponent);
    return EstablecimientoUpdateComponent;
}());
exports.EstablecimientoUpdateComponent = EstablecimientoUpdateComponent;
//# sourceMappingURL=establecimiento-update.component.js.map