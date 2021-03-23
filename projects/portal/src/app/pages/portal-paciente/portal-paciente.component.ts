import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

// Servicios y modelo
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs';
import { ICard } from '../../interfaces/icard';
import { CardService } from '../../services/card.service';
import { PrestacionService } from '../../services/prestacion.service';

@Component({
    selector: 'pdp-portal-paciente',
    templateUrl: './portal-paciente.html',
    styleUrls: ['./portal-paciente.scss']
})


export class PortalPacienteComponent implements OnInit {

    public width = 0;
    public valorMain = 11;
    public valorMenu = 1;
    public valorResultante = this.valorMain - this.valorMenu;
    public sidebarValue: number;
    public valorFoco: string;
    public card$: Observable<ICard>;
    public cards$: Observable<ICard[]>;

    constructor(
        private el: ElementRef,
        private plex: Plex,
        private router: Router,
        private cardService: CardService,
        private prestacionService: PrestacionService
    ) { }

    ngOnInit() {
        this.plex.navbarVisible = false;
        this.cards$ = this.cardService.getCards();
        // obtiene valor del sidebar
        this.prestacionService.valorActual.subscribe(valor => this.sidebarValue = valor);
        // obtiene valor del foco
        this.prestacionService.focoActual.subscribe(valor => this.valorFoco = valor);
    }

    recibirSidebar($event) {
        this.sidebarValue = $event;
    }

    recibirFoco($event) {
        this.valorFoco = $event;
    }

    contraerSidebar() {
        this.router.navigate(['home']);
        this.sidebarValue = 12;
        this.valorFoco = 'main';
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width < 780) {
            this.valorResultante = 12;
            return true;
        } else {
            this.valorResultante = 11;
            return false;
        }
    }

    // Nav lateral
    expandirMenu() {
        this.valorMenu = 2;
    }

    contraerMenu() {
        this.valorMenu = 1;
    }
}
