import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from './../../interfaces/snomed-concept.interface';
import { IPrestacion } from './../../interfaces/prestacion.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { Plex } from '@andes/plex';

@Component({
    selector: 'rup-OdontogramaRefset',
    templateUrl: 'OdontogramaRefset.html'
})
export class OdontogramaRefsetComponent extends RUPComponent implements OnInit {

    // @Output() emitConcepto: EventEmitter<any> = new EventEmitter<any>();

    public caraSeleccionada: any;
    public carasSeleccionadas: { diente: any; cara: any; }[] = [];
    public conceptos: any[] = [];

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
            ]
        };

    public cuadranteSuperiorDerecho = [
        {
            valor: {
                registros: [],

                concepto: {
                    conceptId: '48402004',
                    term: 'diente 18',
                    fsn: 'estructura del segundo molar mandibular izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '446608001',
                        '900000000000497000',
                        '734138000'
                    ],
                    ISODesignation: 37
                }
            }
        },
        {
            valor: {
                concepto: {
                    conceptId: '74344005',
                    term: 'diente 17',
                    fsn: 'estructura del tercer molar mandibular izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '446608001',
                        '900000000000497000',
                        '734138000'
                    ],
                    ISODesignation: 38
                }
            }
        },
        {
            valor: {
                concepto: {
                    conceptId: '87704003',
                    term: 'diente 16',
                    fsn: 'estructura del tercer molar maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '446608001',
                        '900000000000497000',
                        '734138000'
                    ],
                    ISODesignation: 28
                }
            }
        },
        {
            valor: {
                concepto: {
                    conceptId: '66303006',
                    term: 'diente 15',
                    fsn: 'estructura del segundo molar maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '446608001',
                        '900000000000497000',
                        '734138000'
                    ],
                    ISODesignation: 27
                }
            }
        },
        {
            valor: {
                concepto: {
                    conceptId: '23427002',
                    term: 'diente 14',
                    fsn: 'estructura del primer molar maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '900000000000497000',
                        '446608001',
                        '734138000'
                    ],
                    ISODesignation: 26
                }
            }
        },
        {
            valor: {
                concepto: {
                    fsn: 'estructura del segundo premolar maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '446608001',
                        '900000000000497000',
                        '734138000'
                    ],
                    conceptId: '23226009',
                    term: 'diente 13',
                    ISODesignation: 25
                }
            }
        },
        {
            valor: {
                concepto: {
                    fsn: 'estructura del primer premolar maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '900000000000497000',
                        '446608001',
                        '734138000'
                    ],
                    conceptId: '61897005',
                    term: 'diente 12',
                    ISODesignation: 24
                }
            }
        },
        {
            valor: {
                concepto: {
                    fsn: 'estructura del canino maxilar izquierdo (estructura corporal)',
                    semanticTag: 'estructura corporal',
                    refsetIds: [
                        '721145008',
                        '900000000000497000',
                        '446608001',
                        '734138000'
                    ],
                    conceptId: '72876007',
                    term: 'diente 11',
                    ISODesignation: 23
                }
            }
        }
    ];

    prestacionSeleccionada: any;

    // Hace falta un valor único para usar como nombre de cada grupo de radiobutton
    public unique: number = new Date().getTime();


    ngOnInit() {
        if (this.params) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptos = resultado;
            });

            this.prestacionesDientes = this.elementosRUPService.buscarElemento(this.prestacionesDientes.conceptos[0], false);

        }
    }

    loadPrestacionesDientes($event) {
        let conceptosSelect = this.prestacionesDientes.conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() };
        });

        // let conceptosSelect = this.prestacionesDientes.map(elem => {
        //     return { id: elem.concepto.conceptId, nombre: elem.concepto.term, concepto: elem.concepto, componente: 'ObservacionesComponent', timestamp: new Date().getTime() };
        // });
        // this.prestacionSeleccionada = this.prestacionesDientes;
        $event.callback(conceptosSelect);
    }

    // loadConceptos($event) {
    //     let conceptosSelect = this.conceptos.map(elem => {
    //         return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() };
    //     });
    //     $event.callback(conceptosSelect);
    // }
    // selectRadio(concepto) {
    //     this.registro.valor = { concepto: concepto };
    // }

    seleccionarCara(diente, cara) {
        if (cara === 'pieza') {

        } else {
            this.carasSeleccionadas = [...this.carasSeleccionadas, { diente: diente.valor.concepto.conceptId, cara: cara }];
            let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];
            piezas.push({
                conceptId: diente.valor.concepto.conceptId,
                cara: cara
            });
            this.registro.valor = {
                piezas: piezas
            };
            this.registro.relacionadoCon.push(diente.valor);
            this.caraSeleccionada = this.prestacionesDientes;
        }
    }

    seleccionado(diente, cara) {
        return this.carasSeleccionadas.find(x => x.diente === diente.valor.concepto.conceptId && x.cara === cara);
    }

    seleccionarPrestacion() {
        console.log(this.prestacionSeleccionada);
        // this.emitConcepto.emit(this.modelo.prestacionSeleccionada);
        this.emitChange(this.prestacionesDientes);
    }

}
