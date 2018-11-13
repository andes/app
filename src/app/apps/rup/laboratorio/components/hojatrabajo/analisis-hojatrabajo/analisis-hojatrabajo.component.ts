import { IPractica } from './../../../interfaces/IPractica';
import { PracticaService } from './../../../services/practica.service';
import { Component, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'analisis-hojatrabajo',
    templateUrl: './analisis-hojatrabajo.html'
})
export class AnalisisHojatrabajoComponent implements OnInit {

    practicas;
    practicaSeleccionada = null;

    @Input() solicitudProtocolo: any;
    @Input() practicasEjecucion: any;

    constructor(public plex: Plex, private servicioPractica: PracticaService) { }

    ngOnInit() {
    }

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
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
        console.log('seleccionarPractica');
        if (practica) {
            let existe = this.practicas.findIndex(x => x.concepto.conceptId === practica.concepto.conceptId);

            if (existe === -1) {
                this.practicas.push(practica);
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
                    }
                };
                // }
                console.log('gonna this.getPracticasRequeridas....');
                practicaEjecucion.registros = await this.getPracticasRequeridas(practica);
                this.practicasEjecucion.push(practicaEjecucion);
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
            }
        }
        this.practicaSeleccionada = null;
        console.log('this.practicaSeleccionada', this.practicaSeleccionada);
    }

    async getPracticasRequeridas(practica) {
        return new Promise(async (resolve) => {
            if (practica.categoria === 'compuesta' && practica.requeridos) {
                let ids = [];
                practica.requeridos.map((id) => { ids.push(id._id); });
                await this.servicioPractica.findByIds(ids).subscribe((resultados) => {
                    resultados.forEach(async (resultado: any) => {
                        resultado.valor = {
                            resultado: {
                                valor: null,
                                sinMuestra: false,
                                validado: false
                            }
                        };
                        resultado.registros = await this.getPracticasRequeridas(resultado);
                    });
                    console.log('getPracticasRequeridas');
                    resolve(resultados);
                });
            } else {
                resolve([]);
            }
        });
    }

    loadPracticasPorNombre($event) {
        console.log('loadPracticasPorNombre');
        console.log($event.query);
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query
            }).subscribe((resultado: any) => {
                console.log(resultado);
                $event.callback(resultado);
            });
        } else {
            $event.callback([]);
        }
    }

    eliminarPractica(practica: IPractica) {
        let practicasSolicitud = this.solicitudProtocolo.solicitudPrestacion.practicas;
        practicasSolicitud.splice(practicasSolicitud.findIndex(x => x.id === practica.id), 1);
        this.practicasEjecucion.splice(this.practicasEjecucion.findIndex(x => x.id === practica.id), 1);
    }

    agregarPractica() {

    }
}
