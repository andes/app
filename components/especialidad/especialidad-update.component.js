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
var especialidad_service_1 = require('./../../services/especialidad.service');
var EspecialidadUpdateComponent = (function () {
    function EspecialidadUpdateComponent(formBuilder, especialidadService) {
        this.formBuilder = formBuilder;
        this.especialidadService = especialidadService;
        this.data = new core_1.EventEmitter();
    }
    EspecialidadUpdateComponent.prototype.ngOnInit = function () {
        this.updateForm = this.formBuilder.group({
            nombre: [this.especialidadHija.nombre, forms_1.Validators.required],
            descripcion: [this.especialidadHija.descripcion, forms_1.Validators.required],
            disciplina: [this.especialidadHija.disciplina],
            complejidad: [this.especialidadHija.complejidad],
            codigo: this.formBuilder.group({
                sisa: [this.especialidadHija.codigo.sisa, forms_1.Validators.required],
            }),
        });
    };
    EspecialidadUpdateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var espOperation = void 0;
            model.habilitado = this.especialidadHija.habilitado;
            model.fechaAlta = this.especialidadHija.fechaAlta;
            model.fechaBaja = this.especialidadHija.fechaBaja;
            model._id = this.especialidadHija._id;
            debugger;
            espOperation = this.especialidadService.put(model);
            espOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EspecialidadUpdateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Input('selectedEsp'), 
        __metadata('design:type', Object)
    ], EspecialidadUpdateComponent.prototype, "especialidadHija", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], EspecialidadUpdateComponent.prototype, "data", void 0);
    EspecialidadUpdateComponent = __decorate([
        core_1.Component({
            selector: 'especialidad-update',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/especialidad/especialidad-update.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, especialidad_service_1.EspecialidadService])
    ], EspecialidadUpdateComponent);
    return EspecialidadUpdateComponent;
}());
exports.EspecialidadUpdateComponent = EspecialidadUpdateComponent;
//# sourceMappingURL=especialidad-update.component.js.map