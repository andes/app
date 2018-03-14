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
    public DT = [];
    public Auditar = [];
    public visualizar = [];
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

    seleccionar(indice) {
        let solicitud = this.solicitudes[indice];
        for (let i = 0; i < this.solicitudes.length; i++) {
            this.solicitudes[i].seleccionada = false;
            this.DT[i] = false;
            this.visualizar[i] = false;
            this.Auditar[i] = false;
        }
        solicitud.seleccionada = true;
        switch (solicitud.estados[solicitud.estados.length - 1].tipo) {
            case 'pendiente':
                this.Auditar[indice] = false;
                if (solicitud.turno !== null) {
                    this.visualizar[indice] = true;
                } else {
                    this.DT[indice] = true;
                    this.visualizar[indice] = false;
                }
                break;
            case 'pendiente auditoria':
                this.DT[indice] = false;
                this.visualizar[indice] = false;
                this.Auditar[indice] = true;
                if (solicitud.turno !== null) {
                    this.visualizar[indice] = true;
                } else {
                    this.visualizar[indice] = false;
                }
                break;
            default:
                if (solicitud.turno !== null) {
                    this.visualizar[indice] = true;
                }
                this.DT[indice] = false;
                this.Auditar[indice] = false;
                break;
        }
    }

    darTurno() {
        // Pasar filtros al calendario
    }

    auditar() {

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
                    turno: null,
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
                },
                {
                    id: 3,
                    fecha: 'Wed Feb 14 2018 11:15:52 GMT-0300 (ART)',
                    turno: null,
                    organizacionOrigen: {
                        id: '57fcf037326e73143fb48c3a',
                        nombre: 'CENTRO DE SALUD PROGRESO'
                    },
                    organizacionDestino: {
                        id: '57e9670e52df311059bc8964',
                        nombre: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON'
                    },
                    profesionalOrigen: {
                        documento: '22851614',
                        apellido: 'GARCIA',
                        nombre: 'ESTEBAN OSMAR',
                        id: '58f74fd4d03019f919ea1298'
                    },
                    tipoPrestacion: {
                        id: '598ca8375adc68e2a0c121e5',
                        conceptId: '551000013105',
                        term: 'consulta de salud mental',
                        fsn: 'consulta de salud mental',
                        semanticTag: 'procedimiento'
                    },
                    paciente: {
                        id: '59e5e01b27b2173491bdfa50',
                        documento: '93090185',
                        apellido: 'PALACIOS SEGUEL',
                        nombre: 'MYRIAN DEL TRANSITO',
                        sexo: 'femenino',
                        fechaNacimiento: '1954-08-15T00:00:00.000-03:00'
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
                            tipo: 'pendiente auditoria',
                            id: '5a96edf4fb83f14b3ba3224d',
                            idOrigenModifica: null
                        }
                    ]
                }
            ]
            //     console.log('solicitudes ', this.solicitudes);
        }
        // this.servicioPrestacion.get(params).subscribe(resultado => {
        //     this.solicitudes = resultado;
        // }, err => {
        //     if (err) {
        //         console.log(err);
        //     }
        // });
    }
}
