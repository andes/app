import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from './../../interfaces/snomed-concept.interface';
import { IPrestacion } from './../../interfaces/prestacion.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacionGetParams } from '../../interfaces/prestacionGetParams.interface';
import { Plex } from '@andes/plex';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';

@Component({
    selector: 'rup-OdontogramaRefset',
    templateUrl: 'OdontogramaRefset.html',
    styleUrls: [
        'OdontogramaRefset.scss'
    ]
})
export class OdontogramaRefsetComponent extends RUPComponent implements OnInit {

    tooltip: any;
    ultimoOdontograma: IPrestacionRegistro;
    odontogramasHUDS: IPrestacion[];
    public piezasSeleccionadas: { diente: any; }[] = [];

    public caraSeleccionada: any;
    public piezaSeleccionada: any;
    public carasSeleccionadas: { diente: any; cara: any; }[] = [];
    public conceptos: any[] = [];

    public prestacionesCaras: any = {
        activo: true,
        componente: 'ObservacionesComponent',
        tipo: 'atomo',
        esSolicitud: false,
        style: {
            columns: 12.0,
            cssClass: null
        },
        defaultFor: [],
        conceptosBuscar: null,
        requeridos: [],
        frecuentes: [],
        params: null,
        conceptos: [
            {
                id: '',
                conceptId: '67784006',
                term: 'prueba de sensibilidad a la caries',
                fsn: 'prueba de sensibilidad a la caries (procedimiento)',
                semanticTag: 'procedimiento',
                refsetIds: [
                    '900000000000497000'
                ],
            },
            {
                fsn: 'inserción de restauración con amalgama en el diente (procedimiento)',
                semanticTag: 'procedimiento',
                refsetIds: [
                    '721145008',
                    '900000000000497000'
                ],
                conceptId: '234787002',
                term: 'restauración con amalgama'
            },
            {
                fsn: 'caries dental (trastorno)',
                semanticTag: 'trastorno',
                refsetIds: [
                    '721145008',
                    '900000000000497000'
                ],
                conceptId: '80967001',
                term: 'caries dentales'
            }
        ]
    };

    public prestacionesDientes: any =
        {
            activo: true,
            componente: 'ObservacionesComponent',
            tipo: 'atomo',
            esSolicitud: false,
            style: {
                columns: 12.0,
                cssClass: null
            },
            defaultFor: [],
            conceptosBuscar: null,
            requeridos: [],
            frecuentes: [],
            params: null,
            conceptos: [
                {
                    id: '',
                    conceptId: '173291009',
                    fsn: 'extracción simple de diente (procedimiento)',
                    term: 'extracción simple de diente',
                    semanticTag: 'procedimiento',
                    refsetIds: [
                        '900000000000497000'
                    ],
                }
                ,
                {
                    'fsn': 'tratamiento de conducto completo (procedimiento)',
                    'semanticTag': 'procedimiento',
                    'refsetIds': [
                        '721145008',
                        '900000000000497000'
                    ],
                    'conceptId': '54258006',
                    'term': 'tratamiento de conducto completo'
                }
            ]
        };



    prestacionDienteSeleccionada: any;
    prestacionCaraSeleccionada: any;

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();

    public odontograma: any = {
        cuadranteSuperiorDerecho: [],
        cuadranteSuperiorIzquierdo: [],
        cuadranteInferiorDerecho: [],
        cuadranteInferiorIzquierdo: []
    };

    ngOnInit() {

        // Traer EL odontograma
        this.snomedService.getQuery({ expression: '^721145008', field: 'term', words: 'iso designation', languageCode: 'en' }).subscribe(odontograma => {
            odontograma.forEach(diente => {
                let nroDiente = Number(diente.term.replace('ISO designation ', ''));
                diente.term = 'diente ' + nroDiente.toString();
                if (nroDiente >= 11 && nroDiente <= 18) {
                    this.odontograma.cuadranteSuperiorDerecho.push({ concepto: diente });
                } else if (nroDiente >= 21 && nroDiente <= 28) {
                    this.odontograma.cuadranteSuperiorIzquierdo.push({ concepto: diente });
                } else if (nroDiente >= 41 && nroDiente <= 48) {
                    this.odontograma.cuadranteInferiorDerecho.push({ concepto: diente });
                } else if (nroDiente >= 31 && nroDiente <= 38) {
                    this.odontograma.cuadranteInferiorIzquierdo.push({ concepto: diente });
                }

            });
            this.odontograma.cuadranteSuperiorDerecho.sort((a, b) => b.concepto.term > a.concepto.term);
            this.odontograma.cuadranteSuperiorIzquierdo.sort((a, b) => b.concepto.term > a.concepto.term);
            this.odontograma.cuadranteInferiorDerecho.sort((a, b) => b.concepto.term > a.concepto.term);
            this.odontograma.cuadranteInferiorIzquierdo.sort((a, b) => b.concepto.term > a.concepto.term);

            console.log(this.odontograma);



        });

        if (this.params) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptos = resultado;
            });

            this.prestacionesDientes = this.elementosRUPService.buscarElemento(this.prestacionesDientes.conceptos[0], false);
        }



        if (this.registro.valor && this.registro.valor.piezas) {
            // traer las evoluciones del odontograma (odontogramas anteriores)
        }
        let params: IPrestacionGetParams = {
            idPaciente: this.paciente.id,
            conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
            estado: 'validada'
        };

        this.prestacionesService.get(params).subscribe(odontogramasPaciente => {
            this.odontogramasHUDS = odontogramasPaciente;
            if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
                this.ultimoOdontograma = this.odontogramasHUDS[this.odontogramasHUDS.length - 1].ejecucion.registros.filter(x => x.concepto.conceptId === '721145008')[0];
            }
        });
    }

    showTooltip(e, index) {
        this.tooltip = index;
    }

    hideTooltip() {
        this.tooltip = null;
    }


    tieneEvolucion(diente, cara) {
        return this.ultimoOdontograma.valor.piezas.findIndex(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara) !== -1;
    }

    getClassEvolucion(diente, cara) {
        if (this.ultimoOdontograma) {
            // console.log(this.ultimoOdontograma.valor);
            return true;
            // this.ultimoOdontograma.valor.piezas.find(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara);
        } else {
            return false;
        }
    }
    getClass(tipo, diente, cara) {
        if (this[String(tipo)].length > 0) {
            return this[String(tipo)].find(x => x.diente.conceptId === diente.concepto.conceptId && (cara === 'pieza' || cara === x.cara)).concepto.semanticTag;
        }
    }

    loadPrestacionesDientes($event, tipo) {
        let conceptosSelect = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() }
        });
        // let conceptosSelect = this[tipo].conceptos.map(elem => {
        //     return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() };
        // });

        $event.callback(conceptosSelect);
    }

    seleccionarDiente(diente, cara) {
        if (cara === 'pieza') {
            let index = this.piezaCompleta(diente);
            diente.piezaCompleta = true;
            delete diente.cara;

            if (index === -1) {
                this.piezasSeleccionadas = [...this.piezasSeleccionadas, { diente: diente.concepto }];
                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];
                piezas.push({
                    concepto: diente.concepto,
                    cara: cara
                });
                this.registro.valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };
            } else {
                this.piezasSeleccionadas.splice(index, 1);
            }
            this.piezaSeleccionada = this.prestacionesDientes;
            this.emitEjecutarAccion({ concepto: diente.concepto, ...this.params });
        } else {
            let index = this.seleccionado(diente, cara);
            if (index === -1) {
                this.carasSeleccionadas = [...this.carasSeleccionadas, { diente: diente.concepto, cara: cara }];
                diente.cara = cara;
                diente.piezaCompleta = false;

                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];
                piezas.push({
                    concepto: diente.concepto,
                    cara: cara
                });
                this.registro.valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };
            } else {
                this.carasSeleccionadas.splice(index, 1);
            }
            this.caraSeleccionada = this.prestacionesCaras;
        }

    }

    seleccionado(diente, cara) {
        return this.carasSeleccionadas.findIndex(x => x.diente.conceptId === diente.concepto.conceptId && x.cara === cara);
    }

    piezaCompleta(diente) {
        return this.piezasSeleccionadas.findIndex(x => x.diente.conceptId === diente.concepto.conceptId);
    }

    seleccionarPrestacion() {

        // this.emitConcepto.emit(this.modelo.prestacionSeleccionada);
        if (this.prestacionDienteSeleccionada) {
            let prestacionDienteEmit = this.prestacionDienteSeleccionada;
            this.emitChange(prestacionDienteEmit);
            this.piezaSeleccionada = false;
        }

        if (this.prestacionCaraSeleccionada) {
            let prestacionCaraEmit = this.prestacionCaraSeleccionada;
            this.emitChange(prestacionCaraEmit);
            this.caraSeleccionada = false;
        }
        this.prestacionDienteSeleccionada = null;
        this.prestacionCaraSeleccionada = null;
    }

    seleccionadoSoloValores(diente) {
        return this.registro.valor.find(x => x.conceptId === diente.conceptId);
    }

    piezaCompletaSoloValores(diente) {
        return this.registro.valor.find(x => x.conceptId === diente.conceptId);
    }

    existeEnRegistro(tipo: 'carasSeleccionadas' | 'piezasSeleccionadas', diente, cara) {
        // if (this.registro.valor && this.registro.valor.piezas) {
        //     return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && (cara === 'pieza' || cara === x.cara)) !== -1;
        // } else {
        if (this[String(tipo)].length > 0) {
            return this[String(tipo)].findIndex(x => x.diente.conceptId === diente.concepto.conceptId && (cara === 'pieza' || cara === x.cara)) !== -1;
        }
        // }
    }

    getMensajes() {
        return [this.carasSeleccionadas, this.piezasSeleccionadas];
    }

}
