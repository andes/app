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

    sexos: any;

    constructor(public plex: Plex, public auth: Auth, public llaveTipoPrestacionService: LlavesTipoPrestacionService, public serviceTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {

        this.sexos = enumerados.getObjSexos;

        if (this.llaveTPSeleccionada && typeof this.llaveTPSeleccionada !== 'undefined') {
            this.modelo = this.llaveTPSeleccionada;
        } else {
            console.log('this.llaveTPSeleccionada: ', this.llaveTPSeleccionada);
            this.modelo = {
                organizacion: this.auth.organizacion,
                llave: {
                    edad: {},
                    solicitud: {
                        requerida: false
                    }
                }
            };
            console.log('this.modelo: ', this.modelo);
        }
    }

    guardarLlaveTP() {

        console.log(this.modelo.id);


        if (this.modelo.llave.sexo) {
            delete this.modelo.llave.sexo.$order;
            this.modelo.llave.sexo = this.modelo.llave.sexo.id;
        } else {
            delete this.modelo.llave.sexo;
        }

        // PUT/UPDATE
        if (this.modelo.id) {

            delete this.modelo.id;
            delete this.modelo.createdBy;
            delete this.modelo.createdAt;

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

}