
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
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

    public inProgress = false;
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
                if (!this.cama || this.cama?.sala || this.formEgreso.invalid || (this.capa === 'estadistica' && this.prestacionValidada)) {
                    return true;
                }
                const camaActual = camas.find(c => c.id === (this.cama as any)?._id);
                // else: this.cama tiene valor, el form de egreso es valido y de ser capa estadistica la prestacion no esta validada
                const condicion = camaActual?.estado === 'disponible'
                    || (camaActual?.estado === 'ocupada' && camaActual?.idInternacion === this.cama?.idInternacion)
                    || this.prestacion;

                return !condicion;
            })
        );

        this.registrosEgresoResumen$ = combineLatest([
            this.mapaCamasService.capa2,
            this.mapaCamasService.prestacion$
        ]).pipe(
            first(),
            switchMap(([capa, prestacion]) => {
                if (capa === 'estadistica' || (capa === 'estadistica-v2' && this.view === 'mapa-camas')) {
                    /*  Si es capa estadistica va a existir la prestacion pero no el resumen.
                        Si es capa medica la que realiza el egreso, puede que estadistica-v2 aun no haya cargado el informe de ingreso.
                        En este caso particular, permitimos el egreso y obtenemos la fecha de ingreso desde el resumen.
                    */
                    const fechaIngreso = prestacion?.ejecucion.registros[0].valor.informeIngreso.fechaIngreso || this.resumen?.fechaIngreso;
                    const paciente = prestacion?.paciente.id || this.resumen?.paciente.id;
                    const desde = moment(fechaIngreso).subtract(12, 'hours').toDate();
                    const hasta = moment(fechaIngreso).add(12, 'hours').toDate();

                    return this.internacionResumenService.search({
                        organizacion: this.auth.organizacion.id,
                        paciente: paciente,
                        ingreso: this.internacionResumenService.queryDateParams(desde, hasta)
                    }).pipe(
                        map(resumen => resumen[0])
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
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.resumenInternacion$
        ]).subscribe(([view, capa, ambito, cama, prestacion, resumen]) => {
            this.inProgress = false;
            this.resumen = resumen;
            let fecha = moment(resumen?.fechaEgreso || this.mapaCamasService.fecha).toDate();

            if (view === 'listado-internacion' && prestacion) {
                // DESDE EL LISTADO FECHA VIENE CON LA DEL INGRESO. PUES NO!
                fecha = moment(resumen?.fechaEgreso).toDate() || moment().toDate();
                this.prestacionValidada = prestacion.estados[prestacion.estados.length - 1].tipo === 'validada';
            }

            this.registro.valor.InformeEgreso.fechaEgreso = moment(fecha).toDate();
            this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
            this.fechaEgresoOriginal = null;

            this.view = view;
            this.capa = capa;
            if (capa === 'estadistica' || capa === 'estadistica-v2') {
                if (!prestacion) {
                    return;
                }
                this.prestacion = prestacion;
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
                if (this.hayEgreso) {
                    this.registro.valor.InformeEgreso = Object.assign({}, this.prestacion.ejecucion.registros[1].valor.InformeEgreso);
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
                    const idInternacion = resumen?.id || prestacion.id;
                    this.subscription2 = this.camasHTTP.historialInternacion(ambito, capa, fechaABuscarMin, fechaABuscarMax, idInternacion)
                        .subscribe(movimientos => {
                            movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                            this.cama = movimientos[0];
                            if (this.cama) {
                                this.cama.id = this.cama.idCama;
                                this.refreshSaveButton.next({});
                                this.fechaMin = moment(this.cama.fecha, 'DD-MM-YYYY HH:mm').toDate();
                                this.checkHistorial(fecha);
                                if (this.subscription3) {
                                    this.subscription3.unsubscribe();
                                }
                                this.subscription3 = this.mapaCamasService.getRelacionesPosibles(this.cama).subscribe((relacionesPosibles) => {
                                    this.estadoDestino = relacionesPosibles[0].destino;
                                });
                            }
                        });
                }
            } else {
                // asistencial
                if (this.resumen?.fechaEgreso) {
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

                        this.subscription3 = this.mapaCamasService.getRelacionesPosibles(this.cama).subscribe((relacionesPosibles) => {
                            this.estadoDestino = relacionesPosibles[0].destino;
                        });
                    });
            }

            this.fecha = moment(fecha).toDate();
            this.setDiasEstada();
        });
    }

    onType() {
        this.inProgress = true;
    }

    get hayEgreso() {
        return this.prestacion && this.prestacion.ejecucion.registros[1] && this.prestacion.ejecucion.registros[1].valor;
    }

    setFecha() {
        if (!this.fecha) {
            return;
        }
        const nuevaFecha = moment(this.fecha).toDate();
        this.mapaCamasService.setFecha(nuevaFecha);
        this.registro.valor.InformeEgreso.fechaEgreso = nuevaFecha;
        if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
            // si se está egresando con fusion de capas puede que estadistica-v2 aun no haya cargado el informe
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
                complete: () => {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    if (this.view === 'listado-internacion') {
                        const fechaHasta = moment(this.registro.valor.InformeEgreso.fechaEgreso).add(1, 'minute').toDate();
                        // actualiza el listado
                        this.listadoInternacionService.setFechaHasta(fechaHasta);
                        this.listadoInternacionCapasService.setFechaHasta(fechaHasta);
                        this.mapaCamasService.selectPrestacion(null);
                        this.mapaCamasService.selectResumen(null);
                    } else if (this.view === 'mapa-camas') {
                        this.mapaCamasService.setFecha(this.registro.valor.InformeEgreso.fechaEgreso);
                    }
                },
                error: () => {
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
    egresoSimplificado(estado): Observable<any> {
        // Se configura nuevo estado con datos del egreso
        let estadoPatch = {};
        if (this.cama.sala) {
            // sala comun
            this.cama.estado = estado;
            this.cama.extras = {
                egreso: true,
                idInternacion: this.cama.idInternacion,
                tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id
            };
            estadoPatch = this.cama;
        } else {
            // cama
            estadoPatch = {
                _id: this.cama.id,
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
                    /*  si hubo algun error actualizando el resumen, no debería actualizar el estado de la cama para
                            no generar datos inconsistentes entre internacion y movimientos */
                    throw new Error();
                }
                if (this.fechaEgresoOriginal) {
                    return this.mapaCamasService.changeTime(this.cama, this.fechaEgresoOriginal, this.registro.valor.InformeEgreso.fechaEgreso, this.cama.idInternacion);
                } else {
                    return this.mapaCamasService.save(estadoPatch, this.registro.valor.InformeEgreso.fechaEgreso);
                }
            })
        );
    }

    // Setea valores de la prestacion (estadistica y estadistica-v2) antes de llamar al egreso simplificado
    egresoExtendido(): Observable<any> {
        const registros = this.controlRegistrosGuardar();
        if (registros) {
            const params: any = {
                op: 'registros',
                registros: registros
            };
            return this.servicioPrestacion.patch(this.prestacion.id, params).pipe(
                switchMap(prestacion => {
                    if (this.view === 'listado-internacion') {
                        this.mapaCamasService.selectPrestacion(prestacion);
                    }
                    if (this.capa === 'estadistica-v2' && this.resumen?.fechaEgreso) {
                        const idInternacion = this.view === 'listado-internacion' ? this.resumen.id : this.cama.idInternacion;
                        // actualiza fecha y tipo de egreso en el resumen para mantener la sincronización
                        return this.internacionResumenService.update(idInternacion, {
                            tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id,
                            fechaEgreso: this.registro.valor.InformeEgreso.fechaEgreso
                        });
                    } else {
                        // estadistica o medica
                        return this.egresoSimplificado(this.estadoDestino);
                    }
                }),
            );
        }
        return of(null);
    }

    controlRegistrosGuardar() {
        const registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.registro.esDiagnosticoPrincipal = true;
        }

        if (this.registro.valor.InformeEgreso.UnidadOrganizativaDestino) {
            const datosOrganizacionDestino = {
                id: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.id,
                nombre: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.nombre
            };
            this.registro.valor.InformeEgreso.UnidadOrganizativaDestino = datosOrganizacionDestino;
        }

        const existeEgreso = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === '58000006');

        if (!existeEgreso) {
            registros.push(this.registro);
        } else {
            const indexRegistro = registros.findIndex(registro => registro.concepto.conceptId === '58000006');
            registros[indexRegistro] = this.registro;
        }

        return registros;
    }


    setDiasEstada() {
        if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
            const fechaIngreso = this.informeIngreso.fechaIngreso || this.resumen.fechaIngreso;
            const fechaEgreso = this.registro.valor.InformeEgreso.fechaEgreso;
            this.registro.valor.InformeEgreso['diasDeEstada'] = this.mapaCamasService.calcularDiasEstada(fechaIngreso, fechaEgreso);
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

    onChangeTraslado(event) {
        if (event.value) {
            this.registro.valor.InformeEgreso.UnidadOrganizativaDestino = { id: null, nombre: '' };
        } else {
            this.registro.valor.InformeEgreso.UnidadOrganizativaDestino = null;
        }

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
            if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
                callback.push(this.registro.valor.InformeEgreso.diagnosticoPrincipal);
            }
            if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {

                callback.push(this.registro.valor.InformeEgreso.otrosDiagnosticos);

            }
            if (this.registro.valor.InformeEgreso.causaExterna && this.registro.valor.InformeEgreso.causaExterna.comoSeProdujo) {
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

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.existeCausaExterna = regexCIECausasExternas.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            const diagCausaExterna = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIECausasExternas.test(d.codigo));
            if (diagCausaExterna && diagCausaExterna.length > 0) {
                this.existeCausaExterna = true;
            }
        }

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.procedimientosObstetricos = regexCIEProcedimientosObstetricos.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
            this.procedimientosObstetricosNoReq = regexCIEProcedimientosObstetricosNoReq.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
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
                if (!cama.idInternacion || (cama.idInternacion && cama.idInternacion !== this.prestacion.id) && this.capa !== 'estadistica-v2') {
                    this.registro.valor.InformeEgreso.fechaEgreso = this.fechaEgresoOriginal;
                    this.fecha = this.fechaEgresoOriginal;
                    this.plex.info('warning', `No es posible realizar el cambio de fecha porque la cama ${this.cama.nombre.bold()} no se encuentra disponible`,
                        'Cama no disponible');
                }

            }
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
        this.subscription4 = this.mapaCamasService.historial('cama', this.cama.fecha, moment().toDate(), this.cama).subscribe(
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
