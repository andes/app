
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { ProcedimientosQuirurgicosService } from '../../../../../services/procedimientosQuirurgicos.service';
import { Cie10Service } from '../../../../mitos';
import { listaTipoEgreso, causaExterna, opcionesTipoParto, opcionesCondicionAlNacer, opcionesTerminacion, opcionesSexo } from '../../constantes-internacion';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { ListadoInternacionService } from '../../views/listado-internacion/listado-internacion.service';
import { ListadoInternacionCapasService } from '../../views/listado-internacion-capas/listado-internacion-capas.service';
import { NgForm } from '@angular/forms';
import { InformeEstadisticaService } from 'src/app/modules/rup/services/informe-estadistica.service';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';
import { debug } from 'console';
import { debugOutputAstAsTypeScript } from '@angular/compiler';
@Component({
    selector: 'app-egresar-paciente',
    templateUrl: './egresar-paciente.component.html',
})

export class EgresarPacienteComponent implements OnInit, OnDestroy {
    // EVENTOS
    @Output() onSave = new EventEmitter<any>();
    @ViewChild('formEgreso', { static: true }) formEgreso: NgForm;
    // CONSTANTES
    public listaTipoEgreso = listaTipoEgreso;
    public causaExterna = causaExterna;
    public opcionesTipoParto = opcionesTipoParto;
    public opcionesCondicionAlNacer = opcionesCondicionAlNacer;
    public opcionesTerminacion = opcionesTerminacion;
    public opcionesSexo = opcionesSexo;
    public fechaEgresoOriginal: Date;

    // VARIABLES
    public fecha: Date;
    public fechaMax: Date;
    public fechaMin: Date;
    public fechaMaxProcedimiento: Date;
    public view: string;
    public capa: string;
    public cama: ISnapshot;
    public prestacion: IPrestacion;
    public informe: IInformeEstadistica;
    public maquinaEstados: IMaquinaEstados;
    public estadoDestino;
    public checkTraslado = false;
    private informeIngreso;
    public registrosEgresoResumen$: Observable<any>;
    public registro: any = {
        destacado: false,
        esSolicitud: false,
        esDiagnosticoPrincipal: false,
        esPrimeraVez: undefined,
        relacionadoCon: [],
        nombre: 'alta del paciente',
        concepto: {
            fsn: 'alta del paciente (procedimiento)',
            semanticTag: 'procedimiento',
            conceptId: '58000006',
            term: 'alta del paciente'
        },
        valor: {
            InformeEgreso: {
                fechaEgreso: null,
                diasDeEstada: null,
                nacimientos: [
                    {
                        pesoAlNacer: null,
                        condicionAlNacer: null,
                        terminacion: null,
                        sexo: null
                    }
                ],
                procedimientosQuirurgicos: [],
                causaExterna: {
                    producidaPor: null,
                    lugar: null,
                    comoSeProdujo: null
                },
                tipoEgreso: null,
                diagnosticos: {
                    principal: null,
                    secundarios: [],
                    otrasCircunstancias: null,
                    diasEstadaOtrasCircunstancias: null,
                    diasDePermisoDeSalida: null
                }
            }
        }
    };


    public procedimientosObstetricos = false;
    public procedimientosObstetricosNoReq = false;
    public existeCausaExterna = false;
    public listaProcedimientosQuirurgicos: any[];
    public prestacionValidada = false;

    public disableSave = true;
    public checkDisableSave$: Observable<boolean>;
    private refreshSaveButton = new BehaviorSubject<any>(null);

    public inProgress = true;
    public resumen;
    private subscription: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;
    private subscription4: Subscription;

    constructor(
        public auth: Auth,
        public plex: Plex,
        public cie10Service: Cie10Service,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private informeEstadisticaService: InformeEstadisticaService,
        public mapaCamasService: MapaCamasService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        private listadoInternacionService: ListadoInternacionService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private internacionResumenService: InternacionResumenHTTP,
        private camasHTTP: MapaCamasHTTP,
    ) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
        if (this.subscription3) {
            this.subscription3.unsubscribe();
        }
        if (this.subscription4) {
            this.subscription4.unsubscribe();
        }
    }

    ngOnInit() {
        this.fecha = this.mapaCamasService.fecha;
        this.formEgreso.valueChanges.subscribe(() => {
            this.inProgress = true;
            this.refreshSaveButton.next({});
        });

        this.checkDisableSave$ = combineLatest([
            this.mapaCamasService.snapshot$,
            this.refreshSaveButton
        ]).pipe(
            map(([camas, disparador]) => {
                this.inProgress = false;
                if (this.cama?.sala) {
                    return false;
                } else if (!this.cama || this.formEgreso.invalid || (this.capa === 'estadistica' && this.prestacionValidada)) {
                    return true;
                }
                const camaActual = camas.find(c => c.id === (this.cama as any)?._id);
                // else: this.cama tiene valor, el form de egreso es valido y de ser capa estadistica la prestacion no esta validada
                const condicion = camaActual?.estado === 'disponible'
                    || (camaActual?.estado === 'ocupada' && camaActual?.idInternacion === this.cama?.idInternacion)
                    || this.informe
                    || this.prestacion;

                return !condicion;
            })
        );


        this.registrosEgresoResumen$ = combineLatest([
            this.mapaCamasService.capa2,
            this.mapaCamasService.informeEstadistica$,
            this.mapaCamasService.prestacion$
        ]).pipe(
            first(),
            switchMap(([capa, informe, prestacion]) => {
                if (capa === 'estadistica' || (capa === 'estadistica-v2' && this.view === 'mapa-camas')) {
                    const fechaIngreso = informe?.informeIngreso?.fechaIngreso || this.resumen?.fechaIngreso;
                    const paciente = informe?.paciente?.id || this.resumen?.paciente.id;
                    const desde = moment(fechaIngreso).subtract(12, 'hours').toDate();
                    const hasta = moment(fechaIngreso).add(12, 'hours').toDate();
                    return combineLatest([
                        this.camasHTTP.historialInternacion(
                            'internacion',
                            capa,
                            this.informeIngreso.fechaIngreso,
                            moment().toDate(),
                            informe.id
                            // prestacion.id
                        ),
                        this.internacionResumenService.search({
                            organizacion: this.auth.organizacion.id,
                            paciente: paciente,
                            ingreso: this.internacionResumenService.queryDateParams(desde, hasta)
                        })
                    ]).pipe(
                        map(([historialInternacion, resumenArray]) => {
                            const fechaUltimoMovimiento = moment(historialInternacion[historialInternacion.length - 1].fecha);
                            this.fechaMin = moment(fechaUltimoMovimiento.add(1, 'm'), 'DD-MM-YYYY HH:mm').toDate();
                            return resumenArray[0];
                        })
                    );
                }
                if (capa === 'estadistica-v2' && this.view === 'listado-internacion') {
                    return this.mapaCamasService.resumenInternacion$;
                }
                return of(null);
            }),
            map(resumen => resumen?.registros?.filter(r => r.tipo === 'epicrisis')),
            cache()
        );

        this.subscription = combineLatest([
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.ambito2,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.informeEstadistica$,
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.resumenInternacion$
        ]).subscribe(([view, capa, ambito, cama, informe, prestacion, resumen]) => {
            this.inProgress = false;
            this.resumen = resumen;


            let fecha = moment(resumen?.fechaEgreso || this.mapaCamasService.fecha).toDate();
            if (view === 'listado-internacion' && (informe || prestacion)) {
                fecha = moment(resumen?.fechaEgreso).toDate() || moment().toDate();
                const objetoConEstados = informe || prestacion;

                const estados = objetoConEstados?.estados;
                if (estados && estados.length > 0) {
                    this.prestacionValidada = estados[estados.length - 1].tipo === 'validada';
                } else {
                    this.prestacionValidada = false;
                }

            }
            this.registro.valor.InformeEgreso.fechaEgreso = moment(fecha).toDate();
            this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
            this.fechaEgresoOriginal = null;



            this.view = view;
            this.capa = capa;


            if (capa === 'estadistica' || capa === 'estadistica-v2') {
                if (!informe) {
                    return;
                }
                this.informe = informe;
                this.informeIngreso = this.informe?.informeIngreso;
                if (this.hayEgreso) {
                    this.registro.valor.InformeEgreso = Object.assign({}, this.informe.informeEgreso);
                    fecha = moment(this.registro.valor.InformeEgreso.fechaEgreso).toDate();
                    this.fechaEgresoOriginal = moment(this.registro.valor.InformeEgreso.fechaEgreso).toDate();

                    const informeEgreso = this.registro.valor.InformeEgreso;
                    this.checkTraslado = informeEgreso.tipoEgreso.id === 'Traslado' && !informeEgreso.UnidadOrganizativaDestino?.id;
                    this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
                }

                if (this.view === 'listado-internacion') {
                    if (this.subscription2) {
                        this.subscription2.unsubscribe();
                    }

                    const fechaABuscarMin = moment(this.informeIngreso.fechaIngreso).add(-1, 's').toDate();
                    const fechaABuscarMax = this.hayEgreso ? moment(this.registro.valor.InformeEgreso.fechaEgreso).add(-10, 's').toDate() : moment().toDate(); // para excluir el egreso
                    const idInternacion = resumen?.id || informe?.id || prestacion.id;
                    this.subscription2 = this.camasHTTP.historialInternacion(ambito, capa, fechaABuscarMin, fechaABuscarMax, idInternacion)
                        .subscribe(movimientos => {
                            movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                            this.cama = movimientos[0];
                            if (this.cama) {
                                this.cama.id = this.cama.idCama;
                                this.refreshSaveButton.next({});
                                this.fechaMin = moment(this.cama.fecha, 'DD-MM-YYYY HH:mm').add(1, 'minute').toDate();
                                this.checkHistorial(fecha);
                                if (this.subscription3) {
                                    this.subscription3.unsubscribe();
                                }
                                this.setEstadoDestino();
                            }
                        });

                } else {
                    this.cama = cama;
                    this.setEstadoDestino();
                }
            } else if (this.resumen?.id) {
                const esCapaAsistencial = this.capa === 'medica' || this.capa === 'enfermeria';

                if (this.resumen.fechaEgreso && (esCapaAsistencial || this.view === 'listado-internacion')) {
                    this.fechaEgresoOriginal = moment(this.resumen.fechaEgreso).toDate();
                    this.registro.valor.InformeEgreso.tipoEgreso = this.listaTipoEgreso.find(tipo => tipo.nombre === this.resumen.tipo_egreso);
                }

                const fechaABuscarMax = resumen.fechaEgreso ? moment(resumen.fechaEgreso).add(-10, 's').toDate() : moment().toDate(); // para excluir el egreso
                this.subscription2 = this.camasHTTP.historialInternacion(ambito, capa, resumen.fechaIngreso, fechaABuscarMax, resumen.id)
                    .subscribe(movimientos => {
                        movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                        const ultimoMovimiento = movimientos[0];
                        this.cama = ultimoMovimiento;
                        this.refreshSaveButton.next({});
                        this.fechaMin = moment(ultimoMovimiento.fecha).add(1, 'm').toDate();
                        this.checkHistorial(fecha);

                        this.setEstadoDestino();
                    });

            } else if (cama?.sala) {
                this.cama = cama;
            }

            this.fecha = moment(fecha).toDate();
            this.setDiasEstada();
        });

    }

    private setEstadoDestino() {
        if (!this.cama) {
            return;
        }
        if (this.subscription3) {
            this.subscription3.unsubscribe();
        }
        this.subscription3 = this.mapaCamasService.getRelacionesPosibles(this.cama).pipe(first()).subscribe((relacionesPosibles) => {
            this.estadoDestino = relacionesPosibles.find(r => r.destino.nombre === 'Disponible' || r.destino.nombre === 'Limpieza' || r.destino.nombre === 'Mantenimiento')?.destino || relacionesPosibles[0]?.destino;
        });
    }

    onType() {
        this.inProgress = true;
    }
    get hayEgreso(): boolean {
        return !!(this.informe && this.informe.informeEgreso);
    }

    setFecha() {
        if (!this.fecha) {
            return;
        }
        const nuevaFecha = moment(this.fecha).toDate();
        this.mapaCamasService.setFecha(nuevaFecha);
        this.registro.valor.InformeEgreso.fechaEgreso = nuevaFecha;
        if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
            if (this.capa === 'estadistica-v2' && !this.informeIngreso?.fechaIngreso) {
                this.plex.info('warning', 'Antes de egresar al paciente debe cargar el informe de ingreso.');
                return;
            }
            this.setDiasEstada();
            this.checkEstadoCama();
            this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
        }
    }
    guardar(valid) {
        if (valid.formValid) {
            this.inProgress = true;
            const afterSave = {
                next: (result) => {
                    if (result) {
                        this.plex.info('success', 'Los datos se actualizaron correctamente');
                        if (this.view === 'listado-internacion') {
                            const fechaHasta = moment(this.registro.valor.InformeEgreso.fechaEgreso).add(1, 'm').toDate();
                            this.listadoInternacionService.setFechaHasta(fechaHasta);
                            this.listadoInternacionCapasService.setFechaHasta(fechaHasta);
                            this.mapaCamasService.selectResumen(null);
                            this.mapaCamasService.selectInformeEstadistica(null);
                            this.mapaCamasService.selectPrestacion(null);
                            this.mapaCamasService.selectResumen(null);


                        } else if (this.view === 'mapa-camas') {
                            this.mapaCamasService.setFecha(this.registro.valor.InformeEgreso.fechaEgreso);
                        }
                    }
                },
                error: (err) => {
                    this.plex.info('warning', 'Ocurrió un error egresando al paciente. Revise los movimientos de la internación e intente nuevamente.', 'Atención');
                }
            };

            if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
                this.egresoExtendido().subscribe(afterSave);
            } else {
                // medica, enfermeria
                this.egresoSimplificado(this.estadoDestino).subscribe(afterSave);
            }
        } else {
            this.plex.info('info', 'Debe completar los datos del egreso para poder guardar.', 'Datos incompletos');
            return;
        }
    }

    /*  Para las capas estadistica-v2, medica y enfermeria actualiza el resumen.
        Luego actualiza el estado de la cama cualquiera sea la capa.
     */

    // Setea valores de la prestacion (estadistica y estadistica-v2) antes de llamar al egreso simplificado

    egresoSimplificado(estado): Observable<any> {
        // Se configura nuevo estado con datos del egreso
        let estadoPatch = {};
        if (this.cama.sala) {
            this.cama.estado = estado;
            this.cama.extras = {
                egreso: true,
                idInternacion: this.cama.idInternacion,
                tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id
            };
            estadoPatch = this.cama;
        } else {
            estadoPatch = {
                _id: this.cama.id || this.cama._id,
                estado: estado,
                idInternacion: null,
                paciente: null,
                nota: null,
                fechaIngreso: null,
                extras: {
                    egreso: true,
                    idInternacion: this.cama.idInternacion,
                    tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id
                }
            };
        }

        const saveInternacion = () => {
            if (this.capa !== 'estadistica' && !this.cama.sala) {
                // estadistica-v2, medica, enfermeria (exceptuando salas)
                return this.internacionResumenService.update(this.cama.idInternacion, {
                    tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id,
                    fechaEgreso: this.registro.valor.InformeEgreso.fechaEgreso
                });
            }
            return of(null);
        };

        return saveInternacion().pipe(
            switchMap(resumenSaved => {
                this.onSave.emit();
                this.inProgress = false;

                if (this.capa !== 'estadistica' && !this.cama.sala && !resumenSaved) {
                    /* si hubo algun error actualizando el resumen, no debería actualizar el estado de la cama para
                            no generar datos inconsistentes entre internacion y movimientos */
                    throw new Error('Error al actualizar el resumen de internación.');
                }

                if (this.fechaEgresoOriginal) {
                    const fechaOriginalString = moment(this.fechaEgresoOriginal).toISOString();
                    const nuevaFechaString = moment(this.registro.valor.InformeEgreso.fechaEgreso).toISOString();

                    if (fechaOriginalString !== nuevaFechaString) {
                        return this.mapaCamasService.changeTime(this.cama, this.fechaEgresoOriginal, this.registro.valor.InformeEgreso.fechaEgreso, this.cama.idInternacion);
                    }
                    this.plex.info('success', 'Datos de egreso actualizados. Liberando/actualizando la cama.', 'Actualización Completa');
                    return this.mapaCamasService.save(estadoPatch, this.registro.valor.InformeEgreso.fechaEgreso);

                } else {
                    // Caso 3: PRIMER EGRESO (fechaEgresoOriginal es null)
                    return this.mapaCamasService.save(estadoPatch, this.registro.valor.InformeEgreso.fechaEgreso);
                }
            })
        );
    }

    egresoExtendido(): Observable<any> {
        const registros = this.controlRegistrosGuardar();

        if (!registros) {
            return of(null);
        }

        const informeId = this.informe._id || this.informe.id;
        const body = { informeEgreso: this.registro.valor.InformeEgreso };

        return this.informeEstadisticaService.patchRegistros(informeId, body).pipe(
            switchMap(informes => {

                if (this.view === 'listado-internacion' || this.capa === 'estadistica') {
                    this.mapaCamasService.selectInformeEstadistica(informes);
                }

                if (this.capa === 'estadistica-v2' && this.resumen?.fechaEgreso) {
                    const idInternacion = this.resumen.id;
                    this.internacionResumenService.update(idInternacion, {
                        tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso?.id,
                        fechaEgreso: this.registro.valor.InformeEgreso.fechaEgreso
                    }).subscribe();
                }

                return this.egresoSimplificado(this.estadoDestino);
            }),

            catchError(error => {
                this.plex.info(
                    'warning',
                    `${error} ${moment(this.registro.valor.InformeEgreso.fechaEgreso).format('YYYY-MM-DD HH:mm:ss').bold()}`,
                    'Error'
                );
                return of(null);
            })
        );
    }
    controlRegistrosGuardar() {
        const egreso = this.registro.valor.InformeEgreso;

        return {
            fechaEgreso: egreso.fechaEgreso,
            diasDeEstada: egreso.diasDeEstada,
            tipoEgreso: {
                id: egreso.tipoEgreso?.id,
                nombre: egreso.tipoEgreso?.nombre,
                OrganizacionDestino: egreso.UnidadOrganizativaDestino
                    ? {
                        id: egreso.UnidadOrganizativaDestino.id,
                        nombre: egreso.UnidadOrganizativaDestino.nombre
                    }
                    : undefined
            },
            diagnosticos: {
                principal: egreso.diagnosticoPrincipal,
                secundarios: egreso.otrosDiagnosticos,
                otrasCircunstancias: egreso.otrasCircunstancias,
                diasEstadaOtrasCircunstancias: egreso.diasEstadaOtrasCircunstancias,
                diasDePermisoDeSalida: egreso.diasDePermisoDeSalida
            }
        };
    }

    setDiasEstada() {
        if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
            const fechaIngreso = this.informe.informeIngreso?.fechaIngreso || this.resumen?.fechaIngreso;
            const fechaEgreso = this.registro.valor.InformeEgreso?.fechaEgreso;
            if (fechaIngreso && fechaEgreso) {
                const dias = this.mapaCamasService.calcularDiasEstada(fechaIngreso, fechaEgreso);

                this.registro.valor.InformeEgreso.diasDeEstada = dias;

            } else {
                console.warn('⚠️ No se puede calcular días de estadía: faltan fechas', {
                    fechaIngreso,
                    fechaEgreso
                });
            }
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            const query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            let organizacionSalida = [];
            if (this.informeIngreso && this.informeIngreso.organizacionOrigen) {
                organizacionSalida = [this.informeIngreso.organizacionOrigen];
            }
            event.callback(organizacionSalida);
        }
    }


    public onChangeTraslado(event: { value: boolean }) {
        if (event.value) {
            this.registro.valor.InformeEgreso.tipoEgreso.OrganizacionDestino = null;
        } else {
            this.registro.valor.InformeEgreso.tipoEgreso.otraOrganizacion = null;
            this.registro.valor.InformeEgreso.tipoEgreso.OrganizacionDestino = { id: null, nombre: null };
        }
        this.refreshSaveButton.next({});
    }


    codigoCIE10(event, tipo) {
        const filtro = [{
            desde: 'A00',
            hasta: 'V00'
        }, {
            desde: 'Z00',
            hasta: 'Z99'
        }];
        if (event && event.query) {
            const query = {
                nombre: event.query,
                filtroRango: (tipo === 'diagnostico') ? JSON.stringify(filtro) : undefined
            };

            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => {
                    dato.nombre = '(' + dato.codigo + ') ' + dato.nombre;
                });
                event.callback(datos);
            });
        } else {
            const callback = [];

            const principal = this.registro.valor.InformeEgreso.diagnosticos?.principal;
            if (principal) {
                callback.push(principal);
            }

            if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
                callback.push(...this.registro.valor.InformeEgreso.otrosDiagnosticos);
            }

            if (this.registro.valor.InformeEgreso.causaExterna?.comoSeProdujo) {
                callback.push(this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo);
            }

            event.callback(callback);
        }
    }


    showProcedimientos_causas() {
        this.procedimientosObstetricos = false;
        this.procedimientosObstetricosNoReq = false;
        this.existeCausaExterna = false;
        this.registro.valor.InformeEgreso.nacimientos = [
            {
                pesoAlNacer: null,
                condicionAlNacer: null,
                terminacion: null,
                sexo: null
            }
        ];
        const regexCIECausasExternas = new RegExp('^S|^T');
        const regexCIEProcedimientosObstetricos = new RegExp('^O8[0-4].[0-9]|O60.1|O60.2');
        const regexCIEProcedimientosObstetricosNoReq = new RegExp('^O0[0-6].[0-9]');


        if (this.registro.valor.InformeEgreso.diagnosticos?.principal) {
            this.existeCausaExterna = regexCIECausasExternas.test(
                this.registro.valor.InformeEgreso.diagnosticos.principal.codigo
            );
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            const diagCausaExterna = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIECausasExternas.test(d.codigo));
            if (diagCausaExterna && diagCausaExterna.length > 0) {
                this.existeCausaExterna = true;
            }
        }

        if (this.registro.valor.InformeEgreso.diagnosticos?.principal) {
            const principal = this.registro.valor.InformeEgreso.diagnosticos.principal;
            this.procedimientosObstetricos = regexCIEProcedimientosObstetricos.test(principal.codigo);
            this.procedimientosObstetricosNoReq = regexCIEProcedimientosObstetricosNoReq.test(principal.codigo);
        }
        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            const diagObstetitricos = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricosNoReq.test(d.codigo));
            if (diagObstetitricos && diagObstetitricos.length > 0) {
                this.procedimientosObstetricosNoReq = true;
            }
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            const diagObstetitricosReq = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricos.test(d.codigo));
            if (diagObstetitricosReq && diagObstetitricosReq.length > 0) {
                this.procedimientosObstetricos = true;
            }
        }
    }

    searchComoSeProdujo(event) {
        const desde = 'V00';
        const hasta = 'Y98';
        let filtro;

        if (this.registro.valor.InformeEgreso.causaExterna.producidaPor) {

            switch (this.registro.valor.InformeEgreso.causaExterna.producidaPor.id) {
                case 'Accidente':
                    filtro = [{ desde: 'V01', hasta: 'X60' }, { desde: 'Y40', hasta: 'Y98' }];
                    break;
                case 'lesionAutoinfligida':
                    filtro = [{ desde: 'X60', hasta: 'X85' }];
                    break;
                case 'agresion':
                    filtro = [{ desde: 'X85', hasta: 'Y10' }];
                    break;
                case 'seIgnora': {
                    filtro = [{ desde: 'Y10', hasta: 'Y36' }];
                    break;
                }
            }
        }
        if (event && event.query) {
            const query = {
                nombre: event.query,
                filtroRango: JSON.stringify(filtro)
            };
            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => {
                    dato.nombre = '(' + dato.codigo + ') ' + dato.nombre;
                });
                event.callback(datos);
            });
        }
        if (this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo) {
            event.callback([this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo]);
        } else {
            event.callback([]);
        }
    }

    addNacimiento() {
        const nuevoNacimiento = Object.assign({}, {
            pesoAlNacer: null,
            condicionAlNacer: null,
            terminacion: null,
            sexo: null
        });
        this.registro.valor.InformeEgreso.nacimientos.push(nuevoNacimiento);
    }

    removeNacimiento(i) {
        if (i > 0) {
            this.registro.valor.InformeEgreso.nacimientos.splice(i, 1);
        }
    }

    getListaProcedimientosQuirurgicos(event) {
        if (event && event.query) {
            const query = {
                nombre: event.query

            };
            this.procedimientosQuirurgicosService.get(query).subscribe((rta) => {
                rta.map(dato => {
                    dato.nom = '(' + dato.codigo + ') ' + dato.nombre;
                });
                event.callback(rta);
            });

        } else {
            let procedimientoQuirurgico = [];
            if (this.registro.valor.InformeEgreso.procedimientosQuirurgicos) {
                procedimientoQuirurgico = [this.registro.valor.InformeEgreso.procedimientosQuirurgicos];
            }
            event.callback(procedimientoQuirurgico);
        }
    }

    addProcedimientoQuirurgico() {
        this.registro.valor.InformeEgreso.procedimientosQuirurgicos.push({
            procedimiento: null,
            fecha: null
        });
    }

    removeProcedimiento(i) {
        this.registro.valor.InformeEgreso.procedimientosQuirurgicos.splice(i, 1);
    }

    //  Se debe controlar que la cama este disponible en la fecha que la quiero usar,
    checkEstadoCama() {
        this.mapaCamasService.get(this.fecha, this.cama?.id).subscribe((cama) => {
            if (cama && cama.estado !== 'disponible') {
                if (!cama.idInternacion || (cama.idInternacion && cama.idInternacion !== this.informe.id) && this.capa !== 'estadistica-v2') {
                    this.registro.valor.InformeEgreso.fechaEgreso = this.fechaEgresoOriginal;
                    this.fecha = this.fechaEgresoOriginal;
                    this.plex.info('warning', `No es posible realizar el cambio de fecha porque la cama ${this.cama.nombre.bold()} no se encuentra disponible`,
                        'Cama no disponible');
                }

            }
            this.inProgress = false;
        });
    }

    /*
        Controla que no se haya internado y egresado otro paciente hasta la fecha seleccionada.
        Define las fechas minima y maxima para el egreso actual según corresponda.
    */
    checkHistorial(fecha: Date) {

        if (this.subscription4) {
            this.subscription4.unsubscribe();
        }
        this.subscription4 = this.mapaCamasService.historial('cama', this.cama?.fecha, moment().toDate(), this.cama).subscribe(
            historialCama => {
                this.fechaMax = null;
                for (const historial of historialCama) {
                    if (!this.fechaMax && historial.estado === 'ocupada' && historial.idInternacion !== this.cama?.idInternacion) {
                        this.fechaMax = new Date(historial.fecha);
                    }
                }
                if (moment(fecha).isSameOrAfter(moment(this.fechaMax))) {
                    this.fecha = moment(this.fechaMax).add(-1, 'h').toDate();
                    this.plex.info('warning', `La fecha máxima para este egreso es: ${this.fecha.toLocaleDateString('es-ES')}`, 'Cambio de Fecha');
                } else {
                    this.fecha = fecha;
                }
                this.setFecha();
            }
        );
    }

    disableGuardar(formEgreso) {
        let condicion = false;
        if (this.capa === 'estadistica') {
            condicion = this.prestacionValidada;
        }

        return formEgreso.invalid
            || this.disableSave
            || this.inProgress
            || condicion;
    }
}
