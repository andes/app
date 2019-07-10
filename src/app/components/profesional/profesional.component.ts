
import { debounceTime } from 'rxjs/operators';
import { ProfesionalCreateUpdateComponent } from './profesional-create-update.component';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Observable } from 'rxjs';
import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from '@andes/plex';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'profesionales',
    templateUrl: 'profesional.html',
    styleUrls: [
        'profesional.scss'
    ]
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
    limit: any = 200;
    profesionalSelected: any = false;
    fotoProfesional: any;
    nuevoProfesional = false;
    // cantidad: IProfesional[];


    constructor(private formBuilder: FormBuilder, private profesionalService: ProfesionalService, public sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            apellido: [''],
            nombre: [''],
            documento: ['']
        });

        this.searchForm.valueChanges.pipe(debounceTime(1000)).subscribe((value) => {
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
            'limit': this.limit
        };
        this.profesionalService.getProfesional(parametros).subscribe(datos => {
            this.datos = datos;
        });
    }


    seleccionarProfesional(profesional) {
        this.profesionalSelected = profesional;
        this.profesionalService.getFoto({ id: this.profesionalSelected.id }).subscribe(resp => {
            this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
        });
    }




}
