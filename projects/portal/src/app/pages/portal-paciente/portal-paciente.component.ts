import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
