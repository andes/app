import { Component, OnInit, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

// rxjs
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Servicios y modelo
import { Agenda } from '../modelos/agenda';
import { Paciente } from '../modelos/paciente';
import { Plex } from '@andes/plex';
import { EventEmitter, Output } from '@angular/core';
import { CardService } from '../servicios/card.service';
import { Card } from '../modelos/card';
import { PrestacionService } from '../servicios/prestacion.service';

@Component({
    selector: 'app-plex-portal-paciente',
    templateUrl: './portal-paciente.component.html',
    styleUrls: ['./portal-paciente.component.scss']
})


export class PortalPacienteComponent implements OnInit {

    @Output() motivoAccesoHuds = new EventEmitter<any>();
    @Output() eventoMain = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    // Navegación lateral
    valorMain = 11;
    valorMenu = 1;
    valorResultante = this.valorMain - this.valorMenu;

    selectedId: number;
    card$: Observable<Card>;
    mainValue: number;
    sidebarValue: boolean;
    valorFoco: string = 'main';
    previousUrl: string;
    width = 0;

    public sidebar;
    public i;

    constructor(
        private cardService: CardService,
        private plex: Plex,
        private route: ActivatedRoute,
        private router: Router,
        private prestacionService: PrestacionService,
        private el: ElementRef,
    ) { }

    ngAfterViewInit() {
        this.sidebarValue = false;
        this.valorFoco = null;
    }

    ngOnInit() {

        this.modelo = { invert: false };

        // Paso valor del main
        this.prestacionService.valorActual.subscribe(valor => this.mainValue = valor);

        // Paso valor del sidebar
        this.prestacionService.sidebarActual.subscribe(valor => this.sidebarValue = valor);

        // Paso valor del foco
        this.prestacionService.focoActual.subscribe(valor => this.valorFoco = valor)

        this.cards$ = this.cardService.getCards();
        // Mostrar detalle de prestacion
        this.card$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.cardService.getCard(params.get('id')))
        );

        this.plex.navbarVisible = false;
    }

    // public prueba = '';
    public templateModel2: any;
    public modelo: any;
    public showModal = false;

    // public listadoPaciente: Paciente[];
    pacientes$: Observable<Paciente[]>;
    agendas$: Observable<Agenda[]>;
    cards$: Observable<Card[]>;

    onChange() {
        this.plex.info('success', 'Este cartel se demoro un segundo en aparecer después de escribir.');
    }

    recibirMain($event) {
        this.mainValue = $event;
    }

    recibirSidebar($event) {
        this.sidebarValue = $event;
        console.log(this.sidebarValue)

    }

    // fuerza not-focused (que solo funciona en responsive)
    //killSidebar() {
    //    this.sidebar = document.getElementsByClassName("h-100 col-0 not-focused");

    //    for (this.i = 0; this.i < this.sidebar.length; this.i++) {
    //        this.sidebar[this.i].style.display = 'none';
    //    }
    //}

    contraerSidebar() {
        this.mainValue = 12;
        this.valorFoco = null;
        this.sidebarValue = false;
    }

    // Nav lateral
    expandirMenu() {
        this.valorMenu = 2;
    }

    contraerMenu() {
        this.valorMenu = 1;
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width < 780) {
            this.valorResultante = 12;
            return true;
        } else {
            this.valorResultante = 11;
        }
    }
}
