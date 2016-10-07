import {
    PacienteCreateComponent
} from './paciente-create.component';

import {
    IPaciente
} from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import {
    Observable
} from 'rxjs/Rx';
import {
    Component,
    OnInit,
    Output,
    Input,
    EventEmitter
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    REACTIVE_FORM_DIRECTIVES
} from '@angular/forms';
import {
    Control,
    FORM_DIRECTIVES
} from '@angular/common';


@Component({
    selector: 'organizaciones',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, PacienteCreateComponent],
    templateUrl: 'components/organizacion/organizacion.html'
})
export class OrganizacionComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    pacientes: IPaciente[];
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {}

    checked: boolean = true;

    ngOnInit() {
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
    }

    findPacientes() {
        var formulario = this.searchForm.value;
        this.pacienteService.get()
            .subscribe(
                pacientes => this.pacientes = pacientes, //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
    }


        onDisable(objPaciente: IPaciente) {
        /*this.pacienteService.disable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });*/
    }

        onEnable(objPaciente: IPaciente) {
        /*this.organizacionService.enable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });*/
    }

        onEdit(objPaciente: IPaciente) {
        /*this.showcreate = false;
        this.showupdate = true;
        debugger;
        this.selectedOrg = objOrganizacion;*/
    }

}