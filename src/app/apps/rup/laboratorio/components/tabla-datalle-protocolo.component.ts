import { Input, Output, Component, OnInit, HostBinding, NgModule, ViewContainerRef, ViewChild, EventEmitter } from '@angular/core';
import { PracticaService } from '../../../../services/laboratorio/practica.service';
import { IPractica } from '../../../../interfaces/laboratorio/IPractica';
import { ProtocoloService } from '../../../../services/laboratorio/protocolo.service';
import { Plex } from '@andes/plex';
import { Constantes } from '../controllers/constants';


@Component({
    selector: 'tabla-datalle-protocolo',
    templateUrl: 'tabla-datalle-protocolo.html',
    styleUrls: ['tabla-datalle-protocolo.scss']
})

export class TablaDatalleProtocolo implements OnInit {
    ngOnInit() {

    }

    practicasCarga = [];
    practicas;

    @Input() modo: any;
    @Input() modelo: any;
    @Input() solicitudProtocolo: any;

    practicasEjecucion: any;

    @Input('practicasEjecucion')
    set setPracticasEjecucion(value: any) {

        this.practicasEjecucion = value;
        if (this.modo.id === 'validacion' || this.modo.id === 'carga') {
            this.cargarListaPracticaCarga();
            if (this.modo.id === 'validacion') {
                this.cargarResultadosAnteriores();
            }
        }
    }
    constructor(
        private servicioPractica: PracticaService,
        private servicioProtocolo: ProtocoloService,
        public plex: Plex
    ) { }

    cargarListaPracticaCarga() {
        console.log('cargarListaPracticaCarga')
        let recorrerSubpracticas = async (reg, nivelTab) => {
            let margen = [];
            for (let i = 0; i < nivelTab; i++) {
                margen.push({});
            };
            let esCompuesta = reg.registros.length > 0;

            this.practicasCarga.push({
                practica: reg,
                esCompuesta: esCompuesta,
                margen: margen,
            });

            reg.registros.forEach(r => {
                recorrerSubpracticas(r, nivelTab + 1);
            });
        };

        this.practicasEjecucion.forEach(p => {
            recorrerSubpracticas(p, 0)
        });
        this.cargarConfiguracionesResultado();

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

    async cargarConfiguracionesResultado() {
        // return new Promise( async (resolve) => {
        let ids = [];
        this.practicasCarga.map((reg) => { ids.push(reg.practica._id) });
        await this.servicioPractica.findByIds({ ids: ids }).subscribe(
            (resultados) => {
                this.practicasCarga.map((reg) => {
                    for (let resultado of resultados) {
                        let practica: any = resultado;
                        if (resultado.id === reg.practica._id) {
                            reg.formatoResultado = practica.resultado.formato;
                            reg.formatoResultado.unidadMedida = practica.unidadMedida;
                            reg.formatoResultado.valoresReferencia = practica.presentaciones[0].valoresReferencia[0];
                            break;
                        }
                    }
                });
                // resolve(resultado);
            });

        // });
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
    validarTodas(event) {
        this.practicasEjecucion.forEach(practica => {
            practica.resultado.validado = event.value;
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
}
