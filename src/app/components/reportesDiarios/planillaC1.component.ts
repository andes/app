import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, Input, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';


@Component({
    selector: 'planillaC1',
    templateUrl: 'planillaC1.html',
    styleUrls: [
        'planillaC1.scss'
    ]
})


export class PlanillaC1Component implements OnInit {

    fecha = new Date();

    private _reporte;
    @Input('reporte') // recibe un array

    set reporte(value: any[]) {
        this._reporte = value;
    }

    get reporte(): any[] {
        return this._reporte;
    }


    private _parametros;
    @Input('parametros') // recibe

    public set parametros(value: any) {
        this._parametros = value;
    }

    public get parametros(): any {
        return this._parametros;
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
