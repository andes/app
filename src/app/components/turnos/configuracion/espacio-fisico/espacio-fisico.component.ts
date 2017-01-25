import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'espacio-fisico',
    templateUrl: 'espacio-fisico.html',
})

export class EspacioFisicoComponent implements OnInit {
    showupdate: boolean = false;
    espaciosFisicos: IEspacioFisico[];
    searchForm: FormGroup;
    selectedEspacioFisico: IEspacioFisico;

    constructor(private formBuilder: FormBuilder, private espacioFisicoService: EspacioFisicoService) { }

    ngOnInit() {
        this.loadEspaciosFisicos();
    }

    loadEspaciosFisicos() {
        this.espacioFisicoService.get({})
            .subscribe(
            espaciosFisicos => this.espaciosFisicos = espaciosFisicos, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onReturn(espacioFisico: IEspacioFisico): void {
        this.showupdate = false;
        this.selectedEspacioFisico = null;
        this.loadEspaciosFisicos();
    }

    onDisable(espacioFisico: IEspacioFisico) {
        this.espacioFisicoService.disable(espacioFisico)
            .subscribe(dato => this.loadEspaciosFisicos(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEnable(espacioFisico: IEspacioFisico) {
        this.espacioFisicoService.enable(espacioFisico)
            .subscribe(dato => this.loadEspaciosFisicos(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

     onEdit(espacioFisico: IEspacioFisico) {
        this.showupdate = true;
        this.selectedEspacioFisico = espacioFisico;
    }

}