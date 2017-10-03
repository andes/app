import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Auth } from '@andes/auth';

import { ILlavesTipoPrestacion } from './../../../interfaces/llaves/ILlavesTipoPrestacion';
import { LlavesTipoPrestacionService } from './../../../services/llaves/llavesTipoPrestacion.service';

@Component({
    selector: 'llaves-tipoPrestacion',
    templateUrl: 'llaves-tipoPrestacion.html',
})

export class LlavesTipoPrestacionComponent implements OnInit {

    public autorizado = false;
    showupdate = false;
    llavesTP: any[];
    llaveTP: any = {};
    llavesTPSeleccionadas: ILlavesTipoPrestacion[] = [];
    llaveTPSeleccionada: any;

    showVistaLlavesTP = false;

    value: any;
    skip = 0;
    finScroll = false;
    tengoDatos = true;
    loader = false;

    constructor(private formBuilder: FormBuilder, private llaveTipoPrestacionService: LlavesTipoPrestacionService, public auth: Auth) { }

    ngOnInit() {
        this.loadTipoPrestaciones();
    }

    loadLlavesTP() {
        this.llaveTipoPrestacionService.get({}).subscribe(
            llavesTP => {
                this.llavesTP = llavesTP;
                this.llavesTPSeleccionadas = [];
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadTipoPrestaciones() {

        this.llaveTipoPrestacionService.get({}).subscribe(
            llaves => {
                this.llavesTP = llaves;
                this.llavesTPSeleccionadas = [];
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    estaSeleccionada(llaveTP: any) {
        return this.llavesTPSeleccionadas.find(x => x.id === llaveTP._id);
    }

    verLlave(llaveTP, multiple, e) {

        this.llaveTipoPrestacionService.getById(llaveTP.id).subscribe(llave => {

            // Actualizo la llave global (modelo) y local
            this.llaveTPSeleccionada = llaveTP = llave;

            this.showVistaLlavesTP = true;

            console.log(this.llaveTPSeleccionada);

            // Para que no rompa la validación, se asegura que no falten estas llaves
            if (typeof this.llaveTPSeleccionada.llave === 'undefined') {
                this.llaveTPSeleccionada.llave.edad = {
                    desde: {
                        valor: 0,
                        unidad: null
                    },
                    hasta: {
                        valor: 0,
                        unidad: null
                    }
                };
            } else {
                if (typeof this.llaveTPSeleccionada.llave.edad === 'undefined') {
                    this.llaveTPSeleccionada.llave.edad = {};
                    this.llaveTPSeleccionada.llave.edad.desde = {
                        valor: 0,
                        unidad: null
                    };
                    this.llaveTPSeleccionada.llave.edad.hasta = {
                        valor: 0,
                        unidad: null
                    };
                }
            }


            // Para que no rompa la validación, se asegura que no falten estas llaves
            if (!this.llaveTPSeleccionada.llave.solicitud) {
                this.llaveTPSeleccionada.llave.solicitud = {
                    requerida: false
                };
                this.llaveTPSeleccionada.llave.solicitud.vencimiento = {
                    valor: 0,
                    unidad: null
                };
            }

            if (!this.llaveTPSeleccionada.llave.solicitud.requerida) {
            }

            if (!multiple) {
                this.llavesTPSeleccionadas = [];
                this.llavesTPSeleccionadas = [...this.llavesTPSeleccionadas, llave];
            } else {
                let index;
                if (this.estaSeleccionada(llaveTP)) {
                    index = this.llavesTPSeleccionadas.indexOf(llaveTP);
                    this.llavesTPSeleccionadas.splice(index, 1);
                    this.llavesTPSeleccionadas = [...this.llavesTPSeleccionadas];
                } else {
                    this.llavesTPSeleccionadas = [...this.llavesTPSeleccionadas, llave];
                }
            }

        });

    }

    cambiarEstado(llaveTP: ILlavesTipoPrestacion, key: String, value: any) {
        let patch = {
            key: key,
            value: value
        };

        this.showVistaLlavesTP = false;
        this.llaveTipoPrestacionService.patch(llaveTP.id, patch).subscribe(llave => {
            this.llaveTPSeleccionada = llave;
        });
    }

    saveLlaveTP() {
        this.showVistaLlavesTP = false;
        this.loadLlavesTP();
    }

    // Botón "Nueva configuración"
    nuevaConfigLlavesTP() {
        this.llaveTPSeleccionada = {
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
                    requerida: false,
                    vencimiento: {
                        valor: 0,
                        unidad: null
                    }
                }
            }
        };

        this.llavesTPSeleccionadas = [];
        this.showVistaLlavesTP = true;
    }

    cancelaEditarLlaveTP() {
        this.showVistaLlavesTP = false;
        this.llavesTPSeleccionadas = [];
    }

}
