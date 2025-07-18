import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { snomedIngreso, snomedEgreso } from '../../constantes-internacion';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { ListadoInternacionService } from './listado-internacion.service';
import { IngresoPacienteService } from '../../sidebar/ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { map } from 'rxjs/operators';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-internacion-listado',
    templateUrl: './listado-internacion.component.html',
})

export class InternacionListadoComponent implements OnInit {
    listaInternacion$: Observable<IPrestacion[]>;
    selectedPrestacion$: Observable<IPrestacion>;
    fechaIngresoHasta$ = this.listadoInternacionService.fechaIngresoHasta;
    mainView$ = this.mapaCamasService.mainView;

    // VARIABLES
    public mostrar = 'datosInternacion';
    public cambiarUO = false;
    public puedeValidar = false;
    public puedeRomper = false;
    public editando = false;
    public estaBuscando = false;
    public columns = [
        { // prioriza nombre autopercibido en caso de tener
            key: 'apellido-nombre',
            label: 'Apellido y nombre',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                const aNombre = a.paciente.alias || a.paciente.nombre;
                const bNombre = b.paciente.alias || b.paciente.nombre;
                return (a.paciente.apellido + aNombre).localeCompare(b.paciente.apellido + bNombre);
            }
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                const aDocumento = a.paciente.documento || a.paciente.numeroIdentificacion;
                const bDocumento = b.paciente.documento || b.paciente.numeroIdentificacion;
                return aDocumento.localeCompare(bDocumento);
            }
        },
        {
            key: 'diagnostico',
            label: 'Motivo Ingreso',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = a.ejecucion?.registros[0]?.valor?.informeIngreso?.motivo || '';
                const nameB = b.ejecucion?.registros[0]?.valor?.informeIngreso?.motivo || '';
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'fechaIngreso',
            label: 'Fecha de ingreso',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                const fecha1 = moment(this.devuelveFecha(a, 'ingreso'));
                const fecha2 = moment(this.devuelveFecha(b, 'ingreso'));
                return fecha1.diff(fecha2);
            }
        },
        {
            key: 'fechaEgreso',
            label: 'Fecha de egreso',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                let fecha1 = this.devuelveFecha(a, 'egreso');
                let fecha2 = this.devuelveFecha(b, 'egreso');
                if (fecha1) {
                    fecha1 = moment(fecha1);
                    if (fecha2) {
                        fecha2 = moment(fecha2);
                        return fecha1.diff(fecha2);
                    } else {
                        return 1;
                    }
                }
                return -1;
            }
        },
        {
            key: 'obraSocial',
            label: 'Obra social',
            sorteable: true,
            opcional: false,
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
                return a.unidadOrganizativa.term.localeCompare(b.unidadOrganizativa.term);
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: true,
            opcional: false,
            sort: (a, b) => {
                return a.estadoActual.tipo.localeCompare(b.estadoActual.tipo);
            }
        }
    ];

    constructor(
        private plex: Plex,
        private location: Location,
        private prestacionService: PrestacionesService,
        public mapaCamasService: MapaCamasService,
        private listadoInternacionService: ListadoInternacionService,
        private ingresoPacienteService: IngresoPacienteService,
        private permisosMapaCamasService: PermisosMapaCamasService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: Auth
    ) { }

    ngOnInit() {
        // verificamos permisos
        const capa = this.route.snapshot.paramMap.get('capa');
        const permisosInternacion = this.auth.getPermissions('internacion:rol:?');
        if (permisosInternacion.length >= 1 && (permisosInternacion.indexOf(capa) !== -1 || permisosInternacion[0] === '*')) {
            this.mapaCamasService.setCapa(capa);
        } else {
            this.router.navigate(['/inicio']);
        }
        this.mapaCamasService.setAmbito('internacion');
        this.permisosMapaCamasService.setAmbito('internacion');
        this.mapaCamasService.setView('listado-internacion');
        this.mapaCamasService.select({ id: ' ' } as any); // Pequeño HACK
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Listado de Internacion'
        }]);

        this.selectedPrestacion$ = this.mapaCamasService.selectedPrestacion.pipe(
            map(prestacion => {
                this.puedeValidar = false;
                this.puedeRomper = false;
                if (prestacion?.ejecucion?.registros[1] && prestacion.ejecucion.registros[1].valor?.InformeEgreso) {
                    const informeEgreso = prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    this.puedeValidar = prestacion.estados[prestacion.estados.length - 1].tipo !== 'validada' &&
                        informeEgreso.fechaEgreso &&
                        informeEgreso.tipoEgreso &&
                        informeEgreso.diagnosticoPrincipal;
                    this.puedeRomper = (prestacion.ejecucion && prestacion.ejecucion.registros[1] && prestacion.estados[prestacion.estados.length - 1].tipo === 'validada');
                }
                return prestacion;
            })
        );
        this.listaInternacion$ = this.listadoInternacionService.listaInternacionFiltrada$;
    }

    devuelveFecha(internacion, tipo) {
        const informe = this.verRegistro(internacion, tipo);
        if (tipo === 'ingreso') {
            return informe.informeIngreso.fechaIngreso;
        } else {
            return informe ? informe.InformeEgreso.fechaEgreso : null;

        }
    }

    verRegistro(prestacion, tipoRegistro) {
        let registro = null;
        if (tipoRegistro === 'ingreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedIngreso.conceptId);
        }
        if (tipoRegistro === 'egreso') {
            registro = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === snomedEgreso.conceptId);
        }

        if (registro) {
            return registro.valor;
        }
        return null;
    }

    seleccionarPrestacion(prestacion, selectedPrestacion) {
        if (this.mostrar === 'datosInternacion') {
            if (selectedPrestacion._id === prestacion._id) {
                this.mapaCamasService.selectPrestacion(null);
                this.mapaCamasService.select(null);
            } else {
                this.mapaCamasService.selectPrestacion(prestacion);
                this.mapaCamasService.setFecha(prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso);
                this.ingresoPacienteService.selectPaciente(prestacion.paciente.id);
                this.verificarPrestacion(prestacion);
                this.mapaCamasService.isLoading(true);
            }
        }
    }

    cancelar() {
        this.mapaCamasService.selectPrestacion(null);
        this.mostrar = 'datosInternacion';
    }

    volver() {
        this.mapaCamasService.selectPrestacion(null);
        this.location.back();
    }

    cambiarCama() {
        this.mostrar = 'desocuparCama';
    }

    refresh() {
        this.listadoInternacionService.refresh.next(true);
        this.volverADetalle();
    }

    volverADetalle() {
        this.mostrar = 'datosInternacion';
    }

    accionDesocupar(accion) {
        this.mostrar = 'cambiarCama';
        this.cambiarUO = accion.cambiarUO;
    }

    verificarPrestacion(prestacion: IPrestacion) {
        this.puedeValidar = false;
        this.puedeRomper = false;
        if (prestacion.ejecucion) {
            if (prestacion.ejecucion.registros[1]) {
                if (prestacion.estados[prestacion.estados.length - 1].tipo !== 'validada') {
                    const informeEgreso = prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    if (informeEgreso) {
                        if (informeEgreso.fechaEgreso && informeEgreso.tipoEgreso && informeEgreso.diagnosticoPrincipal) {
                            this.puedeValidar = true;
                        }
                    }
                } else {
                    this.puedeRomper = true;
                }
            }
        }
    }

    onAccion($event) {
        this.editando = $event?.accion === 'editando';
    }

    validar(selectedPrestacion: IPrestacion) {
        this.plex.confirm('Luego de validar la prestación ya no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (validar) {
                if (selectedPrestacion.ejecucion.registros[1]) {
                    const egresoExiste = selectedPrestacion.ejecucion.registros[1].valor;
                    if (egresoExiste && selectedPrestacion.estados[selectedPrestacion.estados.length - 1].tipo !== 'validada') {
                        if (egresoExiste.InformeEgreso.fechaEgreso && egresoExiste.InformeEgreso.tipoEgreso &&
                            egresoExiste.InformeEgreso.diagnosticoPrincipal) {
                            this.prestacionService.validarPrestacion(selectedPrestacion).subscribe({
                                next: prestacion => {
                                    this.mapaCamasService.selectPrestacion(prestacion);
                                    this.verificarPrestacion(prestacion);
                                    this.listadoInternacionService.refresh.next(true);
                                },
                                error: () => this.plex.info('danger', 'ERROR: No es posible validar la prestación')
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

    romperValidacion(selectedPrestacion: IPrestacion,) {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (validar) {
                // hacemos el patch y luego creamos los planes
                const cambioEstado: any = {
                    op: 'romperValidacion',
                    desdeInternacion: true
                };
                // En api el estado de la prestación cambia a ejecucion
                this.prestacionService.patch(selectedPrestacion.id, cambioEstado).subscribe({
                    next: prestacion => {
                        this.mapaCamasService.selectPrestacion(prestacion);
                        this.verificarPrestacion(prestacion);
                        this.listadoInternacionService.refresh.next(true);
                    },
                    error: () => this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación')
                });
            }
        });
    }

    buscando(valor) {
        this.estaBuscando = valor;
    }
}
