import { IPrestacion } from './../../interfaces/prestacion.interface';
import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacionGetParams } from '../../interfaces/prestacionGetParams.interface';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { RupElement } from '.';

@Component({
    selector: 'rup-OdontogramaRefset',
    templateUrl: 'OdontogramaRefset.html',
    styleUrls: [
        'OdontogramaRefset.scss'
    ]
})
@RupElement('OdontogramaRefsetComponent')
export class OdontogramaRefsetComponent extends RUPComponent implements OnInit {

    ultimoOdontogramaCompleto: any[];
    showRelacion: boolean;
    relacionesActuales: IPrestacionRegistro[];
    relaciones: IPrestacionRegistro[] = [];
    ultimoOdontogramaIndex: number;
    tooltip: any;
    ultimoOdontograma: IPrestacionRegistro;
    showUltimoOdontograma = false;
    odontogramasHUDS: IPrestacion[];
    odontogramasHUDSAux: IPrestacion[];
    public piezasSeleccionadas: any[] = [];

    public caraSeleccionada: any;
    public piezaSeleccionada: any;
    public carasSeleccionadas: any[] = [];
    public conceptos: any[] = [];

    public cuadrantes = [
        'cuadranteSuperiorDerecho',
        'cuadranteSuperiorIzquierdo',
        'cuadranteSuperiorDerechoTemporal',
        'cuadranteSuperiorIzquierdoTemporal',
        'cuadranteInferiorDerechoTemporal',
        'cuadranteInferiorIzquierdoTemporal',
        'cuadranteInferiorDerecho',
        'cuadranteInferiorIzquierdo',
    ];
    public cuadrantesTemporales = [
        'cuadranteSuperiorDerechoTemporal',
        'cuadranteSuperiorIzquierdoTemporal',
        'cuadranteInferiorDerechoTemporal',
        'cuadranteInferiorIzquierdoTemporal'
    ];

    showPopOver = false;
    popOverText: any = '';

    prestacionDienteSeleccionada: any;
    prestacionCaraSeleccionada: any;

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();

    public odontograma: any = {
        cuadranteSuperiorDerecho: [],
        cuadranteSuperiorDerechoTemporal: [],
        cuadranteSuperiorIzquierdo: [],
        cuadranteSuperiorIzquierdoTemporal: [],
        cuadranteInferiorDerecho: [],
        cuadranteInferiorDerechoTemporal: [],
        cuadranteInferiorIzquierdo: [],
        cuadranteInferiorIzquierdoTemporal: [],
    };

    public seleccionMultiple = false;
    public ocultarTemporales = true;
    public conceptoOdontograma = '3561000013109';

    // El paciente no tiene odontogramas anteriores, hasta que se revise la HUDS
    public cargandoUltimoOdontograma = true;

    ngOnInit() {

        // Traer EL odontograma, los dientes
        this.snomedService.getQuery({
            expression: `^${this.params.refsetId}`,
            field: 'term',
            words: 'iso designation',
            languageCode: 'en'
        }).subscribe(odontograma => {

            odontograma.forEach(diente => {
                let nroDiente = Number(diente.term.replace('ISO designation ', ''));
                diente.term = nroDiente.toString();
                if ((nroDiente >= 11 && nroDiente <= 18)) {
                    this.odontograma.cuadranteSuperiorDerecho.push({ concepto: diente, cuadrante: 'TR' });
                } else if (nroDiente >= 21 && nroDiente <= 28) {
                    this.odontograma.cuadranteSuperiorIzquierdo.push({ concepto: diente, cuadrante: 'TL' });
                } else if (nroDiente >= 41 && nroDiente <= 48) {
                    this.odontograma.cuadranteInferiorDerecho.push({ concepto: diente, cuadrante: 'BR' });
                } else if (nroDiente >= 31 && nroDiente <= 38) {
                    this.odontograma.cuadranteInferiorIzquierdo.push({ concepto: diente, cuadrante: 'BL' });
                } else if (nroDiente >= 51 && nroDiente <= 55) {
                    this.odontograma.cuadranteSuperiorDerechoTemporal.push({ concepto: diente, cuadrante: 'TRT' });
                } else if (nroDiente >= 61 && nroDiente <= 65) {
                    this.odontograma.cuadranteSuperiorIzquierdoTemporal.push({ concepto: diente, cuadrante: 'TLT' });
                } else if (nroDiente >= 81 && nroDiente <= 85) {
                    this.odontograma.cuadranteInferiorDerechoTemporal.push({ concepto: diente, cuadrante: 'BRT' });
                } else if (nroDiente >= 71 && nroDiente <= 75) {
                    this.odontograma.cuadranteInferiorIzquierdoTemporal.push({ concepto: diente, cuadrante: 'BLT' });
                }
            });

            this.odontograma.cuadranteSuperiorDerecho.sort((a, b) => Number(b.concepto.term) - Number(a.concepto.term));
            this.odontograma.cuadranteSuperiorIzquierdo.sort((a, b) => Number(a.concepto.term) - Number(b.concepto.term));
            this.odontograma.cuadranteInferiorDerecho.sort((a, b) => Number(b.concepto.term) - Number(a.concepto.term));
            this.odontograma.cuadranteInferiorIzquierdo.sort((a, b) => Number(a.concepto.term) - Number(b.concepto.term));
            this.odontograma.cuadranteSuperiorDerechoTemporal.sort((a, b) => Number(b.concepto.term) - Number(a.concepto.term));
            this.odontograma.cuadranteSuperiorIzquierdoTemporal.sort((a, b) => Number(a.concepto.term) - Number(b.concepto.term));
            this.odontograma.cuadranteInferiorDerechoTemporal.sort((a, b) => Number(b.concepto.term) - Number(a.concepto.term));
            this.odontograma.cuadranteInferiorIzquierdoTemporal.sort((a, b) => Number(a.concepto.term) - Number(b.concepto.term));

            let params: IPrestacionGetParams = {
                idPaciente: this.paciente.id,
                conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
                estado: 'validada'
            };

            this.prestacionesService.get(params).subscribe(odontogramasPaciente => {
                this.odontogramasHUDS = odontogramasPaciente.filter(unaPrestacion => {
                    let odonto = null;
                    if (odonto = unaPrestacion.ejecucion.registros.find(x => x.concepto.conceptId === this.conceptoOdontograma)) {
                        if (odonto.valor) {
                            return unaPrestacion;
                        }
                    }
                });

                let fechaConsulta = new Date();
                if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
                    this.ultimoOdontograma = this.odontogramasHUDS[this.odontogramasHUDS.length - 1].ejecucion.registros.filter(x => x.concepto.conceptId === this.conceptoOdontograma)[0];
                    this.ultimoOdontogramaIndex = this.odontogramasHUDS.length - 1;
                    fechaConsulta = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.fecha;
                }
                this.cargandoUltimoOdontograma = false;

                this.armarRelaciones(fechaConsulta);

            });
        });

    }

    armarRelaciones(fecha: Date) {

        // Último Odontograma (si existe)
        if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
            // hacemos una copia de la lista de odontogramas
            let listaConceptosOdonto = this.odontogramasHUDS.slice();
            // Quito el odontograma porque se necesitan sólo los registros y sus relaciones
            this.relaciones = [];
            // filtramos las consultas según la navegacion
            listaConceptosOdonto = listaConceptosOdonto.filter(c => c.ejecucion.fecha <= fecha);
            listaConceptosOdonto.forEach(unaConsulta => {
                const registros = unaConsulta.ejecucion.registros.filter(c => c.concepto.conceptId !== this.conceptoOdontograma);
                this.relaciones = [...this.relaciones, ...registros];
            });

            this.relacionesActuales = this.registro.registros;

            // Se arma el último odontograma, con sus relaciones
            for (let cuadrante of this.cuadrantes) {
                if (this.ultimoOdontograma.valor && this.ultimoOdontograma.valor.odontograma) {
                    for (let diente of this.ultimoOdontograma.valor.odontograma[String(cuadrante)]) {
                        diente.relacion = this.relaciones.filter(y => y.relacionadoCon.find(z => (z.concepto.conceptId ? z.concepto.conceptId === diente.concepto.conceptId : z === diente.concepto.conceptId))) || {};
                    }
                }
            }

        }

        // Odontograma de esta consulta
        if (this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {

            // Se arma el Odontograma actual, con sus relaciones
            for (let cuadrante of this.cuadrantes) {
                for (let diente of this.odontograma[String(cuadrante)]) {
                    diente.relacion = this.prestacion.ejecucion.registros.filter(y => y.relacionadoCon ? y.relacionadoCon.find(z => {
                        return z === diente.concepto.conceptId;
                    }) : {});
                    diente.relacion = diente.relacion.map(y => y.concepto);
                }
            }

        }

    }

    odontogramaAnterior() {
        this.showUltimoOdontograma = false;
        if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
            if (this.ultimoOdontogramaIndex > 0) {
                this.ultimoOdontogramaIndex--;
                this.ultimoOdontograma = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros.filter(x => x.concepto.conceptId === this.conceptoOdontograma)[0];
                if (this.ultimoOdontograma) {
                    let fechaConsulta = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.fecha;
                    this.armarRelaciones(fechaConsulta);
                }
                this.showUltimoOdontograma = true;
            }
        }

    }

    odontogramaSiguiente() {
        this.showUltimoOdontograma = false;
        let params: IPrestacionGetParams = {
            idPaciente: this.paciente.id,
            conceptId: this.prestacion.solicitud.tipoPrestacion.conceptId,
            estado: 'validada'
        };

        if (this.odontogramasHUDS && this.odontogramasHUDS.length > 0) {
            if (this.ultimoOdontogramaIndex < this.odontogramasHUDS.length - 1) {
                this.ultimoOdontogramaIndex++;
                this.ultimoOdontograma = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.registros.filter(x => x.concepto.conceptId === this.conceptoOdontograma)[0];
                let fechaConsulta = this.odontogramasHUDS[this.ultimoOdontogramaIndex].ejecucion.fecha;
                this.armarRelaciones(fechaConsulta);
                this.showUltimoOdontograma = true;
            }
        }
    }

    // (click)
    showDetail(diente, cara, huds = false) {

        this.popOverText = {};

        if (cara !== 'pieza') {
            diente.piezaCompleta = false;
        } else {
            diente.piezaCompleta = true;
        }

        this.popOverText = diente;

        if (cara !== 'anulada') {
            let rel = !huds ? this.getRegistrosRel(diente, cara) : this.getRegistrosRelAnterior(diente, cara);
            if (rel.length) {
                this.popOverText.relacion = rel;
            } else {
                this.popOverText.relacion = {};
                // Sólo para piezas
            }
        }
        if (diente.piezaCompleta) {
            this.popOverText['relacion'] = !huds ? this.getRegistrosRel(diente, 'pieza') : this.getRegistrosRelAnterior(diente, 'pieza');
        }

        let titulo = `<strong>Diente ${this.popOverText.concepto.term}</strong>`;
        titulo += this.popOverText.cara && this.popOverText.cara !== 'pieza' && this.popOverText.cara !== 'anulada' ? ` (cara ${this.popOverText.cara})` : '';


        let texto = '';
        if (this.popOverText.relacion && this.popOverText.relacion.length > 0) {
            this.popOverText.relacion.forEach(relacion => {
                texto += `<div>${moment(relacion.createdAt).format('DD/MM/YYYY')}: (${relacion.concepto.semanticTag}) ${relacion.concepto.term} </div>`;
            });
        }

        this.popOverText.cara = cara;
        this.showPopOver = true;
        this.showRelacion = true;

    }

    // (mouseenter)
    showTooltip(diente, cara, huds = false, index = -1) {
        this.popOverText = {};
        if (cara !== 'pieza') {
            diente.piezaCompleta = false;
        } else {
            diente.piezaCompleta = true;
        }

        this.popOverText = diente;

        if (cara !== 'anulada') {
            let rel = !huds ? this.getRegistrosRel(diente, cara) : this.getRegistrosRelAnterior(diente, cara);
            if (rel.length) {
                this.popOverText.relacion = rel[index];
            } else {
                this.popOverText.relacion = {};
                // Sólo para piezas
            }
        }
        if (diente.piezaCompleta) {
            this.popOverText['relacion'] = !huds ? this.getRegistrosRel(diente, 'pieza')[index] : this.getRegistrosRelAnterior(diente, 'pieza')[index];
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

    tieneEvolucion(diente, cara) {
        if (this.ultimoOdontograma.valor && this.ultimoOdontograma.valor.piezas) {
            return this.ultimoOdontograma.valor.piezas.findIndex(y => y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara) !== -1;
        }
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

    getRegistrosRel(diente, cara) {
        return this.relaciones.filter(x => {
            if (x.relacionadoCon) {
                return x.relacionadoCon.find(y => {
                    if (y && y.concepto) {
                        return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                    }
                });
            }
        });
    }

    getRegistrosEjecucion(diente, cara) {
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

    getClassRegistro(diente, cara) {
        if (this.prestacion.ejecucion.registros.length) {
            return this.prestacion.ejecucion.registros.find(x => {
                if (x.relacionadoCon) {
                    if (x.esSolicitud) {
                        x.concepto.semanticTag = 'plan';
                    }
                    return x.relacionadoCon.find(y => {
                        if (y && y.concepto && y.cara) {
                            return y.concepto.conceptId === diente.concepto.conceptId && y.cara === cara;
                        }
                    });
                }
            });
        }
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
        if (this.registro.valor && this.registro.valor.piezas && this.registro.valor.piezas.length) {
            return this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === diente.concepto.conceptId && x.cara === 'pieza');
        }
        return -1;
    }

    seleccionarDiente(diente, cara) {

        let index = this.cara(diente, cara);

        // No está seleccionado?
        if (index === -1) {

            // El seeleccionado es este
            const dienteSel = JSON.parse(JSON.stringify({ diente: diente, cara: cara }));

            // Selección múltiple activada?
            if (this.seleccionMultiple) {
                // Agregamos al array de seleecionados
                this.piezasSeleccionadas = [...this.piezasSeleccionadas, dienteSel];
            } else {
                // Actualizamos el array de seleecionados a esta sola pieza/cara
                this.piezasSeleccionadas = [dienteSel];
            }

            dienteSel.diente.cara = cara;

            // No es pieza completa (ver seleccionarPieza())
            dienteSel.piezaCompleta = false;

            this.prestacion.ejecucion.registros[0].valor = {
                odontograma: this.odontograma
            };

        } else {

            this.piezasSeleccionadas.splice(index, 1);
            this.piezasSeleccionadas = [...this.piezasSeleccionadas];

        }

        this.prestacionesService.setRefSetData(this.piezasSeleccionadas.map(x => x.diente), this.params.refsetId);
    }

    relacionesOdontograma() {
        if (this.prestacion.ejecucion.registros.length > 1) {
            return this.prestacion.ejecucion.registros[1].relacionadoCon.map(x => x = { diente: x.concepto.conceptId, cara: x.cara });
        } else {
            return [];
        }
    }

    seleccionarPieza(diente) {
        let index = this.piezaCompleta(diente, 'pieza');

        if (index === -1) {
            const dienteSel = JSON.parse(JSON.stringify({ diente: diente, cara: 'pieza' }));
            dienteSel.piezaCompleta = true;
            dienteSel.diente.cara = 'pieza';

            if (!this.seleccionMultiple) {
                this.piezasSeleccionadas = [dienteSel];
            } else {
                this.piezasSeleccionadas = [...this.piezasSeleccionadas, dienteSel];
            }

            this.prestacion.ejecucion.registros[0].valor = {
                odontograma: this.odontograma
            };

            this.prestacionesService.setRefSetData(this.piezasSeleccionadas.map(x => x.diente), this.params.refsetId);

        } else {

            this.piezasSeleccionadas.splice(index, 1);
            this.piezasSeleccionadas = [...this.piezasSeleccionadas];
            this.prestacionesService.setRefSetData(this.piezasSeleccionadas.map(x => x.diente), this.params.refsetId);

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

    limpiarSeleccion() {
        this.piezasSeleccionadas = [];
        this.registro.valor.piezas = [];
        this.prestacionesService.clearRefSetData();
    }

    estaSeleccionada(diente, cara) {
        return this.piezasSeleccionadas.findIndex(x => x.diente.concepto.conceptId === diente.concepto.conceptId && x.cara === cara) !== -1;
    }

    comprobarSelecciones() {
        for (let item of this.piezasSeleccionadas) {
            if (this.registro.valor.piezas) {
                let indexSeleccionada = this.registro.valor.piezas.findIndex(x => x.concepto.conceptId === item.concepto.conceptId && x.cara === item.cara);
                if (indexSeleccionada !== -1) {
                    this.registro.valor.piezas.splice(indexSeleccionada, 1);
                }
            }
        }
        return false;
    }

    limpiarVinculaciones(e) {
        if (this.registro.valor.piezas) {
            this.registro.valor.piezas.filter(x => x.concepto.conceptId === e.conceptId);
        }
    }

    toggleOcultarTemporales() {
        this.ocultarTemporales = !this.ocultarTemporales;
    }

    esCuadranteIzquierdo(cuadrante) {
        return cuadrante.indexOf('Izquierdo') === -1;
    }

    esCuadranteInferior(cuadrante) {
        return cuadrante.indexOf('Inferior') === -1;
    }

    seleccionarUnaPieza(diente, cuadrante) {
        this.jumpToId(this.getClassRegistro(diente, (this.esCuadranteIzquierdo(cuadrante) ? 'distal' : 'mesial')).concepto.conceptId);
        this.showTooltip(diente, (this.esCuadranteIzquierdo(cuadrante) ? 'distal' : 'mesial'), false, 0);
    }
}
