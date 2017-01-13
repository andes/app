import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter, KeyValueDiffers } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from 'andes-shared/src/lib/server.service';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

const limit = 5;

@Component({
    selector: 'organizaciones',
    templateUrl: 'organizacion.html'
})
export class OrganizacionComponent implements OnInit {
    showcreate: boolean = false;
    datos: IOrganizacion[] = [];
    searchForm: FormGroup;
    seleccion: IOrganizacion;
    value: any;
    skip: number = 0;
    nombre: string = " ";
    activo: Boolean = null;

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService) { }

    checked: boolean = true;

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            nombre: [''],
            activo: true
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.value = value;
            this.skip = 0;
            this.loadDatos(false);
        })
        this.loadDatos();
    }

    loadDatos(concatenar: boolean = false) {
        let parametros = { "activo": this.value && this.value.activo, "nombre": this.value && this.value.nombre, "skip": this.skip, "limit": limit };
        this.organizacionService.get(parametros)
            .subscribe(
            datos => this.datos = concatenar ? this.datos.concat(datos) : datos) //Bind to view
    }

    onReturn(objOrganizacion: IOrganizacion): void {
        this.showcreate = false;
        this.seleccion = null;
        this.loadDatos();
    }

    onDisable(objOrganizacion: IOrganizacion) {
        this.organizacionService.disable(objOrganizacion)
            .subscribe(dato => this.loadDatos()) //Bind to view
    }

    onEnable(objOrganizacion: IOrganizacion) {
        this.organizacionService.enable(objOrganizacion)
            .subscribe(dato => this.loadDatos()) //Bind to view
    }

    activate(objOrganizacion: IOrganizacion) {
        if (objOrganizacion.activo) {

            this.organizacionService.disable(objOrganizacion)
                .subscribe(dato => this.loadDatos()) //Bind to view
        }
        else {
            this.organizacionService.enable(objOrganizacion)
                .subscribe(dato => this.loadDatos()) //Bind to view
        }
    }

    onEdit(objOrganizacion: IOrganizacion) {
        this.showcreate = true;
        this.seleccion = objOrganizacion;
    }

    nextPage() {
        this.skip += limit;
        this.loadDatos(true);
    }

}