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

    ultimoOdontogramaCompleto: any[];
    showRelacion: boolean;
    relacionesActuales: IPrestacionRegistro[];
    relaciones: IPrestacionRegistro[] = [];
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

    public seleccionMultiple = false;

    ngOnInit() {

        // Traer EL odontograma, los dientes
        this.snomedService.getQuery({ expression: '^' + this.params.refsetId, field: 'term', words: 'iso designation', languageCode: 'en' }).subscribe(odontograma => {
            odontograma.forEach(diente => {
                let nroDiente = Number(diente.term.replace('ISO designation ', ''));
                diente.term = nroDiente.toString();
                //  || (nroDiente >= 51 && nroDiente <= 55)
                if ((nroDiente >= 11 && nroDiente <= 18)) {
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

            // Trae los hallazgos, procedimientos, etc...
            if (this.params) {
                this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                    this.conceptos = resultado;
                });

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
                    if (this.ultimoOdontograma && this.ultimoOdontograma.valor) {
                        console.log(odontogramasPaciente);
                    }
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
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.concepto.conceptId ? z.concepto.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteSuperiorIzquierdo.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.concepto.conceptId ? z.concepto.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteInferiorDerecho.forEach(x => {
                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.concepto.conceptId ? z.concepto.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });
            this.ultimoOdontograma.valor.odontograma.cuadranteInferiorIzquierdo.forEach(x => {

                x.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.concepto.conceptId ? z.concepto.conceptId === x.concepto.conceptId : z === x.concepto.conceptId))) || {};
            });

            console.log(this.relaciones);

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

    walkThruKeys(obj: any) {
        if (typeof obj === 'object') {
            return Object.keys(obj);
        }
    }

    getRelacion(cuadrante, diente, cara) {
        return this.ultimoOdontograma.valor.odontograma[String(cuadrante)].find(z => z.cara === cara);

    }

    classRelacion(diente, cara) {

        return this.relaciones.find(x => {
            if (x.relacionadoCon) {
                return x.relacionadoCon.find(y => {
                    return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                });
            }
        });

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
        if (!this.popOverText.relacion) {
            return;
        } else {
            if (this.popOverText.relacion) {
                let conceptoValor = this.getRelacion(cuandrante, diente, cara);
                this.emitEjecutarAccion({ data: this.popOverText.relacion, ...{ tipo: (this.popOverText.relacion ? this.popOverText.relacion.concepto.semanticTag : 'seleccionada') } });

            } else {
                alert(this.popOverText.relacion);
            }
        }
    }

    getRegistrosRel(diente, cara) {
        return this.prestacion.ejecucion.registros.filter(x => {
            if (x.relacionadoCon) {
                return x.relacionadoCon.find(y => {
                    if (y && y.concepto) {
                        return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                    }
                });
            }
        });
    }

    getRegistrosRelAnterior(diente, cara) {
        return this.relaciones.filter(x => {
            if (x.relacionadoCon) {
                return x.relacionadoCon.find(y => {
                    return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                });
            }
        });
    }

    // (mouseenter)
    showTooltip(diente, cara, huds = false, index = -1) {
        this.popOverText = {};

        if (cara !== 'pieza') {
            diente.piezaCompleta = false;
        } else {
            diente.piezaCompleta = true;
        }

        this.popOverText = JSON.parse(JSON.stringify(diente));

        if (cara !== 'anulada') {
            let rel = !huds ? this.getRegistrosRel(diente, cara) : this.getRegistrosRelAnterior(diente, cara);
            if (rel.length) {
                this.popOverText.relacion = rel[index];
            }
        }
        // Sólo para piezas
        if (diente.piezaCompleta) {
            this.popOverText.relacion = !huds ? this.getRegistrosRel(diente, 'pieza')[index] : this.getRegistrosRelAnterior(diente, 'pieza')[index];

        }

        this.popOverText.cara = cara;
        this.showPopOver = true;
        this.showRelacion = true;

    }

    // (mouseleave)
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
        if (this.prestacion.ejecucion.registros.length) {
            return this.prestacion.ejecucion.registros.find(x => {
                if (x.relacionadoCon) {
                    return x.relacionadoCon.find(y => {
                        if (y && y.concepto && y.cara) {
                            return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                        }
                    });
                }
            });
        }
    }

    loadPrestacionesDientes($event, tipo) {
        let conceptosSelect = this.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() }
        });
        $event.callback(conceptosSelect);
    }

    cara(diente, cara) {
        if (this.piezasSeleccionadas.length > 0) {
            return this.piezasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === cara);
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

    seleccionarDiente(diente, cara) {

        if (cara === 'pieza') {

            let index = this.piezaCompleta(diente, 'pieza');
            let indexValor = this.piezaCompletaValor(diente, 'pieza');

            diente.piezaCompleta = true;
            delete diente.cara;

            if (index === -1) {

                if (!this.seleccionMultiple) {
                    this.piezasSeleccionadas = [{ diente: diente, cara: cara }];
                } else {
                    this.piezasSeleccionadas = [...this.piezasSeleccionadas, { diente: diente, cara: cara }];
                }

                // this.piezasSeleccionadas = [{ diente: diente, cara: cara }];
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

                if (!this.seleccionMultiple) {
                    this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: 'pieza' }], ...this.params, ...{ multiple: this.seleccionMultiple } });
                } else {
                    this.emitEjecutarAccion({ conceptos: this.piezasSeleccionadas.map(x => x.concepto = x.diente), ...this.params, ...{ multiple: this.seleccionMultiple } });
                }

                // this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: 'pieza' }], ...this.params });

            } else {

                if (this.piezaCompletaValor(diente, cara) !== -1) {
                    this.registro.valor.piezas.splice(indexValor, 1);
                }
                this.piezasSeleccionadas.splice(index, 1);
                this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            }

        } else {

            let index = this.cara(diente, cara);
            let indexValor = this.caraValor(diente, cara);

            if (index === -1) {

                if (!this.seleccionMultiple) {
                    this.piezasSeleccionadas = [{ diente: diente, cara: cara }];
                } else {
                    this.piezasSeleccionadas = [...this.piezasSeleccionadas, { diente: diente, cara: cara }];
                }

                diente.cara = cara;
                diente.piezaCompleta = false;

                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];

                if (this.caraValor(diente, cara) === -1) {
                    piezas.push({
                        concepto: diente.concepto,
                        cara: cara
                    });
                }

                this.prestacion.ejecucion.registros[0].valor = {
                    piezas: piezas,
                    odontograma: this.odontograma
                };

                if (!this.seleccionMultiple) {
                    this.emitEjecutarAccion({ conceptos: [{ concepto: diente.concepto, cara: cara }], ...this.params, ...{ multiple: this.seleccionMultiple } });
                } else {
                    this.emitEjecutarAccion({ conceptos: this.piezasSeleccionadas.map(x => x.concepto = x.diente), ...this.params, ...{ multiple: this.seleccionMultiple } });
                }

            } else {

                if (this.caraValor(diente, cara) !== -1) {
                    this.registro.valor.piezas.splice(indexValor, 1);
                }
                this.piezasSeleccionadas.splice(index, 1);
                this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            }

        }

    }

    piezaAnulada(conceptId) {
        if (this.odontogramasHUDS) {
            let relacion = this.odontogramasHUDS.find(x => x.ejecucion.registros.findIndex(y => y.relacionadoCon.findIndex(z => z.conceptId === conceptId) !== -1) !== -1);
            return relacion && relacion.ejecucion.registros.find(a => this.params.anularPieza.find(b => b === a.concepto.conceptId));
        } else {
            return false;
        }
    }

    habilitarSeleccionMultiple(e) {
        this.seleccionMultiple = !this.seleccionMultiple;
        this.piezasSeleccionadas = [];
    }

    estaSeleccionada(diente, cara) {
        return this.piezasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === cara) !== -1;
    }

}
