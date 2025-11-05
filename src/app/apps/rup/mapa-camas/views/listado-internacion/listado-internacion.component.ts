import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';

import { MapaCamasService } from '../../services/mapa-camas.service';
import { ListadoInternacionService } from './listado-internacion.service';
import { IngresoPacienteService } from '../../sidebar/ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { InformeEstadisticaService } from 'src/app/modules/rup/services/informe-estadistica.service';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';

@Component({
    selector: 'app-internacion-listado',
    templateUrl: './listado-internacion.component.html',
})
export class InternacionListadoComponent implements OnInit {
    listaInternacion$: Observable<IInformeEstadistica[]>;
    selectedInforme$: Observable<IInformeEstadistica>;



    fechaIngresoHasta$ = this.listadoInternacionService.fechaIngresoHasta;
    mainView$ = this.mapaCamasService.mainView;

    public mostrar = 'datosInternacion';
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;
    public editando = false;
    public estaBuscando = false;

    public columns = [
        {
            key: 'apellido-nombre',
            label: 'Apellido y nombre',
            sorteable: true,
            opcional: false,
            sort: (a, b) => (a.paciente.apellido + a.paciente.nombre).localeCompare(b.paciente.apellido + b.paciente.nombre)
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: false,
            sort: (a, b) => (a.paciente.documento || '').localeCompare(b.paciente.documento || '')
        },
        {
            key: 'diagnostico',
            label: 'Motivo ingreso',
            sorteable: true,
            opcional: true,
            sort: (a, b) => (a.informeIngreso?.motivo || '').localeCompare(b.informeIngreso?.motivo || '')
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha de ingreso',
            sorteable: true,
            opcional: false,
            sort: (a, b) => moment(a.informeIngreso?.fechaIngreso).diff(moment(b.informeIngreso?.fechaIngreso))
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha de egreso',
            sorteable: true,
            opcional: false,
            sort: (a, b) => moment(a.informeEgreso?.fechaEgreso).diff(moment(b.informeEgreso?.fechaEgreso))
        },
        {
            key: 'obraSocial',
            label: 'Obra social',
            sorteable: true,
            opcional: false,
            sort: (a, b) => (a.obraSocial?.nombre || '').localeCompare(b.obraSocial?.nombre || '')
        },
        {
            key: 'unidadOrganizativa',
            label: 'Unidad organizativa',
            sorteable: true,
            opcional: false,
            sort: (a, b) => (a.unidadOrganizativa?.term || '').localeCompare(b.unidadOrganizativa?.term || '')
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: true,
            opcional: false,
            sort: (a, b) => (a.estadoActual?.tipo || '').localeCompare(b.estadoActual?.tipo || '')
        }
    ];

    constructor(
        private plex: Plex,
        private location: Location,
        private informeEstadisticaService: InformeEstadisticaService,
        private mapaCamasService: MapaCamasService,
        private listadoInternacionService: ListadoInternacionService,
        private ingresoPacienteService: IngresoPacienteService,
        private permisosMapaCamasService: PermisosMapaCamasService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {

        const capa = this.route.snapshot.paramMap.get('capa');
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?');

        if (permisosInternacion.length >= 1 && (permisosInternacion.includes(capa) || permisosInternacion[0] === '*')) {
            this.mapaCamasService.setCapa(capa);
        } else {
            this.router.navigate(['/inicio']);
        }

        this.mapaCamasService.setAmbito('internacion');
        this.permisosMapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setView('listado-internacion');
        this.mapaCamasService.select({ id: ' ' } as any);

        this.plex.updateTitle([
            { route: '/inicio', name: 'Andes' },
            { name: 'Internación' },
            { name: 'Listado de Internación' }
        ]);

        this.listaInternacion$ = this.listadoInternacionService.listaInternacionFiltrada$.pipe(
            map((res: any) => {
                // Si res es un objeto, intentamos extraer el array
                if (Array.isArray(res)) {
                    return res;
                } else if (Array.isArray(res?.data)) {
                    return res.data;
                } else if (Array.isArray(res?.listaInternacion)) {
                    return res.listaInternacion;
                } else {
                    console.warn('⚠️ listaInternacionFiltrada$ no devolvió un array. Valor recibido:', res);
                    return [];
                }
            })
        );

        this.selectedInforme$ = this.mapaCamasService.selectedInformeEstadistica.pipe(
            map((prestacion: any) => {
                const informe = prestacion as IInformeEstadistica;

                if (informe) {
                    this.puedeValidar = !!(
                        informe.informeEgreso?.fechaEgreso &&
                        informe.informeEgreso?.tipoEgreso &&
                        informe.informeEgreso?.diagnosticos?.principal
                    );
                    this.puedeRomper = informe.estadoActual?.tipo === 'validada';
                }
                return informe;
            })
        );
    }

    devuelveFecha(internacion: IInformeEstadistica, tipo: 'ingreso' | 'egreso') {
        return tipo === 'ingreso' ? internacion.informeIngreso?.fechaIngreso : internacion.informeEgreso?.fechaEgreso || null;
    }

    seleccionarInforme(informe: IInformeEstadistica, selected: IInformeEstadistica) {
        if (this.mostrar === 'datosInternacion') {
            if (selected?.id === informe.id) {
                this.mapaCamasService.selectInformeEstadistica(null);
                this.mapaCamasService.select(null);
            } else {
                this.mapaCamasService.selectInformeEstadistica(informe);
                this.mapaCamasService.setFecha(informe.informeIngreso?.fechaIngreso);
                this.ingresoPacienteService.selectPaciente(informe.paciente.id);
                this.mapaCamasService.isLoading(true);
            }
        }
    }

    seleccionarPrestacion(informe: IInformeEstadistica, selected: IInformeEstadistica) {
        if (this.mostrar === 'datosInternacion') {
            if (selected?.id === informe.id) {
                this.mapaCamasService.selectInformeEstadistica(null);
                this.mapaCamasService.select(null);
            } else {
                this.mapaCamasService.selectInformeEstadistica(informe);
                this.mapaCamasService.setFecha(informe.informeIngreso?.fechaIngreso);
                this.ingresoPacienteService.selectPaciente(informe.paciente.id);
                this.mapaCamasService.isLoading(true);
            }
        }
    }

    refresh() {
        this.listadoInternacionService.refresh.next(true);
        this.volverADetalle();
    }

    volverADetalle() {
        this.mostrar = 'datosInternacion';
    }

    volver() {
        this.mapaCamasService.selectInformeEstadistica(null);
        this.location.back();
    }

    buscando(valor: any) {
        this.estaBuscando = true;

        if (typeof valor !== 'object') {
            console.warn('⚠️ Valor no válido para el filtrado:', valor);
            this.estaBuscando = false;
            return;
        }
        this.listadoInternacionService.listaInternacion$.subscribe({
            next: (data) => {
                const filtrados = this.listadoInternacionService.filtrarInformesEstadistica(data, valor);
                this.estaBuscando = false;
            },
            error: (err) => {
                this.estaBuscando = false;
            }
        });
    }

}
