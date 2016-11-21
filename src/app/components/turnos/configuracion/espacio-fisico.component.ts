import { PlexService } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { IEspacioFisico } from './../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'espacio-fisico',
    templateUrl: 'espacio-fisico.html',
})

export class EspacioFisicoComponent implements OnInit {
    showcreate: boolean = false;
    showupdate: boolean = false;
    espaciosFisicos: IEspacioFisico[];
    searchForm: FormGroup;
    selectedEspacioFisico: IEspacioFisico;

    constructor(private formBuilder: FormBuilder, private espacioFisicoService: EspacioFisicoService) { }

    ngOnInit() {
        this.loadEspaciosFisicos();
    }

    loadEspaciosFisicos() {
        this.espacioFisicoService.get()
            .subscribe(
            espaciosFisicos => this.espaciosFisicos = espaciosFisicos, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onReturn(espacioFisico: IEspacioFisico): void {
        this.showcreate = false;
        this.showupdate = false;
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
        this.showcreate = false;
        this.showupdate = true;
        this.selectedEspacioFisico = espacioFisico;
    }

}