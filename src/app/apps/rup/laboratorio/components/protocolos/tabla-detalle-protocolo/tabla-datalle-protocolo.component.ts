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

    @Input('practicasEjecucion')
    set pjs(practicasEjecucion) {
        this.practicasEjecucion = practicasEjecucion;
        // if (this.modo === 'carga' || this.modo === 'validacion') {
            this.cargarListaPracticaCarga().then(() => {
                // if (this.modo === 'validacion') {
                    this.cargarResultadosAnteriores();
                // }
            });
        // } else {
            this.cargarPracticasVista();
            // if (this.modo === 'control') {
                // this.cargarResultadosAnterioresPV();
            // }
        // }
    }

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
     * Carga array de practicas para recepcion y auditoria. Filtra por areas si es que existe alguna seleccionada
     *
     * @memberof TablaDatalleProtocolo
     */
    cargarPracticasVista() {
        let practicasSolicitud = this.modelo.solicitud.registros[0].valor.solicitudPrestacion.practicas;
        this.practicasVista = this.practicasEjecucion
            .filter(pe => practicasSolicitud.some(ps => ps._id === pe._id))
            .filter(p => ((this.busqueda.areas.length === 0) || this.busqueda.areas.some(id => id === p.area._id))
            );
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
            let ids = this.practicasEjecucion.map((reg) => { return reg._id; });

            this.servicioPractica.findByIdsCompletas(ids).subscribe((res) => {
                let cargarPracticas = (registos, practicas) => {
                    if (registos.length > 0) {
                        for (const reg of registos) {

                            if (!idsFiltrados || this.busqueda.practicas === 0 || idsFiltrados.some(e => e._id === reg._id)) {
                                let match: any = practicas.filter((practica: any) => {
                                    return practica._id === reg._id;
                                })[0];

                                let matchArea = !this.busqueda.areas || (this.busqueda.areas.length === 0) || this.busqueda.areas.some(id => id === match.area.id);

                                if (matchArea) {
                                    let margen = [];
                                    for (let i = 0; i < reg.valor.nivel; i++) {
                                        margen.push({});
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
        this.practicasCarga.forEach((practicaCarga) => {
            this.servicioProtocolo.getResultadosAnteriores(this.modelo.paciente.id, practicaCarga.registro.concepto.conceptId).subscribe(resultadosAnteriores => {
                practicaCarga.practica.resultado.resultadosAnteriores = resultadosAnteriores;
            });
        });
    }

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
     * @memberof TablaDatalleProtocolo
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
    validarTodas($event, practicas) {
        practicas.forEach(practica => {
            if (practica.valor) {
                practica.valor.resultado.validado = $event.value;
                if ($event) {
                    this.actualizarEstadoPractica(practica.valor, 'validar');
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
     * @memberof TablaDatalleProtocoloComponent
     */
    busquedaInicial() {
        this.practicas = null;
    }
    /**
     *
     *
     * @memberof TablaDatalleProtocoloComponent
     */
    searchClear() {
        this.practicas = null;
    }
    /**
     *
     *
     * @param {PracticaBuscarResultado} resultado
     * @memberof TablaDatalleProtocoloComponent
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
     * @param {any} objetoPractica
     * @returns
     * @memberof TablaDatalleProtocoloComponent
     */
    esValorCritico(objetoPractica) {
        // let resultado = objetoPractica.practica.valor.resultado;
        // if (resultado && !objetoPractica.esCompuesta) {
        //     let valoresReferencia = objetoPractica.formatoResultado.valoresReferencia;
        //     return (valoresReferencia.valorMinimo > resultado.valor || valoresReferencia.valorMaximo < resultado.valor);
        // }
        return false;
    }

    generateRegistroEjecucion(practica) {
        let practicaEjecucion: any = {
            _id: practica.id,
            codigo: practica.codigo,
            destacado: false,
            esSolicitud: false,
            esDiagnosticoPrincipal: false,
            relacionadoCon: practica.requeridos.map((req) => { return req._id; }),
            nombre: practica.nombre,
            concepto: practica.concepto,
            valor: {
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
    actualizarEstadoPractica(valor, tipo) {
        let estado = {
            tipo: tipo,
            usuario: this.auth.usuario,
            fecha: new Date(),
            pendienteGuardar: true
        };

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
