import { Auth } from '@andes/auth';
import { ProtocoloService } from './../../../services/protocolo.service';
import { IPractica } from '../../../interfaces/practica/IPractica';
import { IPracticaBuscarResultado } from '../../../interfaces/practica/IPracticaBuscarResultado.inteface';
import { PracticaService } from '../../../services/practica.service';
import { Input, Component, OnInit } from '@angular/core';

import { Plex } from '@andes/plex';
import { Constantes } from '../../../controllers/constants';


@Component({
    selector: 'tabla-datalle-protocolo',
    templateUrl: 'tabla-datalle-protocolo.html'
})

export class TablaDatalleProtocolo implements OnInit {
    ngOnInit() {

    }

    @Input() modo: any;
    @Input() modelo: any;
    @Input() solicitudProtocolo: any;
    
    practicasCarga = [];
    practicasVista = [];
    
    practicasEjecucion = [];    
    @Input('practicasEjecucion')
    set pjs(practicasEjecucion) {
        this.practicasEjecucion = practicasEjecucion;
        // if (this.modo === 'validacion' || this.modo === 'carga') {
            this.cargarListaPracticaCarga();
            if (this.modo === 'validacion') {
                this.cargarResultadosAnteriores();
            }
        // }
    }



    @Input() areas: any;
    @Input() editarListaPracticas;
    practicas;
    practicaSeleccionada = null;

    constructor(
        private servicioPractica: PracticaService,
        private servicioProtocolo: ProtocoloService,
        public plex: Plex,
        public auth: Auth
    ) { }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    async cargarListaPracticaCarga() {
        this.practicasCarga = [];
        let cargarPracticas = (registos, nivelTab) => {
            return new Promise((resolve) => {
                if (registos.length > 0) {
                    let ids = [];
                    registos.forEach((reg1) => { ids.push(reg1._id); });
                    this.servicioPractica.findByIds(ids).subscribe(async (practicas) => {
                        for (const reg2 of registos) {
                            let match: any = practicas.filter((practica: any) => {
                                return practica._id === reg2._id;
                            })[0];

                            let margen = [];
                            for (let i = 0; i < nivelTab; i++) {
                                margen.push({});
                            }
                            if ((this.areas.length === 0) || this.areas.some(id => id === match.area.id)) {
                                this.practicasCarga.push({
                                    registro: reg2,
                                    practica: match,
                                    margen: margen
                                });
                            }
                            await cargarPracticas(reg2.registros, nivelTab + 1);
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        };
        await cargarPracticas(this.practicasEjecucion, 0);
    }


    /**
     * Setea al resultado de cada práctica un array con la lista de resultados anteriores registrados para el paciente de la práctica
     *
     * @memberof ProtocoloDetalleComponent
     */
    cargarResultadosAnteriores() {
        this.practicasEjecucion.forEach((practica) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practica.concepto.conceptId).subscribe(resultadosAnteriores => {
                practica.resultado.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

    /**
     *
     *
     * @memberof ProtocoloDetalleComponent
     */
    async cargarConfiguracionesResultado() {
        let ids = [];
        this.practicasCarga.map((reg) => { ids.push(reg.practica.id); });
        await this.servicioPractica.findByIds(ids).subscribe(
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
 * @memberof ProtocoloDetalleComponent
 */
    validarResultados() {
        this.practicasCarga.forEach((objetoPractica) => {
            let resultado = objetoPractica.practica.valor.resultado;
            let alertasValReferencia = [];
            let alertasValCriticos = [];
            if (resultado && !objetoPractica.esCompuesta) {
                let valoresReferencia = objetoPractica.formatoResultado.valoresReferencia;
                if (objetoPractica.valoresCriticos.minimo > resultado.valor || objetoPractica.valoresCriticos < resultado.valor) {
                    alertasValCriticos.push({
                        nombre: objetoPractica.practica.nombre,
                        resultado: resultado
                    });
                } else if (valoresReferencia.valorMinimo > resultado.valor || valoresReferencia.valorMaximo < resultado.valor) {
                    alertasValCriticos.push({
                        nombre: objetoPractica.practica.nombre,
                        resultado: resultado
                    });
                }
            }
        });
    }

    /**
     * Retorna true si el último estado registrado es de validada, false si no.
     *
     * @returns
     * @memberof ProtocoloDetalleComponent
     */
    isProtocoloValidado() {
        return this.modelo.estados[this.modelo.estados.length - 1].tipo === 'validada';
    }

    /**
     * Elimina una práctica seleccionada tanto de la solicitud como de la ejecución
     *
     * @param {IPractica} practica
     * @memberof ProtocoloDetalleComponent
     */
    eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.solicitudProtocolo.solicitudPrestacion.practicas;
        practicasSolicitud.splice(practicasSolicitud.findIndex(x => x.id === practica.id), 1);
        this.practicasEjecucion.splice(this.practicasEjecucion.findIndex(x => x.id === practica.id), 1);
    }

    /**
     * Marca los resultados de todas las prácticas como validados
     *
     * @param {any} event
     * @memberof ProtocoloDetalleComponent
     */
    validarTodas($event, practicas) {
        practicas.forEach(practica => {
            if (practica.valor) {
                practica.valor.resultado.validado = $event.value;
                if ($event) {
                    this.actualizarEstadoPractica(practica.valor,'validar')
                }
            }
            // } else {
            this.validarTodas($event, practica.registros);
            // }
        });
    }

    /**
     * Agrega estado validado al protocolo en caso que todos los resultados del mismo se encuentren marcados como validados.
     *
     * @memberof ProtocoloDetalleComponent
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
     * @memberof TablaDatalleProtocolo
     */
    busquedaInicial() {
        this.practicas = null;
    }
    /**
     *
     *
     * @memberof TablaDatalleProtocolo
     */
    searchClear() {
        this.practicas = null;
    }
    /**
     *
     *
     * @param {PracticaBuscarResultado} resultado
     * @memberof TablaDatalleProtocolo
     */
    busquedaFinal(resultado: IPracticaBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.practicas = resultado.practicas;
        }
    }
    /**
     *
     *
     * @param {any} $event
     * @memberof TablaDatalleProtocolo
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
     * @memberof TablaDatalleProtocolo
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
     * @param {any} objetoPractica
     * @returns
     * @memberof TablaDatalleProtocolo
     */
    esValorCritico(objetoPractica) {
        // let resultado = objetoPractica.practica.valor.resultado;
        // if (resultado && !objetoPractica.esCompuesta) {
        //     let valoresReferencia = objetoPractica.formatoResultado.valoresReferencia;
        //     return (valoresReferencia.valorMinimo > resultado.valor || valoresReferencia.valorMaximo < resultado.valor);
        // }
        return false;
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
        if (practica) {
            let existe = this.solicitudProtocolo.solicitudPrestacion.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

            if (existe === -1) {
                this.solicitudProtocolo.solicitudPrestacion.practicas.push(practica);
                let practicaEjecucion: any = {
                    _id: practica.id,
                    codigo: practica.codigo,
                    destacado: false,
                    esSolicitud: false,
                    esDiagnosticoPrincipal: false,
                    relacionadoCon: [],
                    nombre: practica.nombre,
                    concepto: practica.concepto,
                    // registros: []
                };

                // if (practica.categoria !== 'compuesta') {
                practicaEjecucion.valor = {
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
                };
                // }
                practicaEjecucion.registros = await this.getPracticasRequeridas(practica);
                this.practicasEjecucion.push(practicaEjecucion);
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
            }
        }
        this.practicaSeleccionada = null;
    }

    actualizarEstadoPractica(valor, tipo) {
        let estado = {
            tipo: tipo,
            usuario: this.auth.usuario,
            fecha: new Date(),
            pendienteGuardar: true
        }

        if (!valor.estados) {
            valor.estados = [];
        }
        
        if (valor.estados.length === 0 || !valor.estados[valor.estados.length - 1].pendienteGuardar) {
            valor.estados.push(estado);
        } else {
            valor.estados[valor.estados.length - 1] = estado;
        }
    }

    /**
    * Carga practicas requeridas en practica de ejecucion
    *
    * @memberof ProtocoloDetalleComponent
    */
    async getPracticasRequeridas(practica) {
        return new Promise(async (resolve) => {
            if (practica.categoria === 'compuesta' && practica.requeridos) {
                let ids = [];
                practica.requeridos.map((id) => { ids.push(id._id); });
                // await this.servicioPractica.findByIds({ ids: ids }).subscribe((resultados) => {
                await this.servicioPractica.findByIds(ids).subscribe((resultados) => {
                    resultados.forEach(async (resultado: any) => {
                        resultado.valor = {
                            resultado: {
                                valor: null,
                                sinMuestra: false,
                                validado: false
                            }
                        };
                        // resultado.registros.map( (registro) => {
                        //     registro.valor = {
                        //         valor: null,
                        //         sinMuestra: false,
                        //         validado: false
                        //     };
                        // });

                        // });

                        // requeridas.push({
                        //     valor: {
                        //         valor: null,
                        //         sinMuestra: false,
                        //         validado: false
                        //     },
                        //     concepto: resultado.concepto,
                        //     nombre: resultado.nombre,
                        //     requeridos: resultado.requeridos
                        // });
                        resultado.registros = await this.getPracticasRequeridas(resultado);
                    });
                    resolve(resultados);
                });
            } else {
                resolve([]);
            }
        });
    }
}
