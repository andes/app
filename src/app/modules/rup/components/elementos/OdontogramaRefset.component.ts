import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from './../../interfaces/snomed-concept.interface';
import { IPrestacion } from './../../interfaces/prestacion.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacionGetParams } from '../../interfaces/prestacionGetParams.interface';
// import { Plex } from '@andes/plex';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';

@Component({
    selector: 'rup-OdontogramaRefset',
    templateUrl: 'OdontogramaRefset.html',
    styleUrls: [
        'OdontogramaRefset.scss'
    ]
})
export class OdontogramaRefsetComponent extends RUPComponent implements OnInit {

    relaciones: IPrestacionRegistro[];
    ultimoOdontogramaIndex: number;
    tooltip: any;
    ultimoOdontograma: IPrestacionRegistro;
    showUltimoOdontograma = true;
    odontogramasHUDS: IPrestacion[];
    public piezasSeleccionadas: any[] = [];

    public caraSeleccionada: any;
    public piezaSeleccionada: any;
    public carasSeleccionadas: any[] = [];
    public conceptos: any[] = [];

    showPopOver = false;
    popOverText = '';

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
                diente.term = nroDiente.toString();
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
            this.odontograma.cuadranteSuperiorIzquierdo.sort((a, b) => b.concepto.term < a.concepto.term);
            this.odontograma.cuadranteInferiorDerecho.sort((a, b) => b.concepto.term > a.concepto.term);
            this.odontograma.cuadranteInferiorIzquierdo.sort((a, b) => b.concepto.term < a.concepto.term);
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
                this.ultimoOdontogramaIndex = this.odontogramasHUDS.length - 1;

                this.armarRelaciones();
            }
        });

    }

    armarRelaciones() {
        this.odontogramasHUDS[this.odontogramasHUDS.length - 1].ejecucion.registros.shift();
        this.relaciones = this.odontogramasHUDS[this.odontogramasHUDS.length - 1].ejecucion.registros;

        this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorDerecho.forEach(x => {
            x.relacion = this.relaciones.find(y => y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId)) || {};
        });
        this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorIzquierdo.forEach(x => {
            x.relacion = this.relaciones.find(y => y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId)) || {};
        });
        this.ultimoOdontograma.valor.odontograma.cuadranteInferiorDerecho.forEach(x => {
            x.relacion = this.relaciones.find(y => y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId)) || {};
        });
        this.ultimoOdontograma.valor.odontograma.cuadranteInferiorIzquierdo.forEach(x => {
            x.relacion = this.relaciones.find(y => y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId)) || {};
        });
    }

    getRelacion(cuadrante, diente, cara) {
        console.info(cuadrante, diente, cara);
        return this.ultimoOdontograma.valor.odontograma[String(cuadrante)].find(z => z.cara === cara);

    }

    classRelacion(cuadrante, diente, cara) {
        if (this.relaciones && this.ultimoOdontograma) {
            let rel = this.relaciones.find(x => x.relacionadoCon.find(y => y.conceptId === diente.concepto.conceptId &&
                this.ultimoOdontograma.valor.odontograma[String(cuadrante)].find(z => z.cara === cara)));
            if (rel) {
                return 'diente-' + rel.concepto.semanticTag;
            }
        }
    }

    getTipoHUDS(st) {
        switch (st) {
            case 'hallazgo':
            case 'trastorno':
            case 'situacion':
            case 'producto':
                return 'hallazgo';
            case 'plan':
                return 'prestacion';
            case 'procedimiento':
                return 'procedimiento';
        }
    }

    verRegistroDiente(cuandrante, diente, cara) {
        let conceptoValor = this.getRelacion(cuandrante, diente, cara);
        this.emitEjecutarAccion({ data: diente.relacion, ...{ tipo: this.getTipoHUDS(diente.relacion.concepto.semanticTag) } });
    }

    showTooltip(diente, cara) {
        if (diente.relacion && diente.cara === cara) {
            this.popOverText = diente;
            this.showPopOver = true;
        }
    }

    hideTooltip() {
        this.showPopOver = false;
        this.popOverText = null;
        // this.tooltip = null;
    }

    toggleUltimo() {
        this.showUltimoOdontograma = !this.showUltimoOdontograma;
    }

    odontogramaAnterior() {
        let params: IPrestacionGetParams = {
            idPaciente: this.paciente.id,
            conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
            estado: 'validada'
        };
        this.prestacionesService.get(params).subscribe(odontogramasPaciente => {
            this.odontogramasHUDS = odontogramasPaciente;
            if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
                if (this.ultimoOdontogramaIndex > 0) {
                    this.ultimoOdontogramaIndex--;
                    this.ultimoOdontograma = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros.filter(x => x.concepto.conceptId === '721145008')[0];
                    this.armarRelaciones();
                }
            }
        });

    }
    odontogramaSiguiente() {
        let params: IPrestacionGetParams = {
            idPaciente: this.paciente.id,
            conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
            estado: 'validada'
        };
        this.prestacionesService.get(params).subscribe(odontogramasPaciente => {
            this.odontogramasHUDS = odontogramasPaciente;
            if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
                if (this.ultimoOdontogramaIndex < this.odontogramasHUDS.length - 1) {
                    this.ultimoOdontogramaIndex++;
                    this.ultimoOdontograma = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros.filter(x => x.concepto.conceptId === '721145008')[0];
                    this.armarRelaciones();
                }
            }
        });
    }

    tieneEvolucion(diente, cara) {
        return this.ultimoOdontograma.valor.piezas.findIndex(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara) !== -1;
    }

    getClassEvolucion(diente, cara) {
        // let pieza = this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorDerecho.find(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara);
        // if (pieza && pieza.concepto.semanticTag) {
        //     return 'diente-' + pieza.concepto.semanticTag;
        // }
        // if (this.ultimoOdontograma) {
        //     // console.log(this.ultimoOdontograma.valor);
        //     return true;
        //     // this.ultimoOdontograma.valor.piezas.find(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara);
        // } else {
        //     return false;
        // }
    }
    getClass(cuadrante, diente, cara, outline) {
        // if (this[String(tipo)].length > 0) {
        //     return this[String(tipo)].find(x => x.diente.conceptId === diente.concepto.conceptId && (cara === x.cara)).concepto.semanticTag;
        // }
        // if (this.registro.valor) {
        //     return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        // }
        if (this.existeEnRegistro('valor', diente, 'pieza')) {
            return {
                ...outline ? { 'diente-trastorno-outline': true } : { 'diente-trastorno': true }
            }
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

    caraValor(diente, cara) {
        if (this.registro.valor) {
            // Ver que la cara no ese ya registrada
            if (this.carasSeleccionadas.find(x => x.conceptId !== diente.conceptId)) {
                return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
            }
            return -1;
        }
        return -1;
    }

    piezaCompletaValor(diente, cara) {
        if (this.registro.valor) {
            return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        }
        return -1;
    }

    cara(diente, cara) {
        if (this.carasSeleccionadas.length > 0) {
            return this.carasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
        }
        return -1;
    }

    piezaCompleta(diente, cara) {
        if (this.piezasSeleccionadas.length > 0) {
            return this.piezasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        }
        return -1;
    }

    seleccionarDiente(diente, cara) {

        console.log('this.ultimoOdontograma', this.ultimoOdontograma);
        console.log('this.relaciones', this.relaciones);


        // if (this.prestacion.ejecucion.registros.length === 1 && this.registro.valor.piezas.length > 0 && !this.isEmitted) {
        //     // this.registro.valor.piezas = [];
        // }

        if (cara === 'pieza') {

            let index = this.piezaCompleta(diente, 'pieza');
            let indexValor = this.piezaCompletaValor(diente, 'pieza');

            diente.piezaCompleta = true;
            delete diente.cara;

            if (index === -1) {
                this.piezasSeleccionadas = [{ diente: diente, cara: cara }];
                // this.piezasSeleccionadas = [...this.piezasSeleccionadas, { diente: diente, cara: cara }];
                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];

                if (this.piezaCompletaValor(diente, cara) === -1) {

                    // this.registro.valor.piezas.pop();

                    piezas.push({
                        concepto: diente.concepto,
                        cara: cara
                    });
                }

                this.registro.valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };

                this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: 'pieza' }], ...this.params });

            } else {

                if (this.piezaCompletaValor(diente, cara) !== -1) {
                    this.registro.valor.piezas.splice(indexValor, 1);
                }
                this.piezasSeleccionadas.splice(index, 1);
                this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            }

            this.piezaSeleccionada = this.prestacionesDientes;

        } else {

            let index = this.cara(diente, cara);
            let indexValor = this.caraValor(diente, cara);

            if (index === -1) {
                this.carasSeleccionadas = [{ diente: diente, cara: cara }];
                // this.carasSeleccionadas = [...this.carasSeleccionadas, { diente: diente, cara: cara }];
                diente.cara = cara;
                diente.piezaCompleta = false;

                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];

                if (this.caraValor(diente, cara) === -1) {
                    piezas.pop();
                    piezas.push({
                        concepto: diente.concepto,
                        cara: cara
                    });

                }

                this.registro.valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };

                this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: cara }], ...this.params });

            } else {

                if (this.caraValor(diente, cara) !== -1) {
                    this.registro.valor.piezas.splice(indexValor, 1);
                }
                this.carasSeleccionadas.splice(index, 1);
                this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            }
            this.caraSeleccionada = this.prestacionesCaras;

        }

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



    existeEnRegistro(tipo: 'carasSeleccionadas' | 'piezasSeleccionadas' | 'valor', diente, cara) {
        if (this.registro.valor && this.registro.valor.piezas) {
            // console.log('cara', cara);
            return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && (cara === x.cara)) !== -1;
        } else {
            // console.log('cara 2', cara);
            if (this[String(tipo)].length > 0) {
                return this[String(tipo)].findIndex(x => {
                    console.log('x.diente.conceptId', x.diente.conceptId);
                    console.log('diente.concepto.conceptId', diente.concepto.conceptId);
                    return x.diente.conceptId === diente.concepto.conceptId && (cara === x.cara);
                }) !== -1;
            }
        }
    }

    getMensajes() {
        // return [this.carasSeleccionadas, this.piezasSeleccionadas];
    }

}
