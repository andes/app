import { IElementoRUP } from './../../interfaces/elementoRUP.interface';
import { ISnomedConcept } from './../../interfaces/snomed-concept.interface';
import { IPrestacion } from './../../interfaces/prestacion.interface';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { Plex } from '@andes/plex';

@Component({
    selector: 'rup-OdontogramaRefset',
    templateUrl: 'OdontogramaRefset.html',
    styleUrls: [
        'OdontogramaRefset.scss'
    ]
})
export class OdontogramaRefsetComponent extends RUPComponent implements OnInit {

    piezasSeleccionadas: { diente: any; }[] = [];
    // @Output() emitConcepto: EventEmitter<any> = new EventEmitter<any>();

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
            ]
        };

    public cuadranteSuperiorDerecho = [
        {

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
        },
        {

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
        },
        {

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
        },
        {

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
        },
        {

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
        },
        {

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
        },
        {

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
        },
        {

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
    ];

    prestacionDienteSeleccionada: any;
    prestacionCaraSeleccionada: any;

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

    loadPrestacionesDientes($event, tipo) {
        let conceptosSelect = this[tipo].conceptos.map(elem => {
            return { id: elem.conceptId, nombre: elem.term, concepto: elem, timestamp: new Date().getTime() };
        });

        $event.callback(conceptosSelect);
    }


    seleccionarDiente(diente, cara) {
        // this.emitEjecutarAccion({ tipoAccion: 'eliminarRegistro', opciones: 'card' });
        if (cara === 'pieza') {
            let index = this.piezaCompleta(diente);
            diente.piezaCompleta = true;
            delete diente.cara;

            if (index === -1) {
                this.piezasSeleccionadas = [...this.piezasSeleccionadas, { diente: diente.concepto }];
                // this.registro.relacionadoCon = [...this.registro.relacionadoCon, diente];
                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];
                piezas.push({
                    concepto: diente.concepto,
                    cara: cara
                });
                this.registro.valor = {
                    piezas: piezas
                };
            } else {
                this.piezasSeleccionadas.splice(index, 1);
                // this.registro.relacionadoCon.splice(index, 1);

            }
            this.piezaSeleccionada = this.prestacionesDientes;
        } else {
            let index = this.seleccionado(diente, cara);
            if (index === -1) {
                this.carasSeleccionadas = [...this.carasSeleccionadas, { diente: diente.concepto, cara: cara }];
                diente.cara = cara;
                diente.piezaCompleta = false;

                // this.registro.relacionadoCon = [...this.registro.relacionadoCon, diente];
                let piezas = (this.registro.valor && this.registro.valor.piezas) ? this.registro.valor.piezas : [];
                piezas.push({
                    concepto: diente.concepto,
                    cara: cara
                });
                this.registro.valor = {
                    piezas: piezas
                };
            } else {
                this.carasSeleccionadas.splice(index, 1);
                // this.registro.relacionadoCon.splice(index, 1);
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

}
