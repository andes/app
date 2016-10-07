import { ProfesionalUpdateComponent } from './profesional-update.component';
import { ProfesionalCreateComponent } from './profesional-create.component';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {Control, FORM_DIRECTIVES} from '@angular/common';

@Component({
    selector: 'profesionales',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES, ProfesionalUpdateComponent, ProfesionalCreateComponent],
    templateUrl: 'components/profesional/profesional.html'
})
export class ProfesionalComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    profesionales: IProfesional[];
    searchForm: FormGroup;
    selectedProfesional: IProfesional;

    constructor(private formBuilder: FormBuilder, private profesionalService: ProfesionalService) {}

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            apellido: [''],
            nombre: [''],
            documento: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.loadProfesionalesFiltrados(value.apellido,value.nombre,value.documento);
        })

        this.loadProfesionales();
    }

    loadProfesionales() {
        this.profesionalService.get()
            .subscribe(
            profesionales => this.profesionales = profesionales, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadProfesionalesFiltrados(apellido: string,nombre: String,documento: String){
         if (apellido || nombre || documento)
         {
             this.profesionalService.getByTerm(apellido,nombre,documento)
            .subscribe(
            profesionales =>this.profesionales = profesionales, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
         }else
         {
             this.loadProfesionales();
         }
         
    }

    onReturn(objProfesional: IProfesional): void {
        this.showcreate = false;
        this.showupdate = false;
        if(objProfesional){
            this.loadProfesionales();
        } 
    }


    onDisable(objProfesional:IProfesional){
        this.profesionalService.disable(objProfesional)
            .subscribe(dato => this.loadProfesionales(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

     onEnable(objProfesional:IProfesional){
        this.profesionalService.enable(objProfesional)
            .subscribe(dato => this.loadProfesionales(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEdit(objProfesional:IProfesional){
        this.showupdate = true;
        this.selectedProfesional = objProfesional;

    }
}