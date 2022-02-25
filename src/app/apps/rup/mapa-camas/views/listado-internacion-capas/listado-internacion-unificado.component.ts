import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { ListadoInternacionCapasService } from './listado-internacion-capas.service';

@Component({
    selector: 'app-listado-internacion-unificado',
    templateUrl: './listado-internacion-unificado.component.html',
})

export class ListadoInternacionUnificadoComponent implements OnInit {
    listaInternacion$: Observable<IResumenInternacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;

    idInternacionSelected: string = null;

    // VARIABLES
    public listaInternacion;
    public listaInternacionAux;
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;

    mainView$ = this.mapaCamasService.mainView;


    public columns = [
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.paciente.apellido} ${a.paciente.nombre}`;
                const nameB = `${b.paciente.apellido} ${b.paciente.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.paciente.documento.localeCompare(b.paciente.documento)
        },
        {
            key: 'diagnostico',
            label: 'Motivo Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = a.diagnostico?.term || '';
                const nameB = b.diagnostico?.term || '';
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaIngreso.getTime() - b.fechaIngreso.getTime()
        },

        {
            key: 'fechaEgreso',
            label: 'Fecha Egreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaEgreso?.getTime() - b.fechaEgreso?.getTime()
        },
        {
            key: 'obraSocial',
            label: 'Obra social',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                const p1 = a.paciente.obraSocial?.nombre || '';
                const p2 = b.paciente.obraSocial?.nombre || '';
                return p1.localeCompare(p2);
            }
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad organizativa',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                return a.idPrestacion?.unidadOrganizativa.term.localeCompare(b.idPrestacion?.unidadOrganizativa.term);
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: true,
            opcional: true,
            sort: (a, b) => {
                return a.idPrestacion?.estadoActual.tipo.localeCompare(b.idPrestacion?.estadoActual.tipo);
            }
        },
        {
            key: 'informe',
            label: 'Informe',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {

                const nameA = a.idPrestacion ? 'a' : '';
                const nameB = b.idPrestacion ? 'b' : '';
                return nameA.localeCompare(nameB);
            }
        }
    ];

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private location: Location,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            if (!organizacion.usaEstadisticaV2) {
                this.router.navigate(['inicio']);
            }
        });
        this.mapaCamasService.setView('mapa-camas');
        this.mapaCamasService.setCapa('medica');
        this.mapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setFecha(new Date());

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            route: '/mapa-camas/listado-internacion-unificado',
            name: 'Mapa Cama',
        }, {
            name: 'Listado de Internacion unificado'
        }]);

        this.listaInternacion$ = this.listadoInternacionCapasService.listaInternacionFiltrada$;
    }

    seleccionarPrestacion(resumen: IResumenInternacion) {
        if (!this.idInternacionSelected || resumen.id !== this.idInternacionSelected) {
            this.mapaCamasService.select({
                id: resumen.id,
                idCama: resumen.id,
                idInternacion: resumen.id,
                paciente: resumen.paciente,
                fecha: resumen.fechaIngreso,
                estado: 'ocupada'
            } as any);
            this.idInternacionSelected = resumen.id;
        } else {
            this.idInternacionSelected = null;
        }
    }

    volver() {
        this.location.back();
    }

}
