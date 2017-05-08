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
    llavesTP: ILlavesTipoPrestacion[];
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
        this.llaveTipoPrestacionService.get({
            organizacion: this.auth.organizacion._id
        }).subscribe(
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

        this.llaveTipoPrestacionService.get({
            organizacion: this.auth.organizacion._id,
        }).subscribe(
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

        this.showVistaLlavesTP = true;

        this.llaveTipoPrestacionService.getById(llaveTP.id).subscribe(llave => {
            // Actualizo la agenda local
            llaveTP = llave;
            // Actualizo la agenda global (modelo)
            this.llaveTPSeleccionada = llave;

            // Para que no rompa la validación, se asegura que no falten estas llaves
            if (!this.llaveTPSeleccionada.llave.edad) {
                this.llaveTPSeleccionada.llave.edad = {
                    desde: {
                        valor: 0,
                        unidad: null
                    },
                    hasta: {
                        valor: 0,
                        unidad: null
                    }
                }
            }

            // Para que no rompa la validación, se asegura que no falten estas llaves
            if (!this.llaveTPSeleccionada.llave.solicitud) {
                this.llaveTPSeleccionada.llave.solicitud = {
                    requerida: false
                }
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

    cambiarEstado(llaveTP:ILlavesTipoPrestacion, key: String) {
        let patch = {};
        console.log(llaveTP.auditable);
        patch[String(key)] = !llaveTP.auditable;
        this.llaveTipoPrestacionService.patch(llaveTP.id, patch).subscribe(llave => {
            this.llaveTPSeleccionada = llave;
        });
    }

    limpiarModeloLlavesTP() {
        this.llaveTPSeleccionada = {
            organizacion: this.auth.organizacion,
            llave: {
                edad: {
                    desde: {
                        valor: 0,
                        hasta: ''
                    },
                    hasta: {
                        valor: 0,
                        hasta: ''
                    }
                },
                solicitud: {
                    requerida: false
                }
            }
        };

        this.llavesTPSeleccionadas = [];
        this.showVistaLlavesTP = true;
    }

    setColorEstadoAgenda(agenda) {
        // if (agenda.estado === 'Suspendida') {
        //     agenda.agendaSeleccionadaColor = 'danger';
        // } else {
        //     agenda.agendaSeleccionadaColor = 'success';
        // }
    }

    saveLlaveTP() {
        this.loadLlavesTP();
    }

    cancelaEditarLlaveTP() {
        this.showVistaLlavesTP = false;
    }

    // onReturn(espacioFisico: IEspacioFisico): void {
    //     this.showupdate = false;
    //     this.selectedEspacioFisico = null;
    //     this.loadEspaciosFisicos();
    // }

    // onDisable(espacioFisico: IEspacioFisico) {
    //     this.espacioFisicoService.disable(espacioFisico)
    //         .subscribe(dato => this.loadEspaciosFisicos(), // Bind to view
    //         err => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    // }

    // onEnable(espacioFisico: IEspacioFisico) {
    //     this.espacioFisicoService.enable(espacioFisico)
    //         .subscribe(dato => this.loadEspaciosFisicos(), // Bind to view
    //         err => {
    //             if (err) {
    //                 console.log(err);
    //             }
    //         });
    // }

    // activate(objEspacioFisico: IEspacioFisico) {

    //     if (objEspacioFisico.activo) {

    //         this.espacioFisicoService.disable(objEspacioFisico)
    //             .subscribe(datos => this.loadEspaciosFisicos());  // Bind to view
    //     } else {
    //         this.espacioFisicoService.enable(objEspacioFisico)
    //             .subscribe(datos => this.loadEspaciosFisicos());  // Bind to view
    //     }
    // }

    // onEdit(espacioFisico: ILlavesTipoPrestacion) {
    //     this.showupdate = true;
    //     this.selectedEspacioFisico = espacioFisico;
    // }

}
