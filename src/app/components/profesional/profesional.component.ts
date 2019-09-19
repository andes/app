
import { debounceTime } from 'rxjs/operators';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';

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


    constructor(private formBuilder: FormBuilder, private profesionalService: ProfesionalService, public sanitizer: DomSanitizer, private router: Router) { }

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
    routeTo(action, id) {
        this.router.navigate([`tm/profesional/${action}/${id}`]);
    }
}
