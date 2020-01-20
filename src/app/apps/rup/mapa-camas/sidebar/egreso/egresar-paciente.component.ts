import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { Cie10Service } from '../../../../mitos';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { MapaCamasService } from '../../mapa-camas.service';
import { ProcedimientosQuirurgicosService } from '../../../../../services/procedimientosQuirurgicos.service';
import { modelRegistroInternacion, listaTipoEgreso, causaExterna, opcionesTipoParto, opcionesCondicionAlNacer, opcionesTerminacion, opcionesSexo } from '../../constantes-internacion';

@Component({
    selector: 'app-egresar-paciente',
    templateUrl: './egresar-paciente.component.html',
})

export class EgresarPacienteComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() capa: string;
    @Input() cama: any;
    @Input() camas: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // CONSTANTES
    public listaTipoEgreso = listaTipoEgreso;
    public causaExterna = causaExterna;
    public opcionesTipoParto = opcionesTipoParto;
    public opcionesCondicionAlNacer = opcionesCondicionAlNacer;
    public opcionesTerminacion = opcionesTerminacion;
    public opcionesSexo = opcionesSexo;

    // VARIABLES
    public ambito = 'internacion';
    public fechaValida = true;
    public esTraslado = false;
    public prestacion;
    public informeIngreso;
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


    constructor(
        public auth: Auth,
        public plex: Plex,
        public cie10Service: Cie10Service,
        private organizacionService: OrganizacionService,
        private servicioPrestacion: PrestacionesService,
        private prestacionesService: PrestacionesService,
        private mapaCamasService: MapaCamasService,
        public procedimientosQuirurgicosService: ProcedimientosQuirurgicosService,
    ) { }

    ngOnInit() {
        if (this.cama.idInternacion) {
            this.prestacionesService.getById(this.cama.idInternacion).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.informeIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso;
                this.calcularDiasEstada();
            });
        }

    }

    cancelar() {
        this.cancel.emit();
    }

    cambioFecha(fecha) {
        if (fecha > this.informeIngreso.fechaIngreso) {
            this.fechaValida = true;
            this.calcularDiasEstada();
            this.cambiarFecha.emit(fecha);
        } else {
            this.fechaValida = false;
            this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a  ' + moment(this.informeIngreso.fechaIngreso).format('DD-MM-YYYY HH:mm'));
            this.registro.valor.InformeEgreso['diasDeEstada'] = null;
        }
    }

    calcularDiasEstada() {
        if (this.cama) {
            let fechaUltimoEstado = moment(this.cama.fecha, 'DD-MM-YYYY HH:mm');
            if (this.fecha < fechaUltimoEstado) {
                this.plex.info('danger', 'ERROR: La fecha de egreso no puede ser inferior a ' + fechaUltimoEstado);
                this.registro.valor.InformeEgreso['diasDeEstada'] = null;
                return;
            }
        }
        /*  Si la fecha de egreso es el mismo día del ingreso -> debe mostrar 1 día de estada
            Si la fecha de egreso es al otro día del ingreso, no importa la hora -> debe mostrar 1 día de estada
            Si la fecha de egreso es posterior a los dos casos anteriores -> debe mostrar la diferencia de días */
        let dateDif = moment(this.fecha).endOf('day').diff(moment(this.informeIngreso.fechaIngreso).startOf('day'), 'days');
        let diasEstada = dateDif === 0 ? 1 : dateDif;
        this.registro.valor.InformeEgreso['diasDeEstada'] = diasEstada;
    }

    cambiarSeleccionCama() {
        this.cambiarCama.emit(this.cama);
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

    guardar(valid) {
        if (valid.formValid) {
            let registros = this.controlRegistrosGuardar();
            if (registros) {
                let params: any = {
                    op: 'registros',
                    registros: registros
                };
                this.servicioPrestacion.patch(this.prestacion.id, params).subscribe(prestacionEjecutada => {
                    // Se modifica el estado de la cama
                    this.cama.estado = 'disponible';
                    this.cama.idInternacion = null;
                    this.cama.paciente = null;

                    this.mapaCamasService.patchCama(this.cama, this.ambito, this.capa, this.fecha).subscribe(camaActualizada => {
                        this.plex.toast('success', 'Prestacion guardada correctamente', 'Prestacion guardada', 100);
                        this.refresh.emit({ cama: this.cama });
                    }, (err1) => {
                        this.plex.info('danger', err1, 'Error al intentar desocupar la cama');
                    });
                });
            }
        } else {
            this.plex.info('info', 'ERROR: Los datos de egreso no estan completos');
            return;
        }
    }

    controlRegistrosGuardar() {
        let registros = JSON.parse(JSON.stringify(this.prestacion.ejecucion.registros));
        this.registro.valor.InformeEgreso.fechaEgreso = this.fecha;
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
        let nuevoProcedimiento = Object.assign({}, {
            fecha: null
        });
        this.registro.valor.InformeEgreso.procedimientosQuirurgicos.push(nuevoProcedimiento);
    }

    removeProcedimiento(i) {
        if (i > 0) {
            this.registro.valor.InformeEgreso.procedimientosQuirurgicos.splice(i, 1);
        }
    }

}
