
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { catchError, first, map, switchMap } from 'rxjs/operators';
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
@Component({
    selector: 'app-egresar-paciente',
    templateUrl: './egresar-paciente.component.html',
})

export class EgresarPacienteComponent implements OnInit, OnDestroy {
    // EVENTOS
    @Output() onSave = new EventEmitter<any>();

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
    public disableButton = false;
    public inProgress = false;
    public resumen;
    private subscription: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;
    private subscription4: Subscription;
    public disableButton$: Observable<boolean>;

    constructor(
        public auth: Auth,
        public plex: Plex,
        public cie10Service: Cie10Service,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        public mapaCamasService: MapaCamasService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
        private listadoInternacionService: ListadoInternacionService,
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
        this.inProgress = true;
        this.fecha = this.mapaCamasService.fecha;

        this.disableButton$ = this.mapaCamasService.snapshot$.pipe(
            map((camas) => {
                this.inProgress = false;
                if (this.cama?.sala) {
                    return false;
                }
                const camaActual = camas.find(c => c.id === this.cama?.id);
                if ((camaActual?.estado === 'ocupada' && camaActual?.idInternacion === this.cama?.idInternacion) || this.prestacion) {
                    return false;
                }
                return true;
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
            let fecha = resumen?.fechaEgreso || this.mapaCamasService.fecha || moment().toDate();

            if (view === 'listado-internacion' && prestacion) {
                // DESDE EL LISTADO FECHA VIENE CON LA DEL INGRESO. PUES NO!
                fecha = resumen?.fechaEgreso || moment().toDate();
                this.prestacionValidada = prestacion.estados[prestacion.estados.length - 1].tipo === 'validada';
            }
            this.registro.valor.InformeEgreso.fechaEgreso = fecha;
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
                    this.registro.valor.InformeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    fecha = this.registro.valor.InformeEgreso.fechaEgreso;
                    this.fechaEgresoOriginal = this.registro.valor.InformeEgreso.fechaEgreso;

                    const informeEgreso = this.registro.valor.InformeEgreso;
                    this.checkTraslado = informeEgreso.tipoEgreso.id === 'Traslado' && !informeEgreso.UnidadOrganizativaDestino?.id;
                    this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
                }

                if (this.view === 'listado-internacion') {
                    if (this.subscription2) {
                        this.subscription2.unsubscribe();
                    }
                    const fechaABuscarMin = moment(this.informeIngreso.fechaIngreso).add(-1, 's').toDate();
                    const fechaABuscarMax = this.hayEgreso ? moment(this.registro.valor.InformeEgreso.fechaEgreso).add(-10, 's').toDate() : moment().toDate();
                    const idInternacion = resumen?.id || prestacion.id;
                    this.subscription2 = this.camasHTTP.historialInternacion(ambito, capa, fechaABuscarMin, fechaABuscarMax, idInternacion)
                        .subscribe((snapshot) => {
                            snapshot.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                            this.cama = snapshot[0];
                            if (this.cama) {
                                this.cama.id = this.cama.idCama;
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
            }
            if (cama.id && cama.id !== ' ') {
                this.cama = cama;
                this.fechaMin = moment(this.cama.fecha).add(1, 'm').toDate();
                this.checkHistorial(fecha);
                if (this.subscription3) {
                    this.subscription3.unsubscribe();
                }
                this.subscription3 = this.mapaCamasService.getRelacionesPosibles(cama).subscribe((relacionesPosibles) => {
                    this.estadoDestino = relacionesPosibles[0].destino;
                });
            }
            this.fecha = fecha;
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
        this.mapaCamasService.setFecha(this.fecha);
        this.registro.valor.InformeEgreso.fechaEgreso = this.fecha;
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
            this.disableButton = true;
            if (this.capa === 'estadistica' || this.capa === 'estadistica-v2') {
                this.egresoExtendido();
            } else {
                this.egresoSimplificado(this.estadoDestino);
            }
            this.onSave.emit(null);
        } else {
            this.plex.info('info', 'ERROR: Los datos de egreso no estan completos');
            return;
        }
    }

    egresoSimplificado(estado) {
        // Se configura nuevo estado con datos del egreso
        if ((this.prestacion && !this.prestacion.ejecucion.registros[1]) || !this.prestacion) {
            let estadoPatch = {};
            if (!this.cama.sala) {// si no es sala comun
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
            } else {
                this.cama.estado = estado;
                this.cama.extras = {
                    egreso: true,
                    idInternacion: this.cama.idInternacion,
                    tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id
                };
                estadoPatch = this.cama;
            }
            const saveInternacion = () => {
                if (this.capa !== 'estadistica') {
                    return this.internacionResumenService.update(this.cama.idInternacion, {
                        tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id,
                        fechaEgreso: this.registro.valor.InformeEgreso.fechaEgreso
                    }).pipe(
                        catchError(() => of(null))
                    );
                }
                return of(null);
            };

            saveInternacion().pipe(
                switchMap(() => this.mapaCamasService.save(estadoPatch, this.registro.valor.InformeEgreso.fechaEgreso))
            ).subscribe(() => {
                this.plex.toast('success', 'Egreso guardado correctamente', 'Prestacion guardada', 100);
                if (this.view === 'listado-internacion') {
                    this.listadoInternacionService.setFechaHasta(this.registro.valor.InformeEgreso.fechaEgreso);
                } else if (this.view === 'mapa-camas') {
                    this.mapaCamasService.setFecha(this.registro.valor.InformeEgreso.fechaEgreso);
                }
                this.disableButton = false;
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al egresar paciente!');
                this.disableButton = false;
            });
        }
    }

    cambiarEstado() {
        if (this.fechaEgresoOriginal && this.registro.valor.InformeEgreso.fechaEgreso.getTime() !== this.fechaEgresoOriginal.getTime()) {
            this.mapaCamasService.snapshot(moment(this.fechaEgresoOriginal).add(-1, 's').toDate(), this.prestacion.id).pipe(
                switchMap(snapshot => {
                    const ultimaCama = snapshot[0];
                    return this.mapaCamasService.changeTime(ultimaCama, this.fechaEgresoOriginal, this.registro.valor.InformeEgreso.fechaEgreso, null);
                })
            ).subscribe(() => {
                this.plex.info('success', 'Los datos se actualizaron correctamente');
                this.listadoInternacionService.setFechaHasta(moment().toDate());
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al intentar actualizar los datos');
            });
        } else {
            this.plex.info('success', 'Los datos se actualizaron correctamente');
        }
    }

    egresoExtendido() {
        const registros = this.controlRegistrosGuardar();
        if (registros) {
            const params: any = {
                op: 'registros',
                registros: registros
            };
            this.servicioPrestacion.patch(this.prestacion.id, params).pipe(
                switchMap(prestacion => {
                    if (this.view === 'listado-internacion') {
                        this.mapaCamasService.selectPrestacion(prestacion);
                    }
                    if (this.resumen?.fechaEgreso && this.capa === 'estadistica-v2') {
                        const idInternacion = this.view === 'listado-internacion' ? this.resumen.id : this.cama.idInternacion;
                        // actualiza fecha y tipo de egreso en el resumen para mantener la sincronización
                        return this.internacionResumenService.update(idInternacion, {
                            tipo_egreso: this.registro.valor.InformeEgreso.tipoEgreso.id,
                            fechaEgreso: this.registro.valor.InformeEgreso.fechaEgreso
                        });
                    } else {
                        this.egresoSimplificado(this.estadoDestino);
                        this.cambiarEstado();
                    }
                    return of(null);
                }),
            ).subscribe(() => {
                this.plex.info('success', 'Los datos se actualizaron correctamente');
                if (this.view === 'listado-internacion') {
                    this.listadoInternacionService.setFechaHasta(this.registro.valor.InformeEgreso.fechaEgreso);
                }
            }, () => {
                this.plex.info('danger', 'Error al intentar actualizar los datos');
            });
        }
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

    codigoCIE10(event) {
        if (event && event.query) {
            const query = {
                nombre: event.query
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
                    filtro = [{ desde: 'V01', hasta: 'X60' }];
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
                    this.plex.info('warning', `No es posible realizar el cambio de fecha porque la cama ${this.cama.nombre} no se encuentra disponible`,
                        'Cama no dosponible');
                }

            }
        });
    }

    /*
        Controla que no se haya internado y egresado otro paciente hasta la fecha seleccionada.
        Define la fecha maxima para el egreso actual según corresponda.
    */
    checkHistorial(fecha: Date) {
        if (this.subscription4) {
            this.subscription4.unsubscribe();
        }
        this.subscription4 = this.mapaCamasService.historial('cama', this.cama.fecha, moment().toDate(), this.cama).subscribe(
            (historialCama) => {
                this.fechaMax = null;
                for (const historial of historialCama) {
                    if (!this.fechaMax && historial.estado === 'ocupada' && historial.idInternacion !== this.cama?.idInternacion) {
                        this.fechaMax = historial.fecha;
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

}
