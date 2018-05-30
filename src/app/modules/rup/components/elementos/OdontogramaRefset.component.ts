import { setTimeout } from 'timers';
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

    showRelacion: boolean;
    relacionesActuales: IPrestacionRegistro[];
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
    popOverText: any = '';

    // public prestacionesCaras: any = {
    //     activo: true,
    //     componente: 'ObservacionesComponent',
    //     tipo: 'atomo',
    //     esSolicitud: false,
    //     style: {
    //         columns: 12.0,
    //         cssClass: null
    //     },
    //     defaultFor: [],
    //     conceptosBuscar: null,
    //     requeridos: [],
    //     frecuentes: [],
    //     params: null,
    //     conceptos: [
    // {
    //     id: '',
    //     conceptId: '67784006',
    //     term: 'prueba de sensibilidad a la caries',
    //     fsn: 'prueba de sensibilidad a la caries (procedimiento)',
    //     semanticTag: 'procedimiento',
    //     refsetIds: [
    //         '900000000000497000'
    //     ],
    // },
    // {
    //     fsn: 'inserción de restauración con amalgama en el diente (procedimiento)',
    //     semanticTag: 'procedimiento',
    //     refsetIds: [
    //         '721145008',
    //         '900000000000497000'
    //     ],
    //     conceptId: '234787002',
    //     term: 'restauración con amalgama'
    // },
    // {
    //     fsn: 'caries dental (trastorno)',
    //     semanticTag: 'trastorno',
    //     refsetIds: [
    //         '721145008',
    //         '900000000000497000'
    //     ],
    //     conceptId: '80967001',
    //     term: 'caries dentales'
    // }
    //     ]
    // };

    // public prestacionesDientes: any =
    //     {
    //         activo: true,
    //         componente: 'ObservacionesComponent',
    //         tipo: 'atomo',
    //         esSolicitud: false,
    //         style: {
    //             columns: 12.0,
    //             cssClass: null
    //         },
    //         defaultFor: [],
    //         conceptosBuscar: null,
    //         requeridos: [],
    //         frecuentes: [],
    //         params: null,
    //         conceptos: [
    //             {
    //                 id: '',
    //                 conceptId: '173291009',
    //                 fsn: 'extracción simple de diente (procedimiento)',
    //                 term: 'extracción simple de diente',
    //                 semanticTag: 'procedimiento',
    //                 refsetIds: [
    //                     '900000000000497000'
    //                 ],
    //             }
    //             ,
    //             {
    //                 'fsn': 'tratamiento de conducto completo (procedimiento)',
    //                 'semanticTag': 'procedimiento',
    //                 'refsetIds': [
    //                     '721145008',
    //                     '900000000000497000'
    //                 ],
    //                 'conceptId': '54258006',
    //                 'term': 'tratamiento de conducto completo'
    //             }
    //         ]
    //     };



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
            if (this.params) {
                this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                    this.conceptos = resultado;
                });

                // this.prestacionesDientes = this.elementosRUPService.buscarElemento(this.prestacionesDientes.conceptos[0], false);
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
                }
                this.armarRelaciones();
            });
        });


    }

    armarRelaciones() {
        if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {

            // Quito el odontograma porque se necesitan sólo los registros y sus relaciones
            this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros.shift();
            this.relaciones = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros;
            this.relacionesActuales = this.registro.registros;

            this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorDerecho.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.conceptId ? z.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorIzquierdo.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.conceptId ? z.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteInferiorDerecho.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.conceptId ? z.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteInferiorIzquierdo.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.conceptId ? z.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
        }

        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {
            // Esta consulta
            this.odontograma.cuadranteSuperiorDerecho.forEach(x => {
                x.relacion = this.prestacion.ejecucion.registros.filter(y => y.relacionadoCon ? y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId || z === x.concepto.conceptId) : {});
                x.relacion = x.relacion.map(y => y.concepto);
            });
            this.odontograma.cuadranteSuperiorIzquierdo.forEach(x => {
                x.relacion = this.prestacion.ejecucion.registros.filter(y => y.relacionadoCon ? y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId || z === x.concepto.conceptId) : {});
                x.relacion = x.relacion.map(y => y.concepto);
            });
            this.odontograma.cuadranteInferiorDerecho.forEach(x => {
                x.relacion = this.prestacion.ejecucion.registros.filter(y => y.relacionadoCon ? y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId || z === x.concepto.conceptId) : {});
                x.relacion = x.relacion.map(y => y.concepto);
            });
            this.odontograma.cuadranteInferiorIzquierdo.forEach(x => {
                x.relacion = this.prestacion.ejecucion.registros.filter(y => y.relacionadoCon ? y.relacionadoCon.find(z => z.conceptId === x.concepto.conceptId || z === x.concepto.conceptId) : {});
                x.relacion = x.relacion.map(y => y.concepto);
            });
        }

    }

    getRelacionClass(diente, cara = '') {
        if (this.prestacion.ejecucion.registros.findIndex(x => x.relacionadoCon.length > 0) !== -1) {
            let rel = this.prestacion.ejecucion.registros.find(x => x.relacionadoCon.find(y => y && y.concepto ? y.concepto.conceptId === diente.concepto.conceptId : y === diente.concepto.conceptId));
            if (rel) {
                return rel;
                // return 'diente-' + rel.concepto.semanticTag + (cara === 'pieza' ? '-outline' : '');
            } else {
                return '';
            }
        }
    }

    getRelacion(cuadrante, diente, cara) {
        return this.ultimoOdontograma.valor.odontograma[String(cuadrante)].find(z => z.cara === cara);

    }

    classRelacion(cuadrante, diente, cara) {
        if (this.relaciones && this.ultimoOdontograma) {
            let dientecito = this.estaEnUltimoOdontograma(diente, cara);
            if (dientecito) {
                let rel = this.relaciones.filter(x => x.relacionadoCon.find(y => y.conceptId === dientecito.concepto.conceptId));
                if (cara === 'pieza') {
                    return rel;
                } else {
                    return rel[0] && rel[0].concepto ? rel[0].concepto.semanticTag : '';
                }
            }
        }
    }

    private estaEnUltimoOdontograma(diente: any, cara: any) {
        return this.ultimoOdontograma.valor.piezas.find(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
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
        if (!this.popOverText.relacion || !diente.piezaCompleta && cara === 'pieza') {
            return;
        } else {
            if (this.popOverText.relacion.concepto === undefined || this.popOverText.relacion.concepto.semanticTag === undefined) {
                let conceptoValor = this.getRelacion(cuandrante, diente, cara);
                this.emitEjecutarAccion({ data: this.popOverText.relacion, ...{ tipo: this.getTipoHUDS(this.popOverText.relacion.concepto.semanticTag) } });

            }
        }
    }

    showTooltip(diente, cara, index = -1) {
        this.popOverText = {};

        if (cara !== 'pieza') {
            diente.piezaCompleta = false;
        } else {
            diente.piezaCompleta = true;
        }

        this.popOverText = JSON.parse(JSON.stringify(diente));
        if (index >= 0 && diente.relacion.length > 0) {
            this.popOverText.relacion = this.popOverText.relacion[index];
        } else {
            this.popOverText.relacion = this.popOverText.relacion[0];
        }
        this.popOverText.cara = cara;
        this.showPopOver = true;

        this.showRelacion = true;

    }

    hideTooltip() {
        this.showPopOver = false;
        this.showRelacion = false;
        this.popOverText = {};
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

    getClassRegistro(diente, cara) {
        console.log(this.prestacion.ejecucion.registros.find(x => x.relacionadoCon.find(y => y.concepto.conceptId === diente.concepto.conceptId)));
    }

    getClass(cuadrante, diente, cara, outline) {
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
        $event.callback(conceptosSelect);
    }

    cara(diente, cara) {
        if (this.carasSeleccionadas.length > 0) {
            return this.carasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
        }
        return -1;
    }

    caraValor(diente, cara) {
        if (this.prestacion.ejecucion.registros[0].valor && this.prestacion.ejecucion.registros[0].valor.piezas) {
            return this.prestacion.ejecucion.registros[0].valor.piezas.findIndex(x => {
                return (x.concepto ? x.concepto.conceptId === diente.concepto.conceptId : false) && x.cara === cara;
            });
        }
        return -1;
    }

    caraRel(diente, cara) {
        if (this.prestacion.ejecucion.registros[0].valor && this.prestacion.ejecucion.registros[0].valor.piezas) {
            return this.prestacion.ejecucion.registros[0].valor.piezas.findIndex(x => {
                if (x.conceptId === diente.concepto.conceptId && x.cara === cara) {
                    return diente.relacion;
                }
            });
        }
    }

    piezaCompleta(diente, cara) {
        if (this.piezasSeleccionadas.length > 0) {
            return this.piezasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        }
        return -1;
    }

    piezaCompletaValor(diente, cara) {
        if (this.registro.valor && this.registro.valor.piezas.length) {
            return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        }
        return -1;
    }

    piezaCompletaClass(diente, cara) {
        return this.registro.valor.piezas.find(x => x.concepto.conceptId === diente.concepto.conceptId) || false;
    }


    validacionClass(diente, cara) {
        return this.getRelacionClass(diente, cara);
        // let cl = this.registro.valor.piezas.find(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
        // if (cl) {
        //     return cl.concepto.semanticTag;
        // }
    }

    seleccionarDiente(diente, cara) {

        if (cara === 'pieza') {

            let index = this.piezaCompleta(diente, 'pieza');
            let indexValor = this.piezaCompletaValor(diente, 'pieza');

            diente.piezaCompleta = true;
            delete diente.cara;

            if (index === -1) {
                this.piezasSeleccionadas = [{ diente: diente, cara: cara }];
                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];

                if (this.piezaCompletaValor(diente, cara) === -1) {

                    piezas.push({
                        concepto: diente.concepto,
                        cara: cara
                    });
                }

                this.prestacion.ejecucion.registros[0].valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };

                debugger;
                this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: 'pieza' }], ...this.params });

            } else {

                if (this.piezaCompletaValor(diente, cara) !== -1) {
                    this.registro.valor.piezas.splice(indexValor, 1);
                }
                this.piezasSeleccionadas.splice(index, 1);
                this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            }

            // this.piezaSeleccionada = this.prestacionesDientes;

        } else {

            let index = this.cara(diente, cara);
            let indexValor = this.caraValor(diente, cara);

            if (index === -1) {
                this.carasSeleccionadas = [{ diente: diente, cara: cara }];
                diente.cara = cara;
                diente.piezaCompleta = false;

                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];

                if (this.caraValor(diente, cara) === -1) {
                    // piezas.pop();
                    piezas.push({
                        concepto: diente.concepto,
                        cara: cara
                    });

                }

                this.prestacion.ejecucion.registros[0].valor = {
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
            // this.caraSeleccionada = this.prestacionesCaras;

        }

    }

    seleccionarPrestacion() {

        if (this.prestacionDienteSeleccionada) {
            let prestacionDienteEmit = this.prestacionDienteSeleccionada;
            this.emitChange(prestacionDienteEmit);
            // this.piezaSeleccionada = false;
        }

        if (this.prestacionCaraSeleccionada) {
            let prestacionCaraEmit = this.prestacionCaraSeleccionada;
            this.emitChange(prestacionCaraEmit);
            // this.caraSeleccionada = false;
        }
        this.prestacionDienteSeleccionada = null;
        this.prestacionCaraSeleccionada = null;
    }



    existeEnRegistro(tipo: 'carasSeleccionadas' | 'piezasSeleccionadas' | 'valor', diente, cara) {
        if (this.registro.valor && this.registro.valor.piezas) {
            return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && (cara === x.cara)) !== -1;
        } else {
            if (this[String(tipo)].length > 0) {
                return this[String(tipo)].findIndex(x => {
                    return x.diente.conceptId === diente.concepto.conceptId && (cara === x.cara);
                }) !== -1;
            }
        }
    }

    // TODO: REVISAR
    piezaAnulada(conceptId) {
        if (this.odontogramasHUDS) {
            let relacion = this.odontogramasHUDS.find(x => x.ejecucion.registros.findIndex(y => y.relacionadoCon.findIndex(z => z.conceptId === conceptId) !== -1) !== -1);
            return relacion && relacion.ejecucion.registros.find(a => this.params.anularPieza.find(b => b === a.concepto.conceptId));
        }
    }

    getMensajes() {
    }

}
