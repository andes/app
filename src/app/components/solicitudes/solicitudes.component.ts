import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@andes/auth';
import { Plex, SelectEvent } from '@andes/plex';
import { PrestacionesService } from '../../modules/rup/services/prestaciones.service';
import * as moment from 'moment';

@Component({
    selector: 'solicitudes',
    templateUrl: './solicitudes.html',
})
export class SolicitudesComponent implements OnInit {
    public solicitudes = [];
    public fechaDesde: Date = new Date();
    public fechaHasta: Date = new Date();
    constructor(private auth: Auth, private plex: Plex,
        private router: Router, public servicioPrestacion: PrestacionesService) { }

    ngOnInit() {
        // this.cargarSolicitudes();
    }

    refreshSelection(value, tipo) {
        return true;
    }

    estaSeleccionada(solicitud: any) {
        console.log('solicitud ', solicitud);
        console.log('solicitudes ', this.solicitudes);
        return this.solicitudes.findIndex(x => x.id === solicitud._id);
    }

    seleccionar(solicitud) {
    }

    cargarSolicitudes() {

        // Solicitudes que no tienen prestacionOrigen ni turno
        // Si tienen prestacionOrigen son generadas por RUP y no se listan
        // Si tienen turno, dejan de estar pendientes de turno y no se listan
        let params = {
            solicitudDesde: this.fechaDesde,
            solicitudHasta: this.fechaHasta,
            tienePrestacionOrigen: 'no',
            tieneTurno: 'no',
            estado: 'pendiente'
        };
        if (this.fechaDesde && this.fechaHasta) {

            this.solicitudes = [
                {
                    id: 1,
                    fecha: 'Mon Feb 26 2018 11:15:52 GMT-0300 (ART)',
                    turno: '5a69ef990577c50523b9af7a',
                    organizacionOrigen: {
                        id: '57f67d090166fa6aedb2f9fb',
                        nombre: 'HOSPITAL DE AREA CENTENARIO - DR. NATALIO BURD'
                    },
                    organizacionDestino: {
                        id: '57e9670e52df311059bc8964',
                        nombre: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON'
                    },
                    profesionalOrigen: {
                        documento: '17046369',
                        apellido: 'LOPEZ',
                        nombre: 'MARICEL ETHEL',
                        id: '58f74fd3d03019f919ea0957'
                    },
                    tipoPrestacion: {
                        conceptId: '621000013102',
                        fsn: 'Consulta de traumatologia de columna (procedimiento)',
                        id: '59ee2d9bf00c415246fd3d82',
                        refsetIds: [],
                        semanticTag: 'procedimiento',
                        term: 'Consulta de traumatologia de columna'
                    },
                    paciente: {
                        id: '586e6e8f27d3107fde14b368',
                        nombre: 'VERONICA AGNES',
                        apellido: 'HERNANDEZ SOTO',
                        documento: '92258444',
                        sexo: 'femenino',
                        fechaNacimiento: '1971-02-05T00:00:00.000-03:00'
                    },
                    estados: [
                        {
                            createdBy: {
                                organizacion: {
                                    id: '57e9670e52df311059bc8964',
                                    nombre: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
                                },
                                documento: 18546703,
                                username: 18546703,
                                apellido: 'FONSECA',
                                nombre: 'DOMINGA',
                                nombreCompleto: 'DOMINGA FONSECA'
                            },
                            createdAt: '2018-02-28T14:59:16.212-03:00',
                            tipo: 'pendiente',
                            id: '5a96edf4fb83f14b3ba3224d',
                            idOrigenModifica: null
                        }
                    ]
                },
                {
                    id: 2,
                    fecha: 'Fri Feb 16 2018 11:15:52 GMT-0300 (ART)',
                    turno: '5a69ef990577c50523b9af7a',
                    organizacionOrigen: {
                        id: '57fcf037326e73143fb48c3a',
                        nombre: 'CENTRO DE SALUD PROGRESO'
                    },
                    organizacionDestino: {
                        id: '57e9670e52df311059bc8964',
                        nombre: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON'
                    },
                    profesionalOrigen: {
                        documento: '20821052',
                        apellido: 'ARANEO',
                        nombre: 'SILVIA LAURA',
                        id: '58f74fd3d03019f919ea0e9e'
                    },
                    profesionalDestino: {
                        documento: '26776993',
                        apellido: 'ENTRENA',
                        nombre: 'NICOLAS ALEJANDRO',
                        id: '58f74fd4d03019f919ea1b48'
                    },
                    tipoPrestacion: {
                        conceptId: '451000013109',
                        fsn: 'consulta de traumatología general',
                        id: '598ca8375adc68e2a0c121c5',
                        semanticTag: 'procedimiento',
                        term: 'consulta de traumatología general'
                    },
                    paciente: {
                        id: '586e6e8827d3107fde121797',
                        nombre: 'ROQUE ELBIO',
                        apellido: 'OCAMPO',
                        documento: '16107158',
                        sexo: 'masculino',
                        fechaNacimiento: '1963-04-21T00:00:00.000-03:00',
                    },
                    estados: [
                        {
                            createdBy: {
                                organizacion: {
                                    id: '57e9670e52df311059bc8964',
                                    nombre: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
                                },
                                documento: 18546703,
                                username: 18546703,
                                apellido: 'FONSECA',
                                nombre: 'DOMINGA',
                                nombreCompleto: 'DOMINGA FONSECA'
                            },
                            createdAt: '2018-02-28T14:59:16.212-03:00',
                            tipo: 'pendiente',
                            id: '5a96edf4fb83f14b3ba3224d',
                            idOrigenModifica: null
                        }
                    ]
                }
            ];
        }
        // this.servicioPrestacion.get(params).subscribe(resultado => {
        //     this.solicitudes = resultado;
        //     console.log('solicitudes ', this.solicitudes);
        // }, err => {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
    }
}
