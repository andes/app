import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnDestroy } from '@angular/core';
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
import { combineLatest, Subscription, Observable } from 'rxjs';

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

    // VARIABLES
    public fecha: Date;
    public fechaMax: Date;
    public fechaMin: Date;
    public view: string;
    public capa: string;
    public cama: ISnapshot;
    public prestacion: IPrestacion;
    public maquinaEstados: IMaquinaEstados;
    public estadoDestino;
    public esTraslado = false;
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
            refsetIds: ['900000000000497000'],
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
                },
            }
        }
    };

    public procedimientosObstetricos = false;
    public procedimientosObstetricosNoReq = false;
    public existeCausaExterna = false;
    public listaProcedimientosQuirurgicos: any[];

    private subscription: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;

    constructor(
        public auth: Auth,
        public plex: Plex,
        public cie10Service: Cie10Service,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private mapaCamasService: MapaCamasService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
    ) {

    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
        if (this.subscription3) {
            this.subscription3.unsubscribe();
        }
    }

    ngOnInit() {
        this.fecha = this.mapaCamasService.fecha;

        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ).subscribe(([view, capa, cama, prestacion]) => {
            this.registro.valor.InformeEgreso.fechaEgreso = this.mapaCamasService.fecha;
            this.fechaMax = moment().toDate();
            this.view = view;
            this.capa = capa;
            let fecha = moment().toDate();
            if (capa === 'estadistica') {
                this.prestacion = prestacion;
                this.informeIngreso = this.prestacion.ejecucion.registros[0].valor.informeIngreso;
                this.fechaMin = this.informeIngreso.fechaIngreso;
                fecha = this.informeIngreso.fechaIngreso;
                if (this.prestacion.ejecucion.registros[1] && this.prestacion.ejecucion.registros[1].valor) {
                    this.registro.valor.InformeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
                }
                this.setFecha();

                if (this.view === 'listado-internacion') {
                    this.subscription2 = this.mapaCamasService.snapshot(fecha, prestacion.id).subscribe((snapshot) => {
                        this.cama = snapshot[0];
                        this.subscription3 = this.mapaCamasService.getRelacionesPosibles(this.cama).subscribe((relacionesPosibles) => {
                            this.estadoDestino = relacionesPosibles[0].destino;
                        });
                    });
                }
            }

            if (cama.idCama) {
                this.cama = cama;
                this.subscription3 = this.mapaCamasService.getRelacionesPosibles(cama).subscribe((relacionesPosibles) => {
                    this.estadoDestino = relacionesPosibles[0].destino;
                });
            }
        });
    }

    setFecha() {
        this.mapaCamasService.setFecha(this.fecha);
        this.registro.valor.InformeEgreso.fechaEgreso = this.fecha;
        if (this.capa === 'estadistica') {
            this.calcularDiasEstada();
        }
    }

    guardar(valid) {
        if (valid.formValid) {
            if (this.capa === 'estadistica') {
                this.egresoExtendido();
            } else {
                this.egresoSimplificado(this.estadoDestino);
            }
        } else {
            this.plex.info('info', 'ERROR: Los datos de egreso no estan completos');
            return;
        }
    }

    egresoSimplificado(estado) {
        // Se modifica el estado de la cama
        const estadoPatch = {
            _id: this.cama.idCama,
            estado: estado,
            idInternacion: null,
            paciente: null,
            extras: {
                egreso: true,
                idInternacion: this.cama.idInternacion
            }
        };
        // this.cama.estado = estado;
        // this.cama.idInternacion = null;
        // this.cama.paciente = null;

        this.mapaCamasService.save(estadoPatch, this.registro.valor.InformeEgreso.fechaEgreso).subscribe(camaActualizada => {
            this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
            if (this.view === 'listado-internacion') {
                this.mapaCamasService.setFechaHasta(this.registro.valor.InformeEgreso.fechaEgreso);
            } else if (this.view === 'mapa-camas') {
                this.mapaCamasService.select(null);
                this.mapaCamasService.setFecha(this.registro.valor.InformeEgreso.fechaEgreso);
            }
            this.onSave.emit();
        }, (err1) => {
            this.plex.info('danger', err1, 'Error al intentar desocupar la cama');
        });
    }

    egresoExtendido() {
        let registros = this.controlRegistrosGuardar();
        if (registros) {
            let params: any = {
                op: 'registros',
                registros: registros
            };
            this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacion => {
                this.mapaCamasService.selectPrestacion(prestacion);
                this.egresoSimplificado(this.estadoDestino);
            });
        }
    }

    controlRegistrosGuardar() {
        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.registro.esDiagnosticoPrincipal = true;
        }

        if (this.registro.valor.InformeEgreso.UnidadOrganizativaDestino) {
            let datosOrganizacionDestino = {
                id: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.id,
                nombre: this.registro.valor.InformeEgreso.UnidadOrganizativaDestino.nombre
            };
            this.registro.valor.InformeEgreso.UnidadOrganizativaDestino = datosOrganizacionDestino;
        }

        let existeEgreso = this.prestacion.ejecucion.registros.find(r => r.concepto.conceptId === '58000006');

        if (!existeEgreso) {
            registros.push(this.registro);
        } else {
            let indexRegistro = registros.findIndex(registro => registro.concepto.conceptId === '58000006');
            registros[indexRegistro] = this.registro;
        }

        return registros;
    }


    calcularDiasEstada() {
        const fecha = this.registro.valor.InformeEgreso.fechaEgreso;
        if (this.cama) {
            let fechaUltimoEstado = moment(this.cama.fecha, 'DD-MM-YYYY HH:mm').toDate();
            if (fecha < fechaUltimoEstado) {
                this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a ' + fechaUltimoEstado);
                this.registro.valor.InformeEgreso['diasDeEstada'] = null;
                return;
            }
        }
        /*  Si la fecha de egreso es el mismo día del ingreso -> debe mostrar 1 día de estada
            Si la fecha de egreso es al otro día del ingreso, no importa la hora -> debe mostrar 1 día de estada
            Si la fecha de egreso es posterior a los dos casos anteriores -> debe mostrar la diferencia de días */
        let dateDif = moment(fecha).endOf('day').diff(moment(this.informeIngreso.fechaIngreso).startOf('day'), 'days');
        let diasEstada = dateDif === 0 ? 1 : dateDif;
        this.registro.valor.InformeEgreso['diasDeEstada'] = diasEstada;
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
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

    codigoCIE10(event) {
        if (event && event.query) {
            let query = {
                nombre: event.query
            };
            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => { dato.nombre = '(' + dato.codigo + ') ' + dato.nombre; });
                event.callback(datos);
            });

        } else {
            let callback = [];
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
        let regexCIECausasExternas = new RegExp('^S|^T');
        let regexCIEProcedimientosObstetricos = new RegExp('^O8[0-4].[0-9]|O60.1|O60.2');
        let regexCIEProcedimientosObstetricosNoReq = new RegExp('^O0[0-6].[0-9]');

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.existeCausaExterna = regexCIECausasExternas.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagCausaExterna = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIECausasExternas.test(d.codigo));
            if (diagCausaExterna && diagCausaExterna.length > 0) {
                this.existeCausaExterna = true;
            }
        }

        if (this.registro.valor.InformeEgreso.diagnosticoPrincipal) {
            this.procedimientosObstetricos = regexCIEProcedimientosObstetricos.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
            this.procedimientosObstetricosNoReq = regexCIEProcedimientosObstetricosNoReq.test(this.registro.valor.InformeEgreso.diagnosticoPrincipal.codigo);
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagObstetitricos = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricosNoReq.test(d.codigo));
            if (diagObstetitricos && diagObstetitricos.length > 0) {
                this.procedimientosObstetricosNoReq = true;
            }
        }

        if (this.registro.valor.InformeEgreso.otrosDiagnosticos) {
            let diagObstetitricosReq = this.registro.valor.InformeEgreso.otrosDiagnosticos.filter(d => regexCIEProcedimientosObstetricos.test(d.codigo));
            if (diagObstetitricosReq && diagObstetitricosReq.length > 0) {
                this.procedimientosObstetricos = true;
            }
        }
    }

    searchComoSeProdujo(event) {
        let desde = 'V00';
        let hasta = 'Y98';
        let filtro;

        if (this.registro.valor.InformeEgreso.causaExterna.producidaPor) {

            switch (this.registro.valor.InformeEgreso.causaExterna.producidaPor.id) {
                case 'Accidente':
                    filtro = [{ desde: 'V01', hasta: 'X59' }, { desde: 'Y35', hasta: 'Y98' }];
                    break;
                case 'lesionAutoinfligida':
                    filtro = [{ desde: 'X60', hasta: 'X84' }];
                    break;
                case 'agresion':
                    filtro = [{ desde: 'X85', hasta: 'Y09' }];
                    break;
                case 'seIgnora': {
                    filtro = [{ desde: 'Y10', hasta: 'Y34' }];
                    break;
                }
            }
        }
        if (event && event.query) {
            let query = {
                nombre: event.query,
                filtroRango: JSON.stringify(filtro)
            };
            this.cie10Service.get(query).subscribe((datos) => {
                // mapeamos para mostrar el codigo primero y luego la descripcion
                datos.map(dato => { dato.nombre = '(' + dato.codigo + ') ' + dato.nombre; });
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
        let nuevoNacimiento = Object.assign({}, {
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
            let query = {
                nombre: event.query

            };
            this.procedimientosQuirurgicosService.get(query).subscribe((rta) => {
                rta.map(dato => { dato.nom = '(' + dato.codigo + ') ' + dato.nombre; });
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

}
