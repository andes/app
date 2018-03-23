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
    public prestaciones = [];
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
        console.log('solicitudes ', this.prestaciones);
        return this.prestaciones.findIndex(x => x.id === solicitud._id);
    }

    seleccionar(indice) {
        // let prestacion = this.prestaciones[indice];
        // for (let i = 0; i < this.prestaciones.length; i++) {
        //     this.prestaciones[i].seleccionada = false;
        //     this.DT[i] = false;
        //     this.visualizar[i] = false;
        //     this.Auditar[i] = false;
        // }
        // console.log('prestacion ', prestacion);
        this.prestaciones[indice].seleccionada = true;
        // switch (prestacion.estados[prestacion.estados.length - 1].tipo) {
        //     case 'pendiente':
        //         this.Auditar[indice] = false;
        //         if (prestacion.solicitud.turno !== null) {
        //             this.visualizar[indice] = true;
        //         } else {
        //             this.DT[indice] = true;
        //             this.visualizar[indice] = false;
        //         }
        //         break;
        //     case 'pendiente auditoria':
        //         this.DT[indice] = false;
        //         this.visualizar[indice] = false;
        //         this.Auditar[indice] = true;
        //         if (prestacion.solicitud.turno !== null) {
        //             this.visualizar[indice] = true;
        //         } else {
        //             this.visualizar[indice] = false;
        //         }
        //         break;
        //     default:
        //         if (prestacion.solicitud.turno !== null) {
        //             this.visualizar[indice] = true;
        //         }
        //         this.DT[indice] = false;
        //         this.Auditar[indice] = false;
        //         break;
        // }
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
        if (this.fechaDesde && this.fechaHasta) {
            let params = {
                estado: 'pendiente',
                solicitudDesde: moment(this.fechaDesde).startOf('day'),
                solicitudHasta: moment(this.fechaHasta).endOf('day')
            };
            this.servicioPrestacion.get(params).subscribe(resultado => {
                this.prestaciones = resultado;
                for (let i = 0; i < this.prestaciones.length; i++) {

                    switch (this.prestaciones[i].estados[this.prestaciones[i].estados.length - 1].tipo) {
                        case 'pendiente':
                            this.Auditar[i] = false;
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                this.visualizar[i] = true;
                            } else {
                                this.DT[i] = true;
                                this.visualizar[i] = false;
                            }
                            break;
                        case 'pendiente auditoria':
                            this.DT[i] = false;
                            this.visualizar[i] = false;
                            this.Auditar[i] = true;
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                this.visualizar[i] = true;
                            } else {
                                this.visualizar[i] = false;
                            }
                            break;
                        default:
                            if (this.prestaciones[i].solicitud.turno !== null) {
                                this.visualizar[i] = true;
                            }
                            this.DT[i] = false;
                            this.Auditar[i] = false;
                            break;
                    }
                }
                console.log('prestaciones ', this.prestaciones);
            }, err => {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
}
