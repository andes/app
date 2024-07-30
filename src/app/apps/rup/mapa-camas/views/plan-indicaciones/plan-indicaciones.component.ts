import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, tap, switchMap } from 'rxjs/operators';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { HeaderPacienteComponent } from 'src/app/components/paciente/headerPaciente.component';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { RupEjecucionService } from 'src/app/modules/rup/services/ejecucion.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { HUDSService } from 'src/app/modules/rup/services/huds.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { MaquinaEstadosHTTP } from '../../services/maquina-estados.http';
import { PlanIndicacionesEventosServices } from '../../services/plan-indicaciones-eventos.service';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { MotivosHudsService } from 'src/app/services/motivosHuds.service';

@Component({
    selector: 'in-plan-indicacion',
    templateUrl: './plan-indicaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        '../../../../../modules/rup/components/core/_rup.scss',
        './plan-indicaciones.scss'
    ]
})
export class PlanIndicacionesComponent implements OnInit {

    public indicacion;
    public paciente: any;
    public fecha = new Date();
    public hoy;
    public suspenderAnterior = false;
    public indicacionAnterior;
    public horas;
    public indicaciones = [];
    public selectedIndicacion = {};
    public loading = false;
    public suspenderIndicacion: Boolean;
    public showSecciones = {};
    public showMotivoRechazo = false; // interconsultores
    public indicacionAVerificar; // interconsultores
    public soloBorradoresSeleccionados = false;
    public borradores = [];
    public eventos = {};
    public indicacionView = null;
    public nuevaIndicacion = false;
    public seccionSelected = null;
    public indicacionEventoSelected = null;
    public horaSelected: Date;
    public tipoPrestacion = {
        'conceptId': '4981000013105',
        'term': 'plan de indicaciones médicas',
        'fsn': 'plan de indicaciones médicas (procedimiento)',
        'semanticTag': 'procedimiento'
    };
    public secciones: any[] = [];
    public seccionesActivas: any[] = [];
    public horaOrganizacion;
    public capa: string;
    private ambito: string;
    private idInternacion: string;
    private selectedBuffer = new BehaviorSubject({});
    private botones$ = this.selectedBuffer.pipe(
        map(selected => {
            const indicaciones = Object.keys(selected)
                .filter(k => selected[k])
                .map(k => this.indicaciones.find(i => i.id === k));
            return indicaciones;
        })
    );
    badgeFarmacia: String = 'Esperando control<br>de farmacia';

    get sidebarOpen() {
        return this.indicacionView || this.indicacionEventoSelected || this.nuevaIndicacion || this.suspenderIndicacion || this.showMotivoRechazo;
    }

    public detener$ = this.botones$.pipe(
        map(indicaciones => {
            const boton = indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'active' || ind.estado.tipo === 'on-hold' || ind.estado.tipo === 'pending' || ind.estado.tipo === 'bypass');
            return boton;
        })
    );

    public continuar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'on-hold' || ind.estado.tipo === 'pending'))
    );

    get puedeCrear() {
        return this.capa === 'medica';
    }

    get puedeEditar() {
        return this.capa === 'medica' && this.indicacionView?.estadoActual.tipo === 'draft';
    }

    constructor(
        public permisosMapaCamasService: PermisosMapaCamasService,
        public ejecucionService: RupEjecucionService,
        private elementoRUPService: ElementosRUPService,
        private prestacionService: PrestacionesService,
        private route: ActivatedRoute,
        private resumenInternacionService: InternacionResumenHTTP,
        private pacienteService: PacienteService,
        private plex: Plex,
        private planIndicacionesServices: PlanIndicacionesServices,
        private indicacionEventosService: PlanIndicacionesEventosServices,
        private hudsService: HUDSService,
        private auth: Auth,
        private maquinaEstadoService: MaquinaEstadosHTTP,
        private organizacionService: OrganizacionService,
        private router: Router,
        private cd: ChangeDetectorRef,
        public motivosHudsService: MotivosHudsService

    ) {
    }


    ngOnInit() {
        this.organizacionService.configuracion(this.auth.organizacion.id).pipe(
            tap(config => {
                this.horaOrganizacion = config.planIndicaciones?.horaInicio;
                this.horas = this.getHorariosGrilla();
            })
        ).subscribe();
        this.hoy = moment();
        this.capa = this.route.snapshot.paramMap.get('capa');
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.idInternacion = this.route.snapshot.paramMap.get('idInternacion');
        this.permisosMapaCamasService.setAmbito(this.ambito);
        this.loading = true;
        this.getInternacion().pipe(
            switchMap(resumen => {
                return this.pacienteService.getById(resumen.paciente.id).pipe(
                    map(paciente => {
                        this.paciente = paciente;
                        this.plex.setNavbarItem(HeaderPacienteComponent, { paciente });
                    })
                );
            })
        ).subscribe(() => this.actualizar());


        this.maquinaEstadoService.getAll(
            this.auth.organizacion.id,
            this.ambito
        ).subscribe((maquinas: any[]) => {
            const capa = maquinas.find(m => m.capa === this.capa);
            if (capa) {
                this.tipoPrestacion = capa.planIndicaciones?.tipoPrestacion || this.tipoPrestacion;
            }
            maquinas.forEach(m => {
                if (m.planIndicaciones?.secciones) {
                    this.secciones.push(
                        ...m.planIndicaciones?.secciones.map(s => ({
                            ...s,
                            capa: m.capa
                        }))
                    );
                }
            });
        });
    }

    getItems(seccion) {
        return this.indicaciones.filter(i => i.seccion.conceptId === seccion.concepto.conceptId);
    }

    noHayIndicaciones() {
        return !this.seccionesActivas.some(seccion => this.getItems(seccion).length > 0);
    }

    actualizar() {
        this.loading = true;
        forkJoin([
            this.planIndicacionesServices.getIndicaciones(this.idInternacion, this.fecha, this.capa),
            this.indicacionEventosService.search({
                internacion: this.idInternacion,
                fecha: this.indicacionEventosService.queryDateParams(
                    moment(this.fecha).startOf('day').add(this.horaOrganizacion, 'h').toDate(),
                    moment(this.fecha).startOf('day').add(this.horaOrganizacion + 24, 'h').toDate(),
                    false
                )
            })
        ]).subscribe({
            next: ([datos, eventos]) => {
                this.indicaciones = datos;
                if (this.capa === 'enfermeria' || this.capa === 'interconsultores') {
                    this.indicaciones = datos.filter(i => (i.estado.tipo === 'active' || i.estado.tipo === 'draft' || i.estado.tipo === 'cancelled' || i.estado.tipo === 'bypass') && this.isToday(i.estado.fecha));
                } else {
                    this.indicaciones = datos.filter(i => {
                        // se descartan borradores de dias anteriores
                        return i.estado.tipo !== 'draft' || moment(i.estado.fecha).isSame(moment(this.fecha), 'day');
                    });
                }
                this.seccionesActivas = this.secciones.filter(s => s.capa === this.capa);
                this.indicaciones.forEach((indicacion) => {
                    const seccion = this.seccionesActivas.find(s => s.concepto.conceptId === indicacion.seccion.conceptId);
                    if (!seccion) {
                        this.seccionesActivas.push(
                            this.secciones.find(s => s.concepto.conceptId === indicacion.seccion.conceptId)
                        );
                    }
                    this.showSecciones[indicacion.seccion.term] = true;
                    this.resetSelection();
                });

                const eventosMap = {};
                // filtramos eventos por fecha y hora segun tablero
                const comienzoTablero = moment(this.fecha).hours(this.horaOrganizacion);
                const finTablero = moment(this.fecha).add(1, 'days').hours(this.horaOrganizacion - 1);
                eventos = eventos.filter(ev => moment(ev.fecha).isBetween(comienzoTablero, finTablero, 'hour', '[]'));
                eventos.forEach(evento => {
                    eventosMap[evento.idIndicacion] = eventosMap[evento.idIndicacion] || {};
                    const hora = moment(evento.fecha).hour();
                    eventosMap[evento.idIndicacion][hora] = evento;
                });

                this.eventos = eventosMap;
                this.borradores = this.indicaciones.filter(i => i.estado.tipo === 'draft');
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    getInternacion(): Observable<any> {
        if (this.capa === 'estadistica') {
            return this.prestacionService.getById(this.idInternacion).pipe(
                map(prestacion => {
                    return {
                        paciente: prestacion.paciente,
                        fechaIngreso: prestacion.ejecucion.registros[0]?.valor.informeIngreso.fechaIngreso,
                        fechaEgreso: prestacion.ejecucion.registros[1]?.valor.InformeEgreso.fechaEgreso,
                    };
                })
            );
        } else {
            return this.resumenInternacionService.get(this.idInternacion);
        }
    }

    onSelectedChange() {
        this.suspenderIndicacion = false;
        this.selectedBuffer.next(this.selectedIndicacion);
        const arraySeleccion = Object.keys(this.selectedIndicacion).filter(k => this.selectedIndicacion[k] === true);
        this.soloBorradoresSeleccionados = arraySeleccion.length > 0 && arraySeleccion?.every(seleccionado => this.borradores.some(b => b.id === seleccionado));
    }

    onClose() {
        this.indicacionView = null;
        this.indicacionEventoSelected = null;
    }

    isToday(fecha: Date = this.fecha) {
        if (fecha) {
            return moment(fecha).isSame(moment(), 'day');
        }
    }

    onDateChange(event) {
        if (event.value) {
            this.actualizar();
            this.resetSelection();
        }
    }

    resetSelection() {
        this.selectedIndicacion = {};
        this.onSelectedChange();
    }

    cambiarEstado(estado: string, continuarIndicacion?: boolean, observaciones?: string) {
        const indicaciones = Object.keys(this.selectedIndicacion).filter(k => this.selectedIndicacion[k]).map(k => this.indicaciones.find(i => i.id === k));
        const estadoParams: any = {
            tipo: estado,
            fecha: new Date(),
            observaciones,
            continuarIndicacion
        };

        const datos = indicaciones.map(ind => this.planIndicacionesServices.updateEstado(ind.id, estadoParams));
        forkJoin(
            datos
        ).subscribe(() => {
            this.actualizar();
            this.plex.toast('success', 'Indicaciones actualizadas');
        });
    }

    cancelIndicacion(event) {
        this.selectedIndicacion = { [event.id]: event };
        this.selectedBuffer.next(this.selectedIndicacion);
        this.onDetenerClick();
    }

    onDetenerClick() {
        this.indicacionView = false;
        this.suspenderIndicacion = true;
    }

    onContinuarClick() {
        this.cambiarEstado('active', true);
    }

    onSelectIndicacion(indicacion) {
        if (!this.nuevaIndicacion) {
            this.showMotivoRechazo = false;
            this.indicacionEventoSelected = null;
            if (!this.indicacionView || this.indicacionView.id !== indicacion.id) {
                this.indicacionView = indicacion;
            } else {
                this.indicacionView = null;
            }
        }
    }

    onIndicacionesCellClick(indicacion, hora) {
        const fechaHora = moment(this.fecha).startOf('day').add(hora < this.horaOrganizacion ? hora + 24 : hora, 'h');
        if (this.permisosMapaCamasService.indicacionesEjecutar && indicacion.estado.tipo !== 'draft' && indicacion.estadoActual.verificacion?.estado !== 'rechazada' && (indicacion.estado.verificacion?.estado === 'aceptada' || indicacion.estado.tipo === 'bypass') && fechaHora.isSame(moment(), 'day')) {
            this.onIndicaciones(indicacion, hora);
        }
    }

    private onIndicaciones(indicacion, hora) {
        if (this.capa === 'enfermeria' || (this.eventos[indicacion?.id] && this.eventos[indicacion?.id][hora]?.estado === 'realizado')) {
            this.indicacionEventoSelected = indicacion;
            this.horaSelected = hora;
            this.indicacionView = null;
            this.cd.detectChanges();
        }
    }

    onEventos(debeActualizar: boolean) {
        this.indicacionEventoSelected = null;
        this.cd.detectChanges();
        this.horaSelected = null;
        if (debeActualizar) {
            this.actualizar();
        }
    }

    onNuevaIndicacion(seccion) {
        this.indicacionEventoSelected = null;
        this.indicacionView = null;
        this.seccionSelected = seccion;
        this.indicacion = null;
        if (!seccion) {
            this.seccionSelected = this.secciones.find(s => s.concepto.conceptId === '6381000013101');
        }
        this.nuevaIndicacion = true;
    }

    onSaveIndicacion(indicacion) {
        if (this.suspenderAnterior && indicacion) {
            const estadoParams = {
                tipo: 'cancelled',
                fecha: new Date()
            };
            this.planIndicacionesServices.updateEstado(this.indicacionAnterior.id, estadoParams).subscribe(() =>
                this.actualizar());
            this.nuevaIndicacion = false;
        }
        if (!indicacion) {
            this.nuevaIndicacion = false;
        } else {
            indicacion.paciente = this.paciente;
            this.planIndicacionesServices.create(indicacion).subscribe(() => {
                this.actualizar();
                this.nuevaIndicacion = false;
                this.plex.toast('success', 'Indicación creada con éxito');
            }, () => {
                this.plex.toast('danger', 'Ha ocurrido un error al crear la indicación');
            });
        }
    }

    guardarSuspension(event) {
        this.suspenderIndicacion = false;
        this.cambiarEstado('cancelled', false, event);
    }

    cancelarSuspension() {
        this.suspenderIndicacion = false;
    }

    cancelarRechazo() {
        this.showMotivoRechazo = false;
    }

    crearPrestacion(paciente, concepto, fecha: Date) {
        const nuevaPrestacion = this.prestacionService.inicializarPrestacion(
            paciente, concepto, 'ejecucion', this.ambito, fecha
        );
        nuevaPrestacion.trackId = this.idInternacion;
        return this.prestacionService.post(nuevaPrestacion);
    }

    generarToken(paciente, concepto, prestacion) {
        const token = this.motivosHudsService.getMotivo('int').pipe(
            switchMap(motivoH => {
                const paramsToken = {
                    usuario: this.auth.usuario,
                    organizacion: this.auth.organizacion,
                    paciente: paciente,
                    motivo: motivoH[0].key,
                    profesional: this.auth.profesional,
                    idTurno: null,
                    idPrestacion: prestacion.id
                };
                return this.hudsService.generateHudsToken(paramsToken);
            }));

        return token.pipe(
            tap(hudsToken => window.sessionStorage.setItem('huds-token', hudsToken.token))
        );
    }

    toggleSeccion(seccion) {
        this.showSecciones[seccion.term] = !this.showSecciones[seccion.term];
    }

    onValidar(seleccionadas: boolean) {
        const indicaciones = seleccionadas ? Object.keys(this.selectedIndicacion).filter(k => this.selectedIndicacion[k]).map(k => this.indicaciones.find(i => i.id === k)) : this.indicaciones;
        const registros = indicaciones.filter(indicacion => indicacion.estado?.tipo === 'draft').map((indicacion) => {
            return {
                _id: indicacion.idRegistro,
                id: indicacion.idRegistro,
                nombre: indicacion.nombre,
                concepto: indicacion.concepto,
                elementoRUP: indicacion.elementoRUP,
                esSolicitud: true,
                valor: indicacion.valor
            };
        });

        const prestacion = this.prestacionService.inicializarPrestacion(
            this.paciente,
            this.tipoPrestacion,
            'ejecucion',
            this.ambito,
            new Date(),
            null,
            null,
            registros
        );
        prestacion.trackId = this.idInternacion;
        prestacion.inicio = 'plan-indicaciones';
        this.prestacionService.post(prestacion).pipe(
            switchMap(prestacion => this.prestacionService.validarPrestacion(prestacion))
        ).subscribe(() => {
            this.actualizar();
            setTimeout(() => { this.onDateChange({ value: this.fecha }); }, 500); // hackcito para actualizar la grilla
            this.plex.toast('success', 'Indicaciones validadas correctamente.');
        });
    }

    editar(indicacion) {
        if (indicacion.estado?.tipo === 'draft') {
            this.indicacion = indicacion;
            this.indicacionEventoSelected = null;
            this.indicacionView = null;
            this.nuevaIndicacion = true;
            this.seccionSelected = this.seccionesActivas.find(seccion => seccion.concepto.conceptId === indicacion?.seccion?.conceptId);
        }
        if (indicacion.estado?.tipo === 'active' || indicacion.estado?.tipo === 'pending') {
            this.indicacion = indicacion;
            this.indicacionAnterior = indicacion;
            this.suspenderAnterior = true;
            this.indicacionEventoSelected = null;
            this.indicacionView = null;
            this.nuevaIndicacion = true;
            this.seccionSelected = this.seccionesActivas.find(seccion => seccion.concepto.conceptId === indicacion.seccion.conceptId);

        }

    }

    eliminar(indicacion) {
        const deletedBy = this.auth.usuario;
        deletedBy['organizacion'] = this.auth.organizacion;
        const data = {
            deletedBy,
            deletedAt: moment().toDate(),
            indicacion
        };
        this.planIndicacionesServices.update(indicacion._id, data).subscribe(() => {
            this.actualizar();
            this.plex.toast('success', 'Indicación eliminada con éxito');
        }, () => {
            this.plex.toast('danger', 'Ha ocurrido un error al eliminar la indicación');
        });
        this.indicacionView = null;
        this.nuevaIndicacion = false;
    }

    onEditIndicacion(indicacion) {
        if (indicacion) {
            this.planIndicacionesServices.update(indicacion._id, indicacion).subscribe(s => {
                this.actualizar();
                this.nuevaIndicacion = false;
                this.plex.toast('success', 'Indicación editada con éxito');
            }, () => {
                this.plex.toast('danger', 'Ha ocurrido un error al editar la indicación');
            });
        }
    }

    goTo() {
        this.router.navigate(['/mapa-camas/internacion/' + this.capa]);
    }

    getHorariosGrilla() {
        const res = [];
        const horaIncio = this.horaOrganizacion;
        res.push(horaIncio);
        let horas = horaIncio + 1;
        while (horas !== horaIncio) {
            res.push(horas);
            horas++;
            if (horas === 24) {
                horas = 0;
            }
        }
        return res;
    }

    // capa interconsultores ------------------------------------

    onVerificar(indicacion, flag: boolean) {
        this.indicacionAVerificar = indicacion;
        if (flag) {
            this.saveVerificacion();
        } else {
            this.indicacionView = false;
            this.toggleShowMotivoRechazo(null, true);
        }
    }

    deshacerVerificacion(indicacion) {
        indicacion.estado.verificacion = null;
    }

    toggleShowMotivoRechazo(indicacion = null, show = false) {
        if (indicacion) {
            this.onSelectIndicacion(indicacion);
            this.indicacionAVerificar = indicacion;
            this.showMotivoRechazo = true;
        } else {
            this.showMotivoRechazo = show ? show : !this.showMotivoRechazo;
        }
        this.onClose();
    }

    saveVerificacion(motivo?) {
        const estadoVerificado = this.indicacionAVerificar.estado;
        estadoVerificado.verificacion = {
            estado: motivo ? 'rechazada' : 'aceptada',
            capa: this.capa,
            key: motivo ? motivo.key : null,
            motivoRechazo: motivo ? motivo.nombre : null
        };

        this.planIndicacionesServices.updateEstado(this.indicacionAVerificar.id, estadoVerificado).subscribe(() => {
            this.actualizar();
            this.plex.toast('success', 'Verificación guardada exitosamente');
            this.onClose();
        });
        this.cerrarSidebar();
    }

    puedeValidar() {
        return this.capa === 'medica' && this.permisosMapaCamasService.indicacionesValidar && this.borradores.length;
    }

    puedeAceptarRechazar(indicacion = null) {
        return (indicacion) ? (this.capa === 'farmaceutica') && indicacion.estado.tipo !== 'draft' && indicacion.estado.tipo !== 'cancelled' && this.permisosMapaCamasService.indicacionesAceptarRechazar :
            (this.capa === 'farmaceutica') && this.permisosMapaCamasService.indicacionesAceptarRechazar;
    }

    puedeCrearIndicacion() {
        return this.isToday && this.permisosMapaCamasService.indicacionesCrear && this.capa === 'medica';
    }

    puedeEjecutar() {
        return this.permisosMapaCamasService.indicacionesEjecutar && this.capa !== 'interconsultores';
    }

    aceptado(indicacion) {
        return indicacion.estadoActual.tipo !== 'cancelled' && indicacion.estadoActual.verificacion?.estado === 'aceptada' && indicacion.estado?.tipo !== 'pending' && indicacion.concepto.conceptId !== '430147008';
    }

    pendiente(indicacion) {
        return !indicacion.estadoActual.verificacion && indicacion.estadoActual.tipo !== 'cancelled' && this.capa === 'enfermeria' && indicacion.estadoActual.tipo === 'bypass';
    }

    validada(indicacion) {
        return this.capa === 'enfermeria' && !indicacion.estadoActual.verificacion && indicacion.estadoActual.tipo === 'active';
    }

    mostrarBotonera(indicacion) {
        return this.isToday() && this.permisosMapaCamasService.indicacionesEjecutar && this.permisosMapaCamasService.indicacionesEjecutar && !this.indicacionEventoSelected && !this.nuevaIndicacion && !indicacion.readonly;
    }

    editarIndicacion() {
        return this.puedeEditar && this.indicacionView.estado.tipo !== 'cancelled' && this.indicacionView.estado.tipo !== 'active';
    }

    puedeContinuarSuspender() {
        return this.isToday() && this.permisosMapaCamasService.indicacionesEjecutar && !this.indicacionEventoSelected && !this.nuevaIndicacion && !this.indicacion?.readonly;
    }

    cerrarSidebar() {
        this.nuevaIndicacion = false;
        this.indicacionView = null;
        this.indicacionEventoSelected = null;
        this.suspenderIndicacion = false;
    }

}
