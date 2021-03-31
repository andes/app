import { Component, OnInit, ElementRef } from '@angular/core';

// Servicios y modelo
import { Plex } from '@andes/plex';

@Component({
    selector: 'pdp-portal-paciente',
    templateUrl: './portal-paciente.html'
})


export class PortalPacienteComponent implements OnInit {

    public width = 0;

    constructor(
        private el: ElementRef,
        private plex: Plex,
    ) { }

    ngOnInit() {
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
