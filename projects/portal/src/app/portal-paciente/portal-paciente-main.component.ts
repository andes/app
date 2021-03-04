import { Component, ElementRef, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';


@Component({
    selector: 'portal-paciente-main',
    templateUrl: './portal-paciente-main.html',
})
export class PortalPacienteMainComponent implements OnInit {

    constructor(private plex: Plex) { }

    ngOnInit() {
    }
}
