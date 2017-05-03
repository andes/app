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
    llavesTPSeleccionadas: ILlavesTipoPrestacion[] = [];
    llaveTPSeleccionadas: ILlavesTipoPrestacion;
    value: any;
    skip = 0;
    finScroll = false;
    tengoDatos = true;
    loader = false;

    constructor(private formBuilder: FormBuilder, private llaveTipoPrestacionService: LlavesTipoPrestacionService, public auth: Auth) { }

    ngOnInit() {
       this.loadTipoPrestaciones();
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
