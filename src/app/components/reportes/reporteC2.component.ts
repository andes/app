import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, Input, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';


@Component({
    selector: 'reporteC2',
    templateUrl: 'reporteC2.html',
})

export class ReporteC2Component implements OnInit {
    private _diagnosticos;
    @Input('diagnosticos') // recibe un array de parametros
    set diagnosticos(value: any) {
        this._diagnosticos = value;
    }

    get diagnosticos(): any {
        return this._diagnosticos;
    }

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private router: Router,
        private server: Server,

        private auth: Auth,


    ) {

    }

    public ngOnInit() {

    }




}
