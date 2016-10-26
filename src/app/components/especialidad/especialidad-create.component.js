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
var EspecialidadCreateComponent = (function () {
    function EspecialidadCreateComponent(formBuilder, especialidadService) {
        this.formBuilder = formBuilder;
        this.especialidadService = especialidadService;
        this.data = new core_1.EventEmitter();
    }
    EspecialidadCreateComponent.prototype.ngOnInit = function () {
        this.createForm = this.formBuilder.group({
            nombre: ['', forms_1.Validators.required],
            descripcion: [''],
            disciplina: [''],
            complejidad: [''],
            codigo: this.formBuilder.group({
                sisa: ['', forms_1.Validators.required]
            }),
        });
    };
    EspecialidadCreateComponent.prototype.onSave = function (model, isvalid) {
        var _this = this;
        if (isvalid) {
            var espOperation = void 0;
            model.habilitado = true;
            model.fechaAlta = Date();
            espOperation = this.especialidadService.post(model);
            espOperation.subscribe(function (resultado) { return _this.data.emit(resultado); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EspecialidadCreateComponent.prototype.onCancel = function () {
        this.data.emit(null);
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', core_1.EventEmitter)
    ], EspecialidadCreateComponent.prototype, "data", void 0);
    EspecialidadCreateComponent = __decorate([
        core_1.Component({
            selector: 'especialidad-create',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/especialidad/especialidad-create.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, especialidad_service_1.EspecialidadService])
    ], EspecialidadCreateComponent);
    return EspecialidadCreateComponent;
}());
exports.EspecialidadCreateComponent = EspecialidadCreateComponent;
//# sourceMappingURL=especialidad-create.component.js.map