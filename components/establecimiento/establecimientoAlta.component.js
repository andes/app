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
var EstablecimientoAltaComponent = (function () {
    function EstablecimientoAltaComponent(formBuilder, establecimientoService) {
        this.formBuilder = formBuilder;
        this.establecimientoService = establecimientoService;
        /*Datos externos que deberían venir de algún servicio*/
        this.zonas = ['Zona I', 'Zona II', 'Zona III'];
        /*****************************************************/
        this.tipos = [{ nombre: 'Hospital', descripcion: 'Hospital desc', clasificacion: 'C1' }, { nombre: 'Centro de Salud', descripcion: 'Centro de Salud', clasificacion: 'C2' },
            { nombre: 'Posta Sanitaria', descripcion: 'Posta Sanitaria', clasificacion: 'C3' }];
    }
    EstablecimientoAltaComponent.prototype.ngOnInit = function () {
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
                localidad: this.formBuilder.group({
                    nombre: ['', forms_1.Validators.required],
                    codigoPostal: [''],
                    provincia: ['']
                })
            }),
            tipoEstablecimiento: ['']
        });
    };
    EstablecimientoAltaComponent.prototype.onSave = function (model, isvalid) {
        if (isvalid) {
            console.log(JSON.stringify(model));
            var estOperation = void 0;
            model.habilitado = true;
            estOperation = this.establecimientoService.postEstablecimiento(model);
            estOperation.subscribe(function (resultado) { return alert(resultado.nombre); });
        }
        else {
            alert("Complete datos obligatorios");
        }
    };
    EstablecimientoAltaComponent.prototype.onCancel = function () {
        alert('Hizo Clic en cancelar');
    };
    EstablecimientoAltaComponent = __decorate([
        core_1.Component({
            selector: 'establecimiento-alta',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES],
            templateUrl: 'components/establecimiento/establecimientoAlta.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, establecimiento_service_1.EstablecimientoService])
    ], EstablecimientoAltaComponent);
    return EstablecimientoAltaComponent;
}());
exports.EstablecimientoAltaComponent = EstablecimientoAltaComponent;
//# sourceMappingURL=establecimientoAlta.component.js.map