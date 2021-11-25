import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Cie10Service } from '../../../../mitos';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { ProcedimientosQuirurgicosService } from '../../../../../services/procedimientosQuirurgicos.service';
import { listaTipoEgreso, causaExterna, opcionesTipoParto, opcionesCondicionAlNacer, opcionesTerminacion, opcionesSexo } from '../../constantes-internacion';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { IMaquinaEstados } from '../../interfaces/IMaquinaEstados';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { combineLatest, Subscription, Observable, of } from 'rxjs';
import { ListadoInternacionService } from '../../views/listado-internacion/listado-internacion.service';
import { catchError, map, switchMap } from 'rxjs/operators';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';

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
        private internacionResumenService: InternacionResumenHTTP
    ) {

    }

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
    public disableButton$: Observable<boolean>;
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

        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ).subscribe(([view, capa, cama, prestacion]) => {
            this.inProgress = false;
            let fecha = this.mapaCamasService.fecha ? this.mapaCamasService.fecha : moment().toDate();
            if (view === 'listado-internacion' && prestacion) {
                // DESDE EL LISTADO FECHA VIENE CON LA DEL INGRESO. PUES NO!
                fecha = moment().toDate();
                this.prestacionValidada = prestacion.estados[prestacion.estados.length - 1].tipo === 'validada';
            }
            this.registro.valor.InformeEgreso.fechaEgreso = fecha;
            this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();

            this.view = view;
            this.capa = capa;
            if (capa === 'estadistica') {
                if (!prestacion) {
                    return;
                }
                this.prestacion = prestacion;
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;

                if (this.hayEgreso) {
                    this.registro.valor.InformeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
                    fecha = this.registro.valor.InformeEgreso.fechaEgreso;
                    this.registro.valor.InformeEgreso.fechaEgreso = this.registro.valor.InformeEgreso.fechaEgreso;
                    this.fechaEgresoOriginal = this.registro.valor.InformeEgreso.fechaEgreso;

                    const informeEgreso = this.registro.valor.InformeEgreso;
                    this.checkTraslado = informeEgreso.tipoEgreso.id === 'Traslado' && !informeEgreso.UnidadOrganizativaDestino?.id;
                    this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();
                }

                if (this.view === 'listado-internacion') {
                    if (this.subscription2) {
                        this.subscription2.unsubscribe();
                    }
                    let fechaABuscar = moment(this.informeIngreso.fechaIngreso).add(1, 's');
                    if (this.hayEgreso) {
                        fechaABuscar = moment(this.registro.valor.InformeEgreso.fechaEgreso).add(-10, 's');
                    }
                    this.subscription2 = this.mapaCamasService.snapshot(
                        fechaABuscar.toDate(),
                        this.prestacion.id
                    ).subscribe((snapshot) => {
                        this.cama = snapshot[0];
                        if (this.cama) {
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
        if (this.capa === 'estadistica') {
            this.setDiasEstada();
            this.checkEstadoCama();
            this.fechaMaxProcedimiento = moment(this.registro.valor.InformeEgreso.fechaEgreso).endOf('day').toDate();

        }
    }

    guardar(valid) {
        if (valid.formValid) {
            this.disableButton = true;
            if (this.capa === 'estadistica') {
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
        if ((this.prestacion && !this.prestacion.ejecucion.registros[1]) || !this.prestacion) {
            let estadoPatch = {};
            if (!this.cama.sala) {
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
                this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
                if (this.view === 'listado-internacion') {
                    this.listadoInternacionService.setFechaHasta(this.registro.valor.InformeEgreso.fechaEgreso);
                } else if (this.view === 'mapa-camas') {
                    this.mapaCamasService.select(null);
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
            this.mapaCamasService.snapshot(moment(this.fechaEgresoOriginal).add(-1, 's').toDate(),
                this.prestacion.id).subscribe((snapshot) => {
                const ultimaCama = snapshot[0];
                this.mapaCamasService.changeTime(ultimaCama, this.fechaEgresoOriginal, this.registro.valor.InformeEgreso.fechaEgreso, null).subscribe(camaActualizada => {
                    this.plex.info('success', 'Los datos se actualizaron correctamente');
                    this.listadoInternacionService.setFechaHasta(moment().toDate());
                });
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
            this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacion => {
                if (this.view === 'listado-internacion') {
                    this.mapaCamasService.selectPrestacion(prestacion);
                }
                this.egresoSimplificado(this.estadoDestino);
                this.cambiarEstado();
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
        const fechaIngreso = this.informeIngreso.fechaIngreso;
        const fechaEgreso = this.registro.valor.InformeEgreso.fechaEgreso;
        this.registro.valor.InformeEgreso['diasDeEstada'] = this.mapaCamasService.calcularDiasEstada(fechaIngreso, fechaEgreso);
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

    // Se debe controlar que:
    // La cama este disponible en la fecha que la quiero usar,

    checkEstadoCama() {
        this.mapaCamasService.get(this.fecha, this.cama?.id).subscribe((cama) => {
            if (cama && cama.estado !== 'disponible') {
                if (!cama.idInternacion || (cama.idInternacion && cama.idInternacion !== this.prestacion.id)) {
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
                    if (!this.fechaMax && historial.estado === 'ocupada' && historial.idInternacion !== this.cama.idInternacion) {
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
