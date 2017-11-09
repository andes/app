import { Router } from '@angular/router';
import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from './../../../../interfaces/IPaciente';

@Component({
    selector: 'rup-hudsBusquedaPaciente',
    templateUrl: 'hudsBusquedaPaciente.html',
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaPacienteComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;

    public paciente: IPaciente;

    public showHuds = false;

    constructor(public plex: Plex, public auth: Auth, private router: Router) { }

    ngOnInit() {
    }

    onPacienteSelected(event) {
        this.paciente = event;
        this.showHuds = true;
    }
    onPacienteCancel() {
        this.router.navigate(['rup']);
    }

}
