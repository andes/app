import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
            codigoSisa: [''],
            nombre: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            let codSisa = value.codigoSisa ? value.codigoSisa : ""
            this.loadOrganizacionesFiltrados(codSisa, value.nombre);
        })

        this.loadOrganizaciones();
    }

    loadOrganizaciones() {
        this.organizacionService.get({})
            .subscribe(
            organizaciones => this.organizaciones = organizaciones, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadOrganizacionesFiltrados(codigoSisa: string, nombre: String) {
        this.organizacionService.get({ "codigoSisa": codigoSisa, "nombre": nombre })
            .subscribe(
            organizaciones => this.organizaciones = organizaciones, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onReturn(objOrganizacion: IOrganizacion): void {
        this.showcreate = false;
        this.selectedOrg = null;
        this.loadOrganizaciones();
    }

    onDisable(objOrganizacion: IOrganizacion) {
        this.organizacionService.disable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEnable(objOrganizacion: IOrganizacion) {
        this.organizacionService.enable(objOrganizacion)
            .subscribe(dato => this.loadOrganizaciones(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }
    
    onEdit(objOrganizacion: IOrganizacion) {
        this.showcreate = true;
        // this.showupdate = false;
        this.selectedOrg = objOrganizacion;
    }

}