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
        this.modelo = value;
        this.comprobarUnidades();
        if (this.modelo.id) {
            this.llaveSelect = {
                id: this.modelo.tipoPrestacion.id,
                nombre: this.modelo.tipoPrestacion.nombre
            };
        }
    }
    get llaveTPSeleccionada(): any {
        return this._llaveTPSeleccionada;
    }

    modelo: any = {};
    llaveSelect: any = {};
    permisos = [];
    showEditarLlave = false;
    unidadesValidas = true;

    constructor(public plex: Plex, public auth: Auth, public llaveTipoPrestacionService: LlavesTipoPrestacionService, public serviceTipoPrestacion: TipoPrestacionService) { }

    ngOnInit() {
        this.modelo = this.llaveTPSeleccionada;
        this.showEditarLlave = true;
    }

    guardarLlaveTP($event) {

        if (!this.unidadesValidas) {
            $event.formValid = false;
        }

        if ($event.formValid) {

            this.showEditarLlave = false;

            if (this.modelo.llave.sexo) {
                delete this.modelo.llave.sexo.$order;
                this.modelo.llave.sexo = this.modelo.llave.sexo.id;
            } else {
                delete this.modelo.llave.sexo;
            }

            if (this.modelo.llave.edad.desde.unidad) {
                if (this.modelo.llave.edad.desde.unidad.$order) {
                    delete this.modelo.llave.edad.desde.unidad.$order;
                    this.modelo.llave.edad.desde.unidad = this.modelo.llave.edad.desde.unidad.id;
                }
            } else {
                delete this.modelo.llave.edad.desde;
            }

            if (this.modelo.llave.edad.hasta.unidad) {
                if (this.modelo.llave.edad.hasta.unidad.$order) {
                    delete this.modelo.llave.edad.hasta.unidad.$order;
                    this.modelo.llave.edad.hasta.unidad = this.modelo.llave.edad.hasta.unidad.id;
                }
            } else {
                delete this.modelo.llave.edad.hasta;
            }

            if (this.modelo.llave.solicitud.vencimiento.unidad) {
                if (this.modelo.llave.solicitud.vencimiento.unidad.$order) {
                    delete this.modelo.llave.solicitud.vencimiento.unidad.$order;
                    this.modelo.llave.solicitud.vencimiento.unidad = this.modelo.llave.solicitud.vencimiento.unidad.id;
                }
            } else {
                delete this.modelo.llave.edad.vencimiento;
            }

            if (this.modelo.llave.solicitud.requerida === false) {
                delete this.modelo.llave.solicitud;
            }

            // PUT/UPDATE
            if (this.modelo.id) {

                this.llaveTipoPrestacionService.put(this.modelo).subscribe(resultado => {
                    this.saveLlaveTP.emit(resultado);
                    this.plex.alert('La configuración de llaves se actualizó correctamente');
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

    comprobarUnidades() {
        if (this.modelo.llave.edad && this.modelo.llave.edad.desde.unidad && this.modelo.llave.edad.hasta.unidad) {
            if (this.modelo.llave.edad.desde.unidad.$order < this.modelo.llave.edad.hasta.unidad.$order) {
                this.unidadesValidas = false;
            } else {
                this.unidadesValidas = true;
            }
        }
    }

    cancelar() {
        this.cancelaEditarLlaveTP.emit(true);
    }

    loadTipoPrestaciones($event) {

        let llavesFiltradas = [];
        this.serviceTipoPrestacion.get({ turneable: 1 }).subscribe((tiposPrestaciones) => {

            this.llaveTipoPrestacionService.get({}).subscribe((llavesTP) => {

                llavesTP.forEach((llave, index) => {
                    let existe = this.existeEnArray(tiposPrestaciones, llave.tipoPrestacion);
                    let idx = tiposPrestaciones.indexOf(existe);
                    tiposPrestaciones.splice(idx, 1);
                    tiposPrestaciones = [...tiposPrestaciones];
                });

                $event.callback(tiposPrestaciones);

            });

        });
    }

    loadSexo(event) {
        event.callback(enumerados.getObjSexos());
    }

    loadUnidadesEdad(event) {
        event.callback(enumerados.getObjUnidadesEdad());
    }

    // UTILS
    existeEnArray(arr, objeto: any) {
        return arr.find(x => x.id === objeto.id);
    }


}
