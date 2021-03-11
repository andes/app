import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output, Input } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { BehaviorSubject, Observable } from 'rxjs';

import { PrestacionService } from '../../servicios/prestacion.service';
import { CardService } from '../../servicios/card.service';
import { Card } from '../../modelos/card';

@Component({
    selector: 'app-filtros-huds',
    templateUrl: './filtros-huds.html',
})
export class FiltrosHudsComponent implements OnInit {

    searchTerm = new BehaviorSubject<string>('');

    // switchea mensaje por listado
    @Output() eventoValor = new EventEmitter<boolean>();

    valor: boolean;
    card$: Observable<Card>;
    cards$: Observable<Card[]>;

    public selectedId;
    public prestacion$;
    public prestaciones$;
    sidebarValue: number;

    public duracion = '1 hs. 34 min.';
    public plex: Plex;
    public tModel: any;
    public optiones: any[];
    public options: any[];
    public prestaciones: any[];
    public profesionales: any[];
    public efectores: any[];
    public modelo1 = { select: null };
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public modelo3 = { select: null };
    public templateModel2: any;
    public modelo: any;

    public showModal = false;

    @Output() eventoSidebar = new EventEmitter<number>();
    @Output() eventoFoco = new EventEmitter<string>();

    updateMaxHora() {
        this.tModel.minHora = moment().add(30, 'minutes').add(1, 'days');
    }

    horaPlus() {
        return moment(this.tModel.hora).add(30, 'minutes');
    }

    onChange() {
        this.plex.info('success', 'Este cartel se demoro un segundo en aparecer después de escribir.');
    }

    constructor(
        private prestacionService: PrestacionService,
        private cardService: CardService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.prestacionService.valorActual.subscribe(valor => this.sidebarValue = valor);

        // Servicios
        this.prestaciones$ = this.prestacionService.getConsultas();
        this.cards$ = this.cardService.getCards();

        // Mostrar semantics
        this.card$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.cardService.getCard(params.get('id')))
        );

        // Mostrar listado
        this.prestacion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getConsulta(params.get('id')))
        );

        // plex-datetime
        this.tModel = {
            fechaHora: null,
            fecha: null,
            hora: null,
            horados: null,
            disabled: false,
            min: new Date(1970, 0, 1),
            minHora: moment().add(30, 'minutes'),
            maxHora: moment().add(180, 'minutes'),
            fechaDecounce: new Date(1970, 0, 1),
        };

        // plex-phone
        // plex-float
        this.tModel = { valor: null };

        // Radio
        this.options = [
            {
                label: 'todas',
                key: 1,
            },
            {
                label: 'mías',
                key: 2,
            },
        ];

        // plex-select efectores
        this.efectores = [{
            id: 1,
            nombre: 'Hospital Provincial Neuquén',
            continente: 'Neuquén',
        },
        {
            id: 2,
            nombre: 'Hospital San Martín de los Andes',
            continente: 'Neuquén',
        },
        {
            id: 3,
            nombre: 'Hospital de Plottier',
            continente: 'Neuquén',
        }];

        // plex-select prestaciones
        this.prestaciones = [{
            id: 1,
            nombre: 'Consulta general de medicina',
        },
        {
            id: 2,
            nombre: 'Consulta domiciliaria',
        },
        {
            id: 3,
            nombre: 'Exámen médico del adulto"',
        },
        {
            id: 4,
            nombre: 'Consulta de psicología',
        },
        {
            id: 5,
            nombre: 'Consulta pediátrica de neurología',
        }
        ];

        // plex-select profesionales
        this.profesionales = [{
            id: 1,
            nombre: 'Monteverde, María Laura ',
        },
        {
            id: 2,
            nombre: 'Molini, Walter Juan',
        },
        {
            id: 3,
            nombre: 'Mendiguren, Macarena Agustina',
        },
        {
            id: 4,
            nombre: 'Siracussi, Alejandra Gabriela',
        },
        {
            id: 5,
            nombre: 'Cifuentes, Mónica Patricia',
        }
        ];

        this.modelo1.select = this.modelo2.select = this.efectores[1];

        // plex-text
        this.templateModel2 = { nombre: null, min: 10, max: 15 };

        // plex-bool
        this.modelo = { checkbox: false, slide: false };
    }
}

