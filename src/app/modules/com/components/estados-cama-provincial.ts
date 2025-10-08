import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../services/organizacion.service';
import { EstadosCamaProvincialService } from './../services/estados-cama-provincial.service';

@Component({
    selector: 'estados-cama-provincial',
    templateUrl: 'estados-cama-provincial.html',
    styleUrls: ['./estados-cama-provincial.scss']
})

export class EstadosCamaProvincialComponent implements OnInit {

    constructor(
        private organizacionService: OrganizacionService,
        private estadosCamaProvincialService: EstadosCamaProvincialService,
        private auth: Auth
    ) { }

    public camasEstados$: Observable<any[]>;
    public selectedOrganizacion: IOrganizacion;
    public selectedUnidadOrganizativa;
    public unidadesOrganizativas$: Observable<any[]>;
    public organizacionCamas: any[] = [];
    public showSidebar = false;
    public efectorSelected;
    public fecha = moment().toDate();
    public fechaLimite = new Date();
    public capa = 'medica';
    public ambito = 'internacion';
    public listadoActual: any[] = [];

    ngOnInit() {
        this.camasEstados$ = this.estadosCamaProvincialService.camasEstados$;
    }

    closeSidebar() {
        this.showSidebar = !this.showSidebar;
        this.efectorSelected = null;
    }

    verDetalle(efector) {
        this.efectorSelected = efector;
        this.showSidebar = true;
    }

    setFecha() {
        this.fecha = moment().toDate();
        this.estadosCamaProvincialService.fecha.next(this.fecha);
    }

    filtrar() {
        this.estadosCamaProvincialService.organizacion.next(this.selectedOrganizacion?.id);
        this.estadosCamaProvincialService.unidadOrganizativa.next(this.selectedUnidadOrganizativa?.conceptId);
    }
}
