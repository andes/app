import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServerService } from 'andes-shared/src/lib/server.service';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'organizaciones',
    templateUrl: 'organizacion.html'
})
export class OrganizacionComponent implements OnInit {
    showcreate: boolean = false;
    organizaciones: IOrganizacion[];
    searchForm: FormGroup;
    selectedOrg: IOrganizacion;

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService) { }

    checked: boolean = true;

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            nombre: [''],
            activo: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            this.loadOrganizacionesFiltrados(value.activo, value.nombre);
        })

        this.loadOrganizaciones();
    }

    loadOrganizaciones() {
        this.organizacionService.get({})
            .subscribe(
            organizaciones => this.organizaciones = organizaciones) //Bind to view
    }

    loadOrganizacionesFiltrados(activo: boolean, nombre: String) {
        console.log(activo);
        this.organizacionService.get({ "activo": activo, "nombre": nombre })
            .subscribe(
            organizaciones => this.organizaciones = organizaciones) //Bind to view
    }

    onReturn(objOrganizacion: IOrganizacion): void {
        this.showcreate = false;
        this.selectedOrg = null;
        this.loadOrganizaciones();
    }

    onDisable(objOrganizacion: IOrganizacion) {
        this.organizacionService.disable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones()) //Bind to view
    }
    onEnable(objOrganizacion: IOrganizacion) {
        this.organizacionService.enable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones()) //Bind to view
    }

    Activo(objOrganizacion: IOrganizacion) {

        if (objOrganizacion.activo) {

            this.organizacionService.disable(objOrganizacion)
                .subscribe(dato => { debugger; this.loadOrganizaciones() }) //Bind to view
        }
        else {
            this.organizacionService.enable(objOrganizacion)
                .subscribe(dato => this.loadOrganizaciones()) //Bind to view
        }
    }

    onEdit(objOrganizacion: IOrganizacion) {
        this.showcreate = true;
        this.selectedOrg = objOrganizacion;
    }

}