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
var paciente_create_component_1 = require('./paciente-create.component');
var paciente_service_1 = require('./../../services/paciente.service');
var core_1 = require('@angular/core');
var forms_1 = require('@angular/forms');
var common_1 = require('@angular/common');
var OrganizacionComponent = (function () {
    function OrganizacionComponent(formBuilder, pacienteService) {
        this.formBuilder = formBuilder;
        this.pacienteService = pacienteService;
        this.showcreate = false;
        this.showupdate = false;
        this.checked = true;
    }
    OrganizacionComponent.prototype.ngOnInit = function () {
        this.searchForm = this.formBuilder.group({
            nombre: [''],
            apellido: [''],
            documento: [''],
            sexo: [''],
            estado: [''],
            fechaNacimiento: ['']
        });
        /*this.searchForm.valueChanges.debounceTime(200).subscribe((form) => {
            this.loadPacientes(form.nombre, form.apellido,form.documento,form.sexo,form.estado,form.fechaNacimiento);
        })*/
    };
    OrganizacionComponent.prototype.findPacientes = function () {
        var _this = this;
        var formulario = this.searchForm.value;
        this.pacienteService.get()
            .subscribe(function (pacientes) { return _this.pacientes = pacientes; }, //Bind to view
        function (//Bind to view
            err) {
            if (err) {
                console.log(err);
            }
        });
    };
    OrganizacionComponent.prototype.onDisable = function (objPaciente) {
        /*this.pacienteService.disable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });*/
    };
    OrganizacionComponent.prototype.onEnable = function (objPaciente) {
        /*this.organizacionService.enable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });*/
    };
    OrganizacionComponent.prototype.onEdit = function (objPaciente) {
        /*this.showcreate = false;
        this.showupdate = true;
        debugger;
        this.selectedOrg = objOrganizacion;*/
    };
    OrganizacionComponent = __decorate([
        core_1.Component({
            selector: 'organizaciones',
            directives: [forms_1.REACTIVE_FORM_DIRECTIVES, common_1.FORM_DIRECTIVES, paciente_create_component_1.PacienteCreateComponent],
            templateUrl: 'components/organizacion/organizacion.html'
        }), 
        __metadata('design:paramtypes', [forms_1.FormBuilder, paciente_service_1.PacienteService])
    ], OrganizacionComponent);
    return OrganizacionComponent;
}());
exports.OrganizacionComponent = OrganizacionComponent;
//# sourceMappingURL=paciente.component.js.map