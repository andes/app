import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PrestacionService } from '../../services/prestaciones.service';
// Servicios y modelo
import { Plex } from '@andes/plex';

@Component({
    selector: 'pdp-portal-paciente',
    templateUrl: './portal-paciente.html'
})


export class PortalPacienteComponent implements OnInit {

    public width = 0;
    mainValue: number;
    valorFoco: string;

    sidebarValue: Boolean;

    constructor(
        private el: ElementRef,
        private plex: Plex,
        private router: Router,
        private prestacionService: PrestacionService
    ) { }

    ngOnInit() {

        this.plex.navbarVisible = false;
        // Paso valor del sidebar

        this.prestacionService.valorActual.subscribe(valor => this.mainValue = valor);

        // Paso valor del foco
        this.prestacionService.focoActual.subscribe(valor => this.valorFoco = valor);

        // paso valor del sidebar
        this.prestacionService.sidebarActual.subscribe(valor => this.sidebarValue = valor);
    }


    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return 980 >= this.width;
    }

    recibirSidebar($event) {

        this.mainValue = $event;
    }
    recibirFoco($event) {
        this.valorFoco = $event;
    }

    contraerSidebar() {
        this.router.navigate(['home']);
        this.mainValue = 12;
        this.valorFoco = 'main';
        this.sidebarValue = false;

    }



}
