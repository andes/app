import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { IPrestacion } from './../../../../interfaces/turnos/IPrestacion';
import { PrestacionService } from './../../../../services/turnos/prestacion.service';

@Component({
    selector: 'prestacion',
    templateUrl: 'prestacion.html',
})

export class PrestacionComponent implements OnInit {
    @Output() data: EventEmitter<IPrestacion> = new EventEmitter<IPrestacion>();

    showcreate: boolean = false;
    showupdate: boolean = false;
    prestacion: IPrestacion[];
    searchForm: FormGroup;
    selectedPrestacion: IPrestacion;

    constructor(public plex: Plex, public prestacionService: PrestacionService) { }

    ngOnInit() {
        this.loadPrestacion();
    }

    loadPrestacion() {
        this.prestacionService.get()
            .subscribe(
            prestacion => this.prestacion = prestacion,
            err => {
                if (err) {
                    console.log(err);
                }
            });

    }

    onReturn(prestacion: IPrestacion): void {
        this.showcreate = false;
        this.showupdate = false;
        this.loadPrestacion();
    }

    onDisable(prestacion: IPrestacion) {
        this.prestacionService.disable(prestacion)
            .subscribe(dato => this.loadPrestacion(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEnable(prestacion: IPrestacion) {
        this.prestacionService.enable(prestacion)
            .subscribe(dato => this.loadPrestacion(), //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onEdit(prestacion: IPrestacion) {
        this.showcreate = false;
        this.showupdate = true;
        this.selectedPrestacion = prestacion;
    }
}