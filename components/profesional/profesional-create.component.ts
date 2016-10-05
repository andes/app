import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';

import { ProfesionalService } from './../../services/profesional.service';
import { ProvinciaService } from './../../services/provincia.service';
import { IProfesional } from './../../interfaces/IProfesional';
import { IMatricula } from './../../interfaces/IMatricula';
import { IProvincia } from './../../interfaces/IProvincia';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'profesional-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/profesional/profesional-create.html'
})
export class ProfesionalCreateComponent implements OnInit {

    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    provincias: IProvincia[];
    createForm: FormGroup;
    localidades: any[] = [];
    arrSexos: any [];

    constructor(private formBuilder: FormBuilder, private provinciaService: ProvinciaService,
        private profesionalService: ProfesionalService) { }

    ngOnInit() {

        //Carga de combos
        this.arrSexos = enumerados.getSexo();
        this.provinciaService.get()
            .subscribe(resultado => this.provincias = resultado);

        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            apellido: ['', Validators.required],
            documento: ['', Validators.required],
            fechaNacimiento: [''],
            sexo: [],
            domicilios: this.formBuilder.array([
                this.iniDomicilio()
            ]),
            telefono: [''],
            email: [''],
            matriculas: this.formBuilder.array([
                this.iniMatricula()

            ])
        });
    }

    iniMatricula() {
        // Inicializa matrículas
        return this.formBuilder.group({
            numero: ['', Validators.required],
            descripcion: [''],
            fechaInicio: [''],
            fechaVencimiento: [''],
            vigente: [false]
        });
    }

    addMatricula() {
        // agrega formMatricula 
        const control = <FormArray>this.createForm.controls['matriculas'];
        control.push(this.iniMatricula());
    }

    removeMatricula(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.createForm.controls['matriculas'];
        control.removeAt(i);
    }

    /*Sección  Domicilio*/
    iniDomicilio() {
        // Inicializa los domicilios
        return this.formBuilder.group({
            valor: [''],
            codigoPostal: [''],
            fechaUltimaActualizacion: [''],
            longitud: [''],
            latitud: [''],
            activo: [true]
        });
    }


    addDomicilio(){

    }


    onSave(model: IProfesional, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.activo = true;
            profOperation = this.profesionalService.post(model);

            profOperation.subscribe(resultado => { debugger; this.data.emit(resultado); });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
      //  this.localidades = this.provincias[index].localidades;
    }

    onCancel() {
        this.data.emit(null)
    }



}