import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
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
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'plex-portal-paciente',
    templateUrl: './portal-paciente.component.html',
    styleUrls: ['./portal-paciente.component.scss']
})


export class PortalPacienteComponent implements OnInit {

    @Output() motivoAccesoHuds = new EventEmitter<any>();

    selectedId: number;
    @Output() eventoSidebar = new EventEmitter<number>();
    card$: Observable<Card>;
    sidebarValue: number;
    previousUrl: string;
    width = 0;

    constructor(
        private cardService: CardService,
        private plex: Plex,
        private route: ActivatedRoute,
        private router: Router,
        private prestacionService: PrestacionService,
        private el: ElementRef,
    ) { }

    ngOnInit() {
        this.modelo = { invert: false }

        // Paso valor del sidebar
        this.prestacionService.valorActual.subscribe(valor => this.sidebarValue = valor)

        this.cards$ = this.cardService.getCards();
        //mostrar detalle de prestacion
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

    foco = 'main';
    public prueba = '';
    public cambio = '';

    onChange() {
        this.plex.info('success', 'Este cartel se demoro un segundo en aparecer después de escribir.');
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width >= 980) {
            return true;
        }
        else false;
    }

    recibirSidebar($event) {
        this.sidebarValue = $event;
        console.log(this.sidebarValue);
    }

    contraerSidebar() {
        //this.router.navigate(['portal-paciente', this.previousUrl]);
        this.router.navigate(['portal-paciente']);
        this.sidebarValue = 12;
        console.log(this.prestacionService.getPreviousUrl());
    }
}
