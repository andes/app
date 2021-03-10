import { Component, ElementRef, OnInit } from '@angular/core';
import { AgendaService } from '../../servicios/agenda.service';
import { PacienteService } from '../../servicios/paciente.service';
import { PrestacionService } from '../../servicios/prestacion.service';
import { Agenda } from '../../modelos/agenda';
import { Paciente } from '../../modelos/paciente';
import { Prestacion } from '../../modelos/prestacion';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs';
import { EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-portal-paciente-main',
    templateUrl: './portal-paciente-main.component.html',
})
export class PortalPacienteMainComponent implements OnInit {

    // Oculta filtros
    valorFiltros = true;

    // Expande sidebar
    sidebarValue = 9;
    @Output() eventoSidebar = new EventEmitter<number>();

    agendas$: Observable<Agenda[]>;
    pacientes$: Observable<Paciente[]>;
    prestaciones$: Observable<Prestacion[]>;
    selectedId: string;
    width = 0;

    public duracion = '1 hs. 34 min.';
    public plex: Plex;
    public tModel: any;
    public opciones: any[];
    public options: any[];
    public modelo1 = { select: null };
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    // public prueba = '';
    public templateModel2: any;
    public modelo: any;
    public showModal = false;

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
        private pacienteService: PacienteService,
        private agendaService: AgendaService,
        private prestacionService: PrestacionService,
        private el: ElementRef,
    ) { }

    ngOnInit() {
        // Inicio servicios
        this.agendas$ = this.agendaService.getAgendas();
        this.pacientes$ = this.pacienteService.getPacientes();
        this.prestaciones$ = this.prestacionService.getConsultas();

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

        // plex-select
        this.opciones = [{
            id: 1,
            nombre: 'Consulta de medicina general',
            continente: 'Prestación',
        },
        {
            id: 2,
            nombre: 'Exámen médico del adulto',
            continente: 'Prestación',
        },
        {
            id: 3,
            nombre: 'Consulta domiciliaria',
            continente: 'Prestación',
        }];

        this.modelo1.select = this.modelo2.select = this.opciones[1];

        // plex-text
        this.templateModel2 = { nombre: null, min: 10, max: 15 };

        // plex-bool
        this.modelo = { checkbox: false, slide: false };

    }

    enviarFiltros() {
        this.valorFiltros = !this.valorFiltros;
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width > 780) {
            return true;
        }
    }
}
