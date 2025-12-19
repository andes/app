/* eslint-disable no-console */
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
                this.verificarInforme(informe);
                return informe;
            })
        );
    }


    validar(seleccionarInforme: IInformeEstadistica) {
        this.plex.confirm('Luego de validar la prestación ya no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (validar) {
                if (seleccionarInforme) {
                    const id = seleccionarInforme._id;
                    console.log('🔵 Enviando a validarInforme() el ID:', id);

                    const egresoExiste = seleccionarInforme.informeEgreso;
                    const ultimoEstado = seleccionarInforme.estados[seleccionarInforme.estados.length - 1].tipo;
                    console.log('🟨 Último estado:', ultimoEstado);
                    if (egresoExiste && ultimoEstado !== 'validada') {
                        if (egresoExiste.fechaEgreso && egresoExiste.tipoEgreso &&
                            egresoExiste.diagnosticos?.principal) {
                            this.informeEstadisticaService.validarInforme(id).subscribe({
                                next: prestacion => {
                                    this.mapaCamasService.selectInformeEstadistica(seleccionarInforme);
                                    this.verificarInforme(prestacion);
                                    this.listadoInternacionService.refresh.next(true);
                                },
                                error: () => this.plex.info('danger', 'ERROR: No es posible validar la informre')
                            });
                        } else {
                            this.plex.info('danger', 'ERROR: Faltan datos');
                        }
                    } else {
                        this.plex.info('danger', 'ERROR: Debe completar los datos mínimos de egreso para validar la internación');
                    }
                }
            }
        });
    }

    cancelar() {
        this.mapaCamasService.selectPrestacion(null);
        this.mapaCamasService.selectInformeEstadistica(null);
        this.mostrar = 'datosInternacion';
    }

    cambiarCama() {
        this.mostrar = 'desocuparCama';
    }

    devuelveFecha(internacion: IInformeEstadistica, tipo: 'ingreso' | 'egreso') {
        return tipo === 'ingreso' ? internacion.informeIngreso?.fechaIngreso : internacion.informeEgreso?.fechaEgreso || null;
    }

    romperValidacion(seleccionarInforme: IInformeEstadistica) {
        const id = seleccionarInforme.id || seleccionarInforme._id;
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (validar) {
                this.informeEstadisticaService.romperValidacion(id).subscribe({
                    next: informe => {
                        this.mapaCamasService.selectInformeEstadistica(informe);
                        this.verificarInforme(informe);
                        this.listadoInternacionService.refresh.next(true);
                    },
                    error: () => this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación')
                });
            }
        });
    }

    verificarInforme(informe: IInformeEstadistica) {
        this.puedeValidar = false;
        this.puedeRomper = false;
        if (informe) {
            const ultimoEstado = informe.estados?.length ? informe.estados[informe.estados.length - 1].tipo : (informe.estadoActual?.tipo || informe.estado);
            if (ultimoEstado !== 'validada') {
                const informeEgreso = informe.informeEgreso;
                if (informeEgreso?.fechaEgreso && informeEgreso?.tipoEgreso && informeEgreso?.diagnosticos?.principal) {
                    this.puedeValidar = true;
                }
            } else {
                this.puedeRomper = true;
            }
        }
    }

    seleccionarInforme(informe: IInformeEstadistica, selected: IInformeEstadistica) {

        const id = informe.id || informe._id;
        const selectedId = selected?.id || selected?._id;

        if (this.mostrar === 'datosInternacion') {

            if (selectedId === id) {
                this.mapaCamasService.selectInformeEstadistica(null);
                this.mapaCamasService.select(null);
            } else {
                const informeNormalizado = {
                    ...informe,
                    id,
                    _id: id
                };

                this.mapaCamasService.selectInformeEstadistica(informeNormalizado);
                this.mapaCamasService.setFecha(informeNormalizado.informeIngreso?.fechaIngreso);
                this.ingresoPacienteService.selectPaciente(informeNormalizado.paciente.id);
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

    accionDesocupar(accion) {
        this.mostrar = 'cambiarCama';
        this.cambiarUO = accion.cambiarUO;
    }

    onAccion($event) {
        this.editando = $event?.accion === 'editando';
    }

    buscando(valor) {
        this.estaBuscando = valor;
    }


}
