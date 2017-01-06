import { ProfesionalCreateUpdateComponent } from './profesional-create-update.component';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'profesionales',
    templateUrl: 'profesional.html'
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



     Activo(objProfesional:IProfesional) {
         if(objProfesional.activo){
       this.profesionalService.disable(objProfesional)
            .subscribe(dato => this.loadProfesionales()) //Bind to view
        }
        else {
           this.profesionalService.enable(objProfesional)
            .subscribe(dato => this.loadProfesionales()) //Bind to view
        }
    }


    onEdit(objProfesional:IProfesional){
        this.showupdate = true;
        this.selectedProfesional = objProfesional;

    }

}