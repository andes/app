import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, Input, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';




@Component({
    selector: 'consultaDiagnostico',
    templateUrl: 'consultaDiagnostico.html',

})

export class ConsultaDiagnosticoComponent implements OnInit {
    private _diagnosticos;
    @Input('diagnosticos') // recibe un array de parametros
    set diagnosticos(value: any) {
        this._diagnosticos = value;
    }

    get diagnosticos(): any {
        return this._diagnosticos;
    }


    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente


    // Eventos
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
