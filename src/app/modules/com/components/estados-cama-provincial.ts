import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { map, Observable, flatMap, from, mergeMap, shareReplay } from 'rxjs';
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
    public unidadesOrganizativas = [];
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
        this.cargaUnidadesOrganizativas();
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

    cargaUnidadesOrganizativas() {
        this.camasEstados$.pipe(
            map(data => {
                // Aplanar todas las unidades organizativas en un solo array
                const todas = data.reduce(
                    (acc, item) => acc.concat(item.unidadesOrganizativas),
                    [] as { conceptId: string; term: string }[]
                );
                const unicas = [
                    ...new Map(todas.map(uo => [uo.conceptId, uo])).values()
                ];
                unicas.sort((a: any, b: any) => a.term.localeCompare(b.term, 'es', { sensitivity: 'base' }));
                return unicas;
            })
        ).subscribe(unidades => {
            this.unidadesOrganizativas = unidades;
        });

    }
}

