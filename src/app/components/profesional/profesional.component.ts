import { ProfesionalCreateUpdateComponent } from './profesional-create-update.component';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

const limit = 7;

@Component({
    selector: 'profesionales',
    templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    datos: IProfesional[];
    searchForm: FormGroup;
    seleccion: IProfesional;
    skip: number = 0;
    loader: boolean = false;
    finScroll: boolean = false;
    tengoDatos: boolean = true;
    value: any;
    cantidad: IProfesional[];
   

    constructor(private formBuilder: FormBuilder, private profesionalService: ProfesionalService) { }

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            apellido: [''],
            nombre: [''],
            documento: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.value = value;
            this.skip = 0;
            this.loadDatos(false);
        })
        this.loadDatos();

    }

    loadDatos(concatenar: boolean = false) {
        let parametros = { "apellido": this.value && this.value.apellido, "nombre": this.value && this.value.nombre, "documento": this.value && this.value.documento, "skip": this.skip, "limit": limit };
        this.profesionalService.get(parametros)
            .subscribe(
            datos => {
                if (concatenar) {
                    if (datos.length > 0) {
                        this.datos = this.datos.concat(datos);
                    }
                    else {
                        this.finScroll = true;
                        this.tengoDatos = false;
                    }
                } else {
                    this.datos = datos;
                    this.finScroll = false;
                }

                this.loader = false;
            }) //Bind to view

        //Todo esto trae el total de profesionales.. VEER..
        let parametro = { limit: '' };
        this.profesionalService.get(parametro)
            .subscribe(
            cantidad => {
                this.cantidad = cantidad;
                console.log(this.cantidad);
            })
    }

    // loadProfesionales() {
    //     this.profesionalService.get()
    //         .subscribe(
    //         profesionales => this.profesionales = profesionales, //Bind to view
    //         err => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    // }

    // loadProfesionalesFiltrados(apellido: string,nombre: String,documento: String){
    //      if (apellido || nombre || documento)
    //      {
    //          this.profesionalService.getByTerm(apellido,nombre,documento)
    //         .subscribe(
    //         profesionales =>this.profesionales = profesionales, //Bind to view
    //         err => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    //      }else
    //      {
    //          this.loadProfesionales();
    //      }

    // }

    onReturn(objProfesional: IProfesional): void {
        this.showcreate = false;
        this.showupdate = false;
        if (objProfesional) {
            this.loadDatos();
        }
    }

    Activo(objProfesional: IProfesional) {
        if (objProfesional.activo) {
            this.profesionalService.disable(objProfesional)
                .subscribe(dato => this.loadDatos()) //Bind to view
        }
        else {
            this.profesionalService.enable(objProfesional)
                .subscribe(dato => this.loadDatos()) //Bind to view
        }
    }

    onEdit(objProfesional: IProfesional) {
        console.log(objProfesional);
        this.showcreate = false;
        this.showupdate = true;
        this.seleccion = objProfesional;
    }

    nextPage() {
        if (this.tengoDatos){
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
    }

}