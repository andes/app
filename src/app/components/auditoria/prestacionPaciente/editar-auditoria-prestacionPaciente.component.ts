import { PrestacionesService } from './../../../modules/rup/services/prestaciones.service';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { ILlavesTipoPrestacion } from './../../../interfaces/llaves/ILlavesTipoPrestacion';
import { LlavesTipoPrestacionService } from './../../../services/llaves/llavesTipoPrestacion.service';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import * as enumerados from './../../../utils/enumerados';
import { AuditoriaPrestacionPacienteService } from '../../../services/auditoria/auditoriaPrestacionPaciente.service';
import { IAuditoriaPrestacionPaciente } from '../../../interfaces/auditoria/IAuditoriaPrestacionPaciente';

@Component({
    selector: 'editar-auditoria-prestacionPaciente',
    templateUrl: 'editar-auditoria-prestacionPaciente.html'
})

export class EditarAuditoriaPrestacionPacienteComponent implements OnInit {

    @Output() cancelaEditarAuditoriaPP = new EventEmitter<boolean>();
    @Output() saveAuditoriaPP = new EventEmitter<IAuditoriaPrestacionPaciente>();

    private _auditoriaPPSeleccionada: Array<any>;

    @Input('auditoriaPPSeleccionada')
    set auditoriaPPSeleccionada(value: any) {
        this._auditoriaPPSeleccionada = value;
        this.modelo = value;
        // this.comprobarUnidades();
        // if (this.modelo.id) {
        //     this.llaveSelect = {
        //         id: this.modelo.solicitud.tipoPrestacion.id,
        //         // nombre: this.modelo.tipoPrestacion.nombre
        //     };
        // }
    }
    get auditoriaPPSeleccionada(): any {
        return this._auditoriaPPSeleccionada;
    }

    modelo: any = {};
    llaveSelect: any = {};
    permisos = [];
    showEditarAuditoria = false;
    unidadesValidas = true;

    constructor(
        public plex: Plex,
        public auth: Auth,
        public prestacionPacienteService: PrestacionesService,
        public serviceTipoPrestacion: TipoPrestacionService,
        private auditoriaPrestacionPacienteService: AuditoriaPrestacionPacienteService) { }

    ngOnInit() {
        this.modelo = this.auditoriaPPSeleccionada;
        this.showEditarAuditoria = true;
    }

    guardarAuditoriaPP($event) {

        if (!this.unidadesValidas) {
            $event.formValid = false;
        }

        if ($event.formValid) {

            this.showEditarAuditoria = false;

            // if (this.modelo.llave.sexo) {
            //     delete this.modelo.llave.sexo.$order;
            //     this.modelo.llave.sexo = this.modelo.llave.sexo.id;
            // } else {
            //     delete this.modelo.llave.sexo;
            // }

            // if (this.modelo.llave.edad.desde.unidad) {
            //     if (this.modelo.llave.edad.desde.unidad.$order) {
            //         delete this.modelo.llave.edad.desde.unidad.$order;
            //         this.modelo.llave.edad.desde.unidad = this.modelo.llave.edad.desde.unidad.id;
            //     }
            // } else {
            //     delete this.modelo.llave.edad.desde;
            // }

            // if (this.modelo.llave.edad.hasta.unidad) {
            //     if (this.modelo.llave.edad.hasta.unidad.$order) {
            //         delete this.modelo.llave.edad.hasta.unidad.$order;
            //         this.modelo.llave.edad.hasta.unidad = this.modelo.llave.edad.hasta.unidad.id;
            //     }
            // } else {
            //     delete this.modelo.llave.edad.hasta;
            // }

            // if (this.modelo.llave.solicitud.vencimiento.unidad) {
            //     if (this.modelo.llave.solicitud.vencimiento.unidad.$order) {
            //         delete this.modelo.llave.solicitud.vencimiento.unidad.$order;
            //         this.modelo.llave.solicitud.vencimiento.unidad = this.modelo.llave.solicitud.vencimiento.unidad.id;
            //     }
            // } else {
            //     delete this.modelo.llave.edad.vencimiento;
            // }

            // if (this.modelo.llave.solicitud.requerida === false) {
            //     delete this.modelo.llave.solicitud;
            // }

            // PUT/UPDATE
            if (this.modelo.id) {

                this.prestacionPacienteService.put(this.modelo).subscribe(resultado => {
                    // this.saveAuditoriaPP.emit(resultado);
                    this.plex.alert('La Auditoría se actualizó correctamente');
                },
                    err => {
                        if (err) {
                            console.log(err);
                        }
                    });

                // POST/NEW
            } else {

                this.prestacionPacienteService.post(this.modelo).subscribe(resultado => {
                    // this.saveAuditoriaPP.emit(resultado);
                    this.plex.alert('La Auditoría se guardó correctamente');
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

    // comprobarUnidades() {
    //     if (this.modelo.llave.edad && this.modelo.llave.edad.desde.unidad && this.modelo.llave.edad.hasta.unidad) {
    //         if (this.modelo.llave.edad.desde.unidad.$order < this.modelo.llave.edad.hasta.unidad.$order) {
    //             this.unidadesValidas = false;
    //         } else {
    //             this.unidadesValidas = true;
    //         }
    //     }
    // }

    cancelar() {
        this.cancelaEditarAuditoriaPP.emit(true);
    }

    // loadTipoPrestaciones($event) {

    //     let llavesFiltradas = [];
    //     this.serviceTipoPrestacion.get({ turneable: 1 }).subscribe((tiposPrestaciones) => {

    //         this.llaveTipoPrestacionService.get({}).subscribe((llavesTP) => {

    //             llavesTP.forEach((llave, index) => {
    //                 let existe = this.existeEnArray(tiposPrestaciones, llave.tipoPrestacion);
    //                 let idx = tiposPrestaciones.indexOf(existe);
    //                 tiposPrestaciones.splice(idx, 1);
    //                 tiposPrestaciones = [...tiposPrestaciones];
    //             });

    //             $event.callback(tiposPrestaciones);

    //         });

    //     });
    // }

    loadEstados(event) {
        event.callback(enumerados.getEstadosAuditorias());
    }

    // UTILS
    existeEnArray(arr, objeto: any) {
        return arr.find(x => x.id === objeto.id);
    }


}
