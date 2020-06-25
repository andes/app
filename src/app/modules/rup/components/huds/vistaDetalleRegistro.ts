import { Component, OnInit, ViewEncapsulation, Input, OnChanges } from '@angular/core';
import { IElementoRUP } from '../../interfaces/elementoRUP.interface';
import { IPrestacion } from '../../interfaces/prestacion.interface';

@Component({
    selector: 'vista-detalle-registro',
    templateUrl: 'vistaDetalleRegistro.html',
    styleUrls: [
        `../elementos/OdontogramaRefset.scss`,
        `../variables.scss`,
        'vistaDetalleRegistro.scss'
    ]
})

export class VistaDetalleRegistroComponent implements OnChanges {

    @Input() detalleRegistros: any;
    @Input() detalleConcepto: any;
    @Input() tipo: any;
    @Input() indice = 0;
    historial: any[] = [];
    relaciones: any[] = [];

    constructor() { }

    ngOnChanges() {
        this.historial = [];
        this.relaciones = [];
        this.detalleRegistros.map(huds => {
            return huds.ejecucion.registros.map(registros => {
                return registros.relacionadoCon.map(relacion => {
                    if (relacion.concepto.conceptId === this.detalleConcepto.concepto.conceptId) {
                        this.historial.push(registros);
                    }
                });
            });
        });

        this.detalleRegistros.forEach(unaConsulta => {
            let registros = unaConsulta.ejecucion.registros.filter(c => c.concepto.conceptId !== '3561000013109');
            this.relaciones = [...this.relaciones, ...registros];
        });



        this.relaciones = this.relaciones.map(x => {
            return ({
                conceptos: x.relacionadoCon.filter(y => {
                    return y.concepto.conceptId === this.detalleConcepto.concepto.conceptId;
                }).map(z =>
                    z = ({ ...z, ...x.concepto, ...{ createdAt: x.createdAt }, ...{ updatedAt: x.updatedAt }, ...{ profesional: x.createdBy } }))
            });
        });

        this.relaciones = this.relaciones.reduce((acc, val) => acc.concat(val.conceptos), []).sort((a, b) => b.createdAt - a.createdAt);

    }


    getRegistrosRelAnterior(st, cara) {
        return this.relaciones.find(x => {
            if (x.relacionadoCon) {
                return x.relacionadoCon.find(y => {
                    return y.cara === cara;
                });
            }
        });
    }

    datosPieza(registro, cara) {
        return registro.relacionadoCon.find(x => x.cara === cara);
    }

    mostrarRegistro(idx) {
        this.detalleConcepto['cara'] = this.relaciones[idx].cara;
        this.detalleConcepto['relacion'] = this.relaciones[idx];
        this.detalleConcepto['relacion']['concepto'] = {
            term: this.relaciones[idx].term,
            fsn: this.relaciones[idx].fsn,
            conceptId: this.relaciones[idx].conceptId,
            semanticTag: this.relaciones[idx].semanticTag
        };
        this.detalleConcepto['createdAt'] = this.relaciones[idx].createdAt;
        this.detalleConcepto['updatedAt'] = this.relaciones[idx].updatedAt;

    }

    estaSeleccionado(seleccion, actual) {
        return seleccion.cara === actual.cara && seleccion.semanticTag === actual.relacion.semanticTag;
    }

    esCuadranteIzquierdo(cuadrante) {
        return cuadrante.indexOf('Izquierdo') > -1;
    }

    esCuadranteInferior(cuadrante) {
        return cuadrante.indexOf('Inferior') > -1;
    }

}

