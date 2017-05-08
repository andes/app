import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { ILlavesTipoPrestacion } from './../../../interfaces/llaves/ILlavesTipoPrestacion';
import { LlavesTipoPrestacionService } from './../../../services/llaves/llavesTipoPrestacion.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import * as enumerados from './../../../utils/enumerados';

@Component({
    selector: 'editar-llaves-tipoPrestacion',
    templateUrl: 'editar-llaves-tipoPrestacion.html'
})

export class EditarLlavesTipoPrestacionComponent implements OnInit {

    @Output() cancelaEditarLlaveTP = new EventEmitter<boolean>();
    @Output() saveLlaveTP = new EventEmitter<ILlavesTipoPrestacion>();

    private _llaveTPSeleccionada: Array<any>;

    @Input('llaveTPSeleccionada')
    set llaveTPSeleccionada(value: any) {
        this._llaveTPSeleccionada = value;
        this.modelo = this._llaveTPSeleccionada;
    }
    get llaveTPSeleccionada(): any {
        return this._llaveTPSeleccionada;
    }

    modelo: any = {};
    tipoPrestaciones: any[];
    resultado: any;
    permisos = [];

    hoy = new Date();

    constructor(public plex: Plex, public auth: Auth, public llaveTipoPrestacionService: LlavesTipoPrestacionService, public serviceTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        this.modelo = {
            organizacion: this.auth.organizacion,
            llave: {
                edad: {
                    desde: {
                        valor: 0,
                        unidad: null
                    },
                    hasta: {
                        valor: 0,
                        unidad: null
                    }
                },
                solicitud: {
                    requerida: false
                }
            }
        }
    }


    guardarLlaveTP($event) {

        if ($event.formValid) {

            if (this.modelo.llave.sexo) {
                delete this.modelo.llave.sexo.$order;
                this.modelo.llave.sexo = this.modelo.llave.sexo.id;
            } else {
                delete this.modelo.llave.sexo;
            }

            if (this.modelo.llave.edad.desde.unidad) {
                delete this.modelo.llave.edad.desde.unidad.$order;
                this.modelo.llave.edad.desde.unidad = this.modelo.llave.edad.desde.unidad.id;
            } else {
                delete this.modelo.llave.edad.desde;
            }

            if (this.modelo.llave.edad.hasta.unidad) {
                delete this.modelo.llave.edad.hasta.unidad.$order;
                this.modelo.llave.edad.hasta.unidad = this.modelo.llave.edad.hasta.unidad.id;
            } else {
                delete this.modelo.llave.edad.hasta;
            }

            if (this.modelo.llave.edad.desde && this.modelo.llave.edad.hasta) {
                if ((this.modelo.llave.edad.desde.valor === this.modelo.llave.edad.hasta.valor) && (this.modelo.llave.edad.desde.unidad === this.modelo.llave.edad.hasta.unidad)) {
                    $event.formValid = false;
                    return;
                }
            }

            // PUT/UPDATE
            if (this.modelo.id) {

                console.log(this.modelo);

                this.llaveTipoPrestacionService.put(this.modelo).subscribe(resultado => {
                    this.saveLlaveTP.emit(resultado);
                    this.plex.alert('La configuración de llaves se guardó correctamente');
                },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    });

                // POST/NEW
            } else {

                this.llaveTipoPrestacionService.post(this.modelo).subscribe(resultado => {
                    this.saveLlaveTP.emit(resultado);
                    this.plex.alert('La configuración de llaves se guardó correctamente');
                },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    });
            }

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }


    }

    cancelar() {
        this.cancelaEditarLlaveTP.emit(true);
    }

    loadTipoPrestaciones(event) {
        this.serviceTipoPrestacion.get({ turneable: 1 }).subscribe(event.callback);
    }

    loadSexo(event) {
        event.callback(enumerados.getObjSexos());
    }

    loadUnidadesEdad(event) {
        event.callback(enumerados.getObjUnidadesEdad())
    }

}