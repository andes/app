import { ProfesionalCreateUpdateComponent } from './profesional-create-update.component';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from '@andes/plex';

const limit = 50;

@Component({
    selector: 'profesionales',
    templateUrl: 'profesional.html'
})
export class ProfesionalComponent implements OnInit {
    showcreate = false;
    showupdate = false;
    datos: IProfesional[];
    searchForm: FormGroup;
    seleccion: IProfesional;
    skip = 0;
    loader = false;
    finScroll = false;
    tengoDatos = true;
    value: any;
    // cantidad: IProfesional[];


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
        });
        this.loadDatos();

    }

    loadDatos(concatenar: boolean = false) {
        let parametros = {
            'apellido': this.value && this.value.apellido,
            'nombre': this.value && this.value.nombre,
            'documento': this.value && this.value.documento,
            'skip': this.skip,
            'limit': limit
        };
        this.profesionalService.get(parametros)
            .subscribe(
            datos => {
                if (concatenar) {
                    if (datos.length > 0) {
                        this.datos = this.datos.concat(datos);
                    } else {
                        this.finScroll = true;
                        this.tengoDatos = false;
                    }
                } else {
                    this.datos = datos;
                    this.finScroll = false;
                }
                this.loader = false;
            });
    }

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
                .subscribe(dato => this.loadDatos()); // Bind to view
        } else {
            this.profesionalService.enable(objProfesional)
                .subscribe(dato => this.loadDatos()); // Bind to view
        }
    }

    onEdit(objProfesional: IProfesional) {
        this.showcreate = false;
        this.showupdate = true;
        this.seleccion = objProfesional;
    }

    nextPage() {
        if (this.tengoDatos) {
            this.skip += limit;
            this.loadDatos(true);
            this.loader = true;
        }
    }

}
