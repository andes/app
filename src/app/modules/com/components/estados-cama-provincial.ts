import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { OrganizacionService } from '../../../services/organizacion.service';
import { EstadosCamaProvincialService } from './../services/estados-cama-provincial.service';
import { Router } from '@angular/router';

@Component({
    selector: 'estados-cama-provincial',
    templateUrl: 'estados-cama-provincial.html',
    styleUrls: ['./estados-cama-provincial.scss']
})

export class EstadosCamaProvincialComponent implements OnInit {

    constructor(
        private estadosCamaProvincialService: EstadosCamaProvincialService,
        private router: Router
    ) { }

    public camasEstados$: Observable<any[]>;
    public selectedOrganizacion: IOrganizacion;
    public selectedUnidadOrganizativa;
    public unidadesOrganizativas = [];
    public capa = [
        { id: 'medica', nombre: 'Asistencial' }, // medica === asistencial
        { id: 'estadistica', nombre: 'Estadístico' }
    ];
    public capaSeleccionada = { id: 'medica', nombre: 'Asistencial' };
    public organizacionCamas: any[] = [];
    public showSidebar = false;
    public efectorSelected;
    public fecha = moment().toDate();
    public fechaLimite = new Date();
    public ambito = 'internacion';
    public listadoActual: any[] = [];

    ngOnInit() {
        this.camasEstados$ = this.estadosCamaProvincialService.camasEstados$;
        this.cargaUnidadesOrganizativas();
        this.filtrar();
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
        this.estadosCamaProvincialService.capa.next(this.capaSeleccionada?.id);
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


    goTo(efectorSelected, capaSeleccionada) {
        this.router.navigate([
            'mapa-camas',
            'internacion',
            'resumen',
            capaSeleccionada.id,
            efectorSelected.organizacion._id
        ]);
        // this.router.navigate([`mapa-camas/internacion/resumen/${capaSeleccionada.id}/${efectorSelected.organizacion._id}`]);
    }

}

