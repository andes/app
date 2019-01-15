import { ProfesionalService } from './../../../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { ProtocoloService } from './../../../services/protocolo.service';
import { IPractica } from '../../../interfaces/practica/IPractica';
import { PracticaService } from '../../../services/practica.service';
import { Input, Component, OnInit } from '@angular/core';
import { getRespuestasGestionValoresCriticos } from '../../../../../../utils/enumerados';

import { Plex } from '@andes/plex';
import { Constantes } from '../../../controllers/constants';


@Component({
    selector: 'tabla-datalle-protocolo',
    templateUrl: 'tabla-datalle-protocolo.html'
})

export class TablaDatalleProtocoloComponent implements OnInit {
    ngOnInit() {

    }

    @Input() modo: any;
    @Input() modelo: any;
    @Input() solicitudProtocolo: any;
    @Input() busqueda: any;
    practicasCarga = [];
    practicasVista = [];
    practicasEjecucion = [];
    alertasValReferencia = [];
    // alertasValCriticos = [];
    @Input() alertasValidadas = [];
    @Input() showGestorAlarmas: Boolean;
    showSelectProfesional: Boolean;
    flagMarcarTodas: Boolean = false;

    avisoValoresCriticos: any;

    validaciones;
    @Input('validaciones')
    set setVs(value) {
        this.validaciones = value;
    }


    @Input('practicasEjecucion')
    set pjs(practicasEjecucion) {
        this.practicasEjecucion = practicasEjecucion;
        this.cargarListaPracticaCarga().then(() => {
            this.cargarResultadosAnteriores();
            if (this.modo === 'validacion') {
                this.precargarValidaciones();
            }
        });
        this.cargarPracticasVista();
    }

    @Input() editarListaPracticas;
    practicas;
    practicaSeleccionada = null;

    constructor(
        private servicioPractica: PracticaService,
        private servicioProtocolo: ProtocoloService,
        private servicioProfesional: ProfesionalService,
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
        this.practicasCarga.forEach((e) => {
            this.validaciones.push({
                registroPractica: e,
                validado: false,
                esValorCritico: this.verificarValorCritico(e)
            });
        });
    }

    /**
     * Carga array de practicas para recepcion y auditoria. Filtra por areas si es que existe alguna seleccionada
     *
     * @memberof TablaDatalleProtocolo
     */
    cargarPracticasVista() {
        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        this.practicasVista = this.practicasEjecucion
            .filter(pe => practicasSolicitud.some(ps => ps._id === pe._id))
            .filter(p => ((this.busqueda.areas.length === 0) || this.busqueda.areas.some(id => id === p.area._id)));
    }

    /**
     *
     *
     * @returns
     * @memberof TablaDatalleProtocolo
     */
    cargarListaPracticaCarga() {
        return new Promise((resolve) => {
            this.practicasCarga = [];
            let idsFiltrados = this.busqueda.practicas ? this.getIdsFiltrados(this.busqueda.practicas) : null;
            let ids = this.practicasEjecucion.map((reg) => { return reg.valor.idPractica; });

            this.servicioPractica.findByIdsCompletas(ids).subscribe((res) => {
                let cargarPracticas = (registos, practicas) => {
                    if (registos.length > 0) {
                        for (const reg of registos) {

                            if (!idsFiltrados || this.busqueda.practicas === 0 || idsFiltrados.some(e => e._id === reg._id)) {
                                let match: any = practicas.filter((practica: any) => {
                                    return practica._id === reg.valor.idPractica;
                                })[0];

                                let matchArea = !this.busqueda.areas || (this.busqueda.areas.length === 0) || this.busqueda.areas.some(id => id === match.area.id);

                                if (matchArea) {
                                    let margen = [];
                                    for (let i = 0; i < reg.valor.nivel; i++) {
                                        margen = margen.concat([{}, {}, {}]);
                                    }
                                    this.practicasCarga.push({
                                        registro: reg,
                                        practica: match,
                                        margen: margen
                                    });
                                }
                            }
                        }
                    }
                };
                cargarPracticas(this.practicasEjecucion, res);
                resolve();
            });
        });
    }

    /**
     *
     *
     * @memberof TablaDatalleProtocoloComponent
     */
    generarAlertasResultados() {
        this.practicasCarga.forEach(e => this.verificarValorResultado(e));
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
                return idsFiltro.some(id => id === p._id);
            });
            filtradas.forEach(pf => foo(pf.relacionadoCon));
            practicasFiltradas = practicasFiltradas.concat(filtradas);
        };
        foo(ids);
        return practicasFiltradas;
    }


    /**
     * Setea al resultado de cada práctica un array con la lista de resultados anteriores registrados para el paciente de la práctica
     *
     * @memberof TablaDatalleProtocolo
     */
    cargarResultadosAnteriores() {
        let conceptIds = [];
        this.practicasCarga.forEach( e => conceptIds.push(e.registro.concepto.conceptId) );
        this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, conceptIds).subscribe(resultadosAnteriores => {
            this.practicasCarga.forEach( e => {
                let match: any = resultadosAnteriores.filter((res: any) => {
                    return res.conceptIdPractica === e.registro.concepto.conceptId;
                })[0];
                if (match) {
                    e.practica.resultadosAnteriores = match;
                }
            });
        });
    }

    /**
     *
     *
     * @memberof TablaDatalleProtocoloComponent
     */
    cargarResultadosAnterioresPV() {
        this.practicasVista.forEach((practicaVista) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practicaVista.concepto.conceptId).subscribe(resultadosAnteriores => {
                practicaVista.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

    /**
     *
     *
     * @memberof TablaDatalleProtocolo
     */
    async cargarConfiguracionesResultado() {
        let ids = this.practicasCarga.map((reg) => { return reg.practica.id._id; });
        await this.servicioPractica.findByIds({ ids: ids }).subscribe(
            (resultados) => {
                this.practicasCarga.map((reg) => {
                    for (let resultado of resultados) {
                        let practica: any = resultado;

                        if (resultado.id === reg.practica._id) {
                            reg.formatoResultado = practica.resultado.formato;
                            reg.formatoResultado.unidadMedida = practica.unidadMedida;
                            reg.formatoResultado.valoresReferencia = practica.presentaciones[0].valoresReferencia[0];
                            reg.valoresCriticos = practica.valoresCriticos;
                            break;
                        }
                    }
                });
            });
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
     * Elimina una práctica seleccionada tanto de la solicitud como de la ejecución
     *
     * @param {IPractica} practica
     * @memberof TablaDatalleProtocolo
     */
    async eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.solicitudProtocolo.solicitudPrestacion.practicas;
        this.practicasVista.splice(this.practicasVista.findIndex(x => x.id === practica.id), 1);
        let practicaIndex = practicasSolicitud.findIndex(x => x.id === practica.id);

        this.servicioPractica.findByIdsCompletas(practica._id).subscribe((practicasEliminiar) => {
            this.modelo.ejecucion.registros = this.practicasEjecucion.filter(pe =>
                !(practicasEliminiar.some((r: any) => r._id === pe._id))
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
        this.validaciones.forEach( e => e.validado = $event.value);
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
                idPractica: practica.id,
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
                }]
            }
        };
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
            let existe = this.solicitudProtocolo.solicitudPrestacion.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

            if (existe === -1) {
                this.solicitudProtocolo.solicitudPrestacion.practicas.push(practica);
                let practicaEjecucion = this.generateRegistroEjecucion(practica);
                this.practicasVista.push(practicaEjecucion);

                this.servicioPractica.findByIdsCompletas(practica._id).subscribe((resultados) => {
                    resultados.forEach(res => {
                        this.practicasEjecucion.push(this.generateRegistroEjecucion(res));
                    });
                    this.cargarListaPracticaCarga().then(() => {
                        if (this.modo === 'validacion') {
                            this.cargarResultadosAnteriores();
                        }
                    });
                });
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
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
    actualizarEstadoPractica($event, objetoPractica, tipo) {
        let estado = {
            tipo: tipo,
            usuario: this.auth.usuario,
            fecha: new Date(),
            pendienteGuardar: true
        };

        let valor = objetoPractica.registro.valor;

        if (!valor.estados) {
            valor.estados = [];
        }

        if (valor.estados.length === 0 || !valor.estados[valor.estados.length - 1].pendienteGuardar) {
            valor.estados.push(estado);
        } else {
            valor.estados[valor.estados.length - 1] = estado;
        }

        if ($event.value) {
            this.validaciones.find(e => e.registroPractica.registro._id === objetoPractica.registro._id).esValorCritico = this.verificarValorCritico(objetoPractica);
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
            // this.alertasValCriticos = this.alertasValCriticos.filter(e => e.id !== objetoPractica.registro._id);

            if (this.verificarValorCritico(objetoPractica)) {
                // this.alertasValCriticos.push(alerta);
            } else {
                if (this.verificarValorReferencia(objetoPractica)) {
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
    verificarValorCritico(objetoPractica) {
        const resultado = objetoPractica.registro.valor.resultado;
        if (resultado.valor && objetoPractica.practica.valoresCriticos) {
            return objetoPractica.practica.valoresCriticos.minimo > resultado.valor || objetoPractica.practica.valoresCriticos.maximo < resultado.valor;
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
    verificarValorReferencia(objetoPractica) {
        const resultado = objetoPractica.registro.valor.resultado;
        if (resultado.valor) {
            const valoresReferencia = objetoPractica.practica.presentaciones[0].valoresReferencia[0];
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
        return this.validaciones.filter( e => e.esValorCritico && e.validado);
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
    * Carga practicas requeridas en practica de ejecucion
    *
    * @memberof TablaDatalleProtocolo
    */
    // async getPracticasRequeridas(practica) {
    //     return new Promise(async (resolve) => {
    //         if (practica.categoria === 'compuesta' && practica.requeridos) {
    //             let ids = practica.requeridos.map((id) => { return id._id; });
    //             await this.servicioPractica.findByIds(ids).subscribe((resultados) => {
    //                 resultados.forEach(async (resultado: any) => {
    //                     resultado.valor = {
    //                         resultado: {
    //                             valor: null,
    //                             sinMuestra: false,
    //                             validado: false
    //                         }
    //                     };
    //                     // resultado.registros.map( (registro) => {
    //                     //     registro.valor = {
    //                     //         valor: null,
    //                     //         sinMuestra: false,
    //                     //         validado: false
    //                     //     };
    //                     // });

    //                     // });

    //                     // requeridas.push({
    //                     //     valor: {
    //                     //         valor: null,
    //                     //         sinMuestra: false,
    //                     //         validado: false
    //                     //     },
    //                     //     concepto: resultado.concepto,
    //                     //     nombre: resultado.nombre,
    //                     //     requeridos: resultado.requeridos
    //                     // });
    //                     resultado.registros = await this.getPracticasRequeridas(resultado);

    //                 });
    //                 resolve(resultados);
    //             });
    //         } else {
    //             resolve([]);
    //         }
    //     });
    // }
}
