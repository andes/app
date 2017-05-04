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
        this.showAgregarNotaTurno = true;
    }
    get llaveTPSeleccionada(): any {
        return this._llaveTPSeleccionada;
    }

    showAgregarNotaTurno: Boolean = false;

    modelo: any;
    tipoPrestaciones: any[];
    resultado: any;
    permisos = [];

    hoy = new Date();

    constructor(public plex: Plex, public auth: Auth, public llaveTipoPrestacionService: LlavesTipoPrestacionService, public serviceTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        this.showAgregarNotaTurno = true;
    }

    guardarLlaveTP() {

        this.llaveTipoPrestacionService.put(this.llaveTPSeleccionada).subscribe(resultado => {

            this.plex.alert('La configuración de llaves se guardó correctamente');

            this.saveLlaveTP.emit(resultado);
        },
        err => {
            if (err) {
                console.log(err);
            }
        });

    }

    cancelar() {
        this.cancelaEditarLlaveTP.emit(true);
        this.showAgregarNotaTurno = false;
    }

    loadTipoPrestaciones(event) {
        this.serviceTipoPrestacion.get({ turneable: 1 }).subscribe(event.callback);
    }

    loadSexo(event) {
        event.callback(enumerados.getObjSexos());
    }

}