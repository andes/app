import { Component, OnInit } from '@angular/core';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EventEmitter, Output } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-mis-prescripciones',
    templateUrl: './mis-prescripciones.component.html',
})
export class MisPrescripcionesComponent implements OnInit {

    public selectedId;
    public prescripcion$;
    public prescripciones$;

    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();
    filtros = true;

    public duracion = '1 hs. 34 min.';
    public plex: Plex;
    public tModel: any;
    public opciones: any[];
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
    public prueba = '';
    public cambio = '';
    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,) { }

    ngOnInit(): void {
        // Servicios
        this.prescripciones$ = this.prestacionService.getPrescripciones();

        //mostrar listado (prescripciones, historia, labs)
        this.prescripcion$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getPrescripcion(params.get('id')))
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

    mostrarFiltros() {
        this.filtros = !this.filtros;
    }

    enviarSidebar() {
        this.eventoSidebar.emit(this.sidebarValue);
        console.log(this.sidebarValue);
    }

    selected(prescripcion) {
        this.enviarSidebar();
        this.selectedId = prescripcion.id;
        this.router.navigate(['portal-paciente', { outlets: { detallePrescripcion: [this.selectedId] } }]);
    }
}

