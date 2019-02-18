import { Constantes } from './../../../controllers/constants';
import { LaboratorioContextoCacheService } from './../../../services/protocoloCache.service';
import { ProfesionalService } from './../../../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ProtocoloService } from './../../../services/protocolo.service';
import { IPractica } from '../../../interfaces/practica/IPractica';
import { PracticaService } from '../../../services/practica.service';
import { Input, Component, OnInit, EventEmitter, Output } from '@angular/core';
import { getRespuestasGestionValoresCriticos } from '../../../../../../utils/enumerados';
import { Plex } from '@andes/plex';

@Component({
    selector: 'tabla-datalle-protocolo',
    templateUrl: 'tabla-datalle-protocolo.html'
})

export class TablaDatalleProtocoloComponent implements OnInit {

    ngOnInit() {
        // practicasCargadas.- array de registros cuyos estados se tienen que pasar a actualizados antes de guardar
        this.cache = this.laboratorioContextoCacheService.getContextoCache();
        this.cache.practicasCargadas = [];
    }

    @Output() verHistorialResultadosEmitter: EventEmitter<any> = new EventEmitter<any>();
    // @Input() modo: any;
    modo: any;
    @Input('modo')
    set mm(m) {
        this.modo = m;
    }

    @Input() modelo: any;
    @Input() solicitudProtocolo: any;
    @Input() busqueda: any;
    @Input() alertasValidadas = [];
    @Input() showGestorAlarmas: Boolean;
    // practicasCarga = [];
    practicasVista = [];
    practicasEjecucion = [];
    alertasValReferencia = [];
    showSelectProfesional: Boolean;
    flagMarcarTodas: Boolean = false;
    avisoValoresCriticos: any;
    cache;

    validaciones;
    @Input('validaciones')
    set setVs(value) {
        this.validaciones = value;
    }

    protocolos;
    @Input('protocolos')
    set setprotocolos(value) {
        if (this.laboratorioContextoCacheService.getContextoCache().cargarPorPracticas) {
            this.protocolos = value;
            this.cargarListaPracticaCargaModoAnalisis();
        }
    }

    @Input('practicasEjecucion')
    set pjs(practicasEjecucion) {
        if (!this.laboratorioContextoCacheService.getContextoCache().cargarPorPracticas) {
            this.practicasEjecucion = practicasEjecucion;
            // this.cargarListaPracticaCarga().then(() => {
                // this.cargarResultadosAnteriores();
                if (this.laboratorioContextoCacheService.isModoValidacion()) {
                    this.precargarValidaciones();
                }
            // });
            this.cargarPracticasVista();
        }
    }

    @Input() editarListaPracticas;
    practicas;
    practicaSeleccionada = null;

    constructor(
        private servicioPractica: PracticaService,
        private servicioProtocolo: ProtocoloService,
        private servicioProfesional: ProfesionalService,
        private laboratorioContextoCacheService: LaboratorioContextoCacheService,
        public plex: Plex,
        public auth: Auth
    ) { }

    /**
     *
     *
     * @private
     * @memberof TablaDatalleProtocoloComponent
     */
    precargarValidaciones() {
        this.validaciones.length = 0;
        this.modelo.solicitud.registros[0].valor.solicitudPrestacion.avisoValoresCriticos = {};
        this.avisoValoresCriticos = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.avisoValoresCriticos;
        this.practicasEjecucion.forEach((e) => {
            this.validaciones.push({
                registroPractica: e,
                validado: false,
                esValorCritico: this.verificarValorCritico(e.valor)
            });
        });
    }

    /**
     * Carga array de practicas para recepcion y auditoria. Filtra por areas si es que existe alguna seleccionada
     *
     * @memberof TablaDatalleProtocolo
     */
    cargarPracticasVista() {
        const practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        this.practicasVista = this.practicasEjecucion
            .filter(pe => practicasSolicitud.some(ps => ps._id === pe.valor.idPractica))
            .filter(p => ((this.busqueda.areas.length === 0) || this.busqueda.areas.some(id => id === p.area._id)));
    }

    /**
     *
     *
     * @returns.
     * @memberof TablaDatalleProtocolo
     */
    cargarListaPracticaCargaModoAnalisis() {
        return new Promise((resolve) => {
            this.servicioPractica.findByIdsCompletas(this.busqueda.practicas[0]).subscribe((res: [any]) => {
                this.cache.modo.titulo += ' | ' + res[0].nombre;
            });
            resolve();
        });
    }

    /**
     *
     *
     * @param {*} ids
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    getIdsFiltrados(ids) {
        let practicasFiltradas = [];
        const foo = (idsFiltro) => {
            this.practicasEjecucion.forEach((p) => {
                idsFiltro.forEach((id) => idsFiltro);
            });
            let filtradas = this.practicasEjecucion.filter((p) => {
                return idsFiltro.some(id => id === p.valor.idPractica);
            });
            filtradas.forEach(pf => foo(pf.relacionadoCon));
            practicasFiltradas = practicasFiltradas.concat(filtradas);
        };
        foo(ids);
        return practicasFiltradas;
    }

    /**
     *
     *
     * @memberof TablaDatalleProtocoloComponent
     */
    esValorReferencia(id) {
        return this.alertasValReferencia.some(a => a.registro.id === id);
    }

    /**
     * Retorna true si el último estado registrado es de valireturndada, false si no.
     *
     * @returns
     * @memberof TablaDatalleProtocolo
     */
    isProtocoloValidado() {
        return this.modelo.estados[this.modelo.estados.length - 1].tipo === 'validada';
    }

    /**
     * Retorna true si el último estado registrado es de valireturndada, false si no.
     *
     * @return
     * @memberof TablaDatalleProtocolo
     */
    isResultadoValidado(reg) {
        return reg.valor.estados[reg.valor.estados - 1] && reg.valor.estados[reg.valor.estados - 1].tipo === 'validada';
    }

    /**
     * Elimina una práctica seleccionada tanto de la solicitud como de la ejecución
     *
     * @param {IPractica} practica
     * @memberof TablaDatalleProtocolo
     */
    async eliminarPractica(practicaId) {
        let practicasSolicitud = this.solicitudProtocolo.solicitudPrestacion.practicas;
        this.practicasVista.splice(this.practicasVista.findIndex(x => x.valor.idPractica === practicaId), 1);
        let practicaIndex = practicasSolicitud.findIndex(x => x.id === practicaId);

        this.servicioPractica.findByIdsCompletas(practicaId).subscribe((practicasEliminiar) => {
            this.modelo.ejecucion.registros = this.practicasEjecucion.filter(pe =>
                !(practicasEliminiar.some((r: any) => r._id === pe.valor.idPractica))
            );
        });

        practicasSolicitud.splice(practicaIndex, 1);
    }

    /**
     * Marca los resultados de todas las prácticas como validados
     *
     * @param {any} event
     * @memberof TablaDatalleProtocolo
     */
    validarTodas($event) {
        this.validaciones.forEach(e => e.validado = $event.value);
    }

    /**
     * Agrega estado validado al protocolo en caso que todos los resultados del mismo se encuentren marcados como validados.
     *
     * @memberof TablaDatalleProtocolo
     */
    actualizarEstadoValidacion() {
        let protocoloValidado = this.practicasEjecucion.every((practica) => {
            return practica.resultado.validado;
        });

        if (protocoloValidado) {
            this.modelo.estados.push(Constantes.estadoValidada);
        }
    }

    /**
     *
     *
     * @param {any} $event
     * @memberof TablaDatalleProtocoloComponent
     */
    loadPracticasPorNombre($event) {
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query
            }).subscribe((resultado: any) => {
                $event.callback(resultado);
            });
        } else {
            $event.callback([]);
        }
    }

    /**
     *
     *
     * @param {any} value
     * @memberof TablaDatalleProtocoloComponent
     */
    getPracticaPorCodigo(value) {
        if (this.practicaSeleccionada !== '') {
            this.servicioPractica.getMatchCodigo(this.practicaSeleccionada).subscribe((resultado: any) => {
                if (resultado) {
                    this.seleccionarPractica(resultado);
                }
            });
        }
    }

    /**
     *
     *
     * @param {*} practica
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    generateRegistroEjecucion(practica) {
        let practicaEjecucion: any = {
            codigo: practica.codigo,
            destacado: false,
            esSolicitud: false,
            esDiagnosticoPrincipal: false,
            relacionadoCon: practica.requeridos.map((req) => { return req._id; }),
            nombre: practica.nombre,
            concepto: practica.concepto,
            valor: {
                idPractica: practica._id,
                nivel: practica.nivel,
                resultado: {
                    valor: null,
                    sinMuestra: false,
                    validado: false
                },
                estados: [{
                    tipo: 'pendiente',
                    usuario: this.auth.usuario,
                    fecha: new Date()
                }],
                organizacionDestino: this.auth.organizacion,
                practica: practica
            }
        };
        console.log(practicaEjecucion);
        return practicaEjecucion;
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof TablaDatalleProtocolo
    */
    async seleccionarPractica(practica: IPractica) {
        if (practica) {
            let existe = this.solicitudProtocolo.solicitudPrestacion.practicas.findIndex(x => x.conceptId === practica.concepto.conceptId);

            if (existe === -1) {
                this.solicitudProtocolo.solicitudPrestacion.practicas.push(practica);
                let practicaEjecucion = this.generateRegistroEjecucion(practica);
                this.practicasVista.push(practicaEjecucion);

                this.servicioPractica.findByIdsCompletas(practica._id).subscribe((resultados) => {
                    resultados.forEach(res => {
                        this.practicasEjecucion.push(this.generateRegistroEjecucion(res));
                    });
                });
            } else {
                this.plex.info('danger', 'Práctica ya ingresada');
            }
        }
        this.practicaSeleccionada = null;
    }

    /**
     *
     *
     * @param {*} valor
     * @param {*} tipo
     * @memberof TablaDatalleProtocolo
     */
    onValorResultadoChange($event, op) {
        if (!this.isResultadoValidado(op)) {
            if (!$event.value) {
                this.cache.practicasCargadas = this.cache.practicasCargadas.filter(e => e !== op);
            } else if (!this.cache.practicasCargadas.find(e => { return e === op; })) {
                this.cache.practicasCargadas.push(op);
                if (this.laboratorioContextoCacheService.isModoValidacion()) {
                    this.validaciones.find(e => e.registroPractica._id === op._id).esValorCritico = this.verificarValorCritico(op);
                }
            }
        }
    }

    /**
     * Genera alertas de practicas cuyos valores sobreparas valores de refencia o valores críticos
     *
     * @memberof TablaDatalleProtocoloComponent
     */
    verificarValorResultado(objetoPractica) {
        const resultado = objetoPractica.registro.valor.resultado;
        if (resultado && resultado.valor && objetoPractica.practica.categoria !== 'compuesta') {
            let alerta = {
                registro: objetoPractica.registro,
                practica: objetoPractica.practica,
                resultado: resultado
            };

            // TODO: Debe tomar valores de referencia según presentación actica y edad y sexo de paciente, NO el primero de todos por edefecto, como está actulamente-

            this.alertasValReferencia = this.alertasValReferencia.filter(e => e.id !== objetoPractica.registro._id);

            if (this.verificarValorCritico(objetoPractica.valor)) {
                // this.alertasValCriticos.push(alerta);
            } else {
                if (this.verificarValorReferencia(objetoPractica.valor)) {
                    this.alertasValReferencia.push(alerta);
                }
            }
        }
    }

    /**
     *
     *
     * @param {*} objetoPractica
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    verificarValorCritico(valorRegistro) {
        const resultado = valorRegistro.resultado;
        if (resultado.valor && valorRegistro.practica.valoresCriticos) {
            return valorRegistro.practica.valoresCriticos.minimo > resultado.valor || valorRegistro.practica.valoresCriticos.maximo < resultado.valor;
        } else {
            return false;
        }
    }

    /**
     *s
     *
     * @param {*} objetoPractica
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    verificarValorReferencia(valorRegistro) {
        const resultado = valorRegistro.resultado;
        if (resultado.valor) {
            const valoresReferencia = valorRegistro.practica.presentaciones[0].valoresReferencia[0];
            return valoresReferencia.valorMinimo > resultado.valor || valoresReferencia.valorMaximo < resultado.valor;
        } else {
            return false;
        }
    }

    /**
     * Busca y carga lista de profesionales
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    loadProfesionales($event) {
        let query = {
            nombreCompleto: $event.query
        };
        this.servicioProfesional.get(query).subscribe((resultado: any) => {
            $event.callback(resultado);
        });
    }

    /**
     * Busca y carga lista de profesionales
     *
     * @param {any} $event
     * @memberof ProtocoloDetalleComponent
     */
    getOpcionesRespuesta($event) {
        $event.callback(getRespuestasGestionValoresCriticos());
    }

    /**
 * Busca y carga lista de profesionales
 *
 * @param {any} $event
 * @memberof ProtocoloDetalleComponent
 */
    changeRespuestaGestionValoresCriticos($event) {
        const rtas = getRespuestasGestionValoresCriticos();
        if ($event.value) {
            this.showSelectProfesional = $event.value.id === rtas[0].id || $event.value.id === rtas[1].id || $event.value.id === rtas[2].id;
            if (!this.showSelectProfesional) {
                this.avisoValoresCriticos.profesionalReportado = null;
            }
        } else {
            this.showSelectProfesional = false;
            this.avisoValoresCriticos.profesionalReportado = null;
            this.avisoValoresCriticos.respuesta = null;
        }
    }

    /**
     *
     *
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    getValoresCriticosValidados() {
        return this.validaciones.filter(e => e.esValorCritico && e.validado);
    }


    /**
     * Destilda de checkbox 'marcar todas', cuando alguna práctica es desmarcada de la lista
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    clickValidar(event) {
        if (!event.value) {
            this.flagMarcarTodas = false;
        }
    }

    /**
     *
     *
     * @param {*} element
     * @memberof TablaDatalleProtocoloComponent
     */
    verHistorialResultados(element) {
        this.verHistorialResultadosEmitter.emit({paciente: this.modelo.paciente, practica:  element.valor.practica} );
    }

    getResultadoAnterior(practicaCarga) {
        return practicaCarga.valor.resultadoAnterior && practicaCarga.valor.resultadoAnterior[0] ?
            practicaCarga.valor.resultadoAnterior[0] : null;
    }
}
