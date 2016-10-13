import { PacienteUpdateComponent } from './paciente-update.component';
import {
    PacienteCreateComponent
} from './paciente-create.component';
import {
    IPaciente
} from './../../interfaces/IPaciente';
import {
    PacienteService
} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';

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
    selector: 'pacientes',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, PacienteCreateComponent, PacienteUpdateComponent],
    templateUrl: 'components/paciente/paciente.html'
})
export class PacienteComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    error: boolean = false;
    mensaje: string = "";
    pacientes: IPaciente[];
    estados: string[] = [];
    sexos: string[] = [];
    searchForm: FormGroup;
    selectedPaciente: IPaciente;

    constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {}

    checked: boolean = true;

    ngOnInit() {

        this.sexos = enumerados.getSexo();
        this.estados = enumerados.getEstados();

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

    loadPaciente() {
        this.error = false;
        var formulario = this.searchForm.value;
        this.pacienteService.getBySerch(formulario.apellido, formulario.nombre, formulario.documento, formulario.estado,
                formulario.fechaNacimiento, formulario.sexo)
            .subscribe(
                pacientes => this.pacientes = pacientes, //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                        this.error = true;
                        return;

                    }
                });
    }

    findPacientes() {
        this.error = false;
        var formulario = this.searchForm.value;
        if ((formulario.apellido == "") && (formulario.nombre == "") && (formulario.documento == "") &&
            (formulario.sexo == "") && (formulario.estado == "") && (formulario.fechaNacimiento == "")) {
            this.error = true;
            this.mensaje = "Debe completar al menos un campo de búsqueda";
            return;
        }
        this.loadPaciente();
    }


    onDisable(objPaciente: IPaciente) {
        this.error = false;
        this.pacienteService.disable(objPaciente)
            .subscribe(dato => this.loadPaciente(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                        this.error = true;
                        this.mensaje = "Ha ocurrido un error";
                        return;
                    }
                });
    }

    onReturn(objPaciente: IPaciente): void {
        this.showcreate = false;
        this.showupdate = false;
        if(objPaciente){
           this.loadPaciente();
        } 
    }

    onEnable(objPaciente: IPaciente) {
        this.error = false;
        this.pacienteService.enable(objPaciente)
            .subscribe(dato => this.loadPaciente(), //Bind to view
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
    }

    onEdit(objPaciente: IPaciente) {
        this.showcreate = false;
        this.showupdate = true;
        this.selectedPaciente = objPaciente;
    }

}