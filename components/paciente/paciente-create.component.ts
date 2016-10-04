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
    FormArray,
    Validators,
    REACTIVE_FORM_DIRECTIVES
} from '@angular/forms';


import {
    IPaciente, Sexo
} from './../../interfaces/IPaciente';
import {
    IMatricula
} from './../../interfaces/IMatricula';
import {
    IProvincia
} from './../../interfaces/IProvincia';

@Component({
    selector: 'paciente-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/paciente/paciente-create.html'
})
export class PacienteCreateComponent implements OnInit {
    createForm: FormGroup;
    estados = ["temporal", "identificado", "validado", "recienNacido", "extranjero"];
    sexos = ["femenino", "masculino", "otro"];
    generos = ["femenino", "masculino", "otro"];
    estadosCiviles = ["casado", "separado", "divorciado", "viudo", "soltero", "otro"];
    tiposContactos = ["telefonoFijo", "telefonoCelular", "email"];
    paises = [];
    provincias = [];
    localidades = [];
    barrios = [];

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {

        //CArga de combos
      //  this.provinciaService.get()
        //    .subscribe(resultado => this.provincias = resultado);

        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            alias: [''],
            documento: ['', Validators.required],
            fechaNacimiento: [''],
            estado: [''],
            sexo: [''],
            genero: [''],
            estadoCivil: [''],
            contacto: this.formBuilder.array([
                this.iniContacto(1)
            ])
        });
    }

    iniContacto(rank: Number) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: [''],
            valor: [''],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        // agrega formMatricula 
        const control = <FormArray> this.createForm.controls['contacto'];
        control.push(this.iniContacto(control.length));
    }

    removeContacto(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(i);
    }

    onSave(model: IPaciente, isvalid: boolean) {
        debugger;
        if (isvalid) {
            /* let profOperation: Observable < IProfesional > ;
             model.habilitado = true;
             profOperation = this.profesionalService.post(model);

             profOperation.subscribe(resultado => {
                 debugger;
                 this.data.emit(resultado);
             });*/

        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        //this.data.emit(null)
    }



}