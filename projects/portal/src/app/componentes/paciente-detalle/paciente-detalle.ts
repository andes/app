import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

// rxjs
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Servicios y modelo
import { Agenda } from '../../modelos/agenda';
import { Paciente } from '../../modelos/paciente';
import { Plex } from '@andes/plex';
import { EventEmitter, Output } from '@angular/core';
import { PacienteService } from '../../servicios/paciente.service';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';

@Component({
    selector: 'paciente-detalle',
    templateUrl: './paciente-detalle.html',
})


export class PacienteDetalleComponent implements OnInit {

    registros = [
        { dato: 'peso', valor: '62 kgs.', fecha: '21/01/2019' },
        { dato: 'talla', valor: '173 cms.', fecha: '12/03/2020' },
        { dato: 'T.A', valor: '96 / 124 mmHg.', fecha: '11/12/2021' },
        { dato: 'grupo/factor', valor: 'A+', fecha: '21/03/2020' },
        { dato: 'Saturación', valor: '96%', fecha: '31/01/2021' },
        { dato: 'Frecuencia', valor: '78 PPM', fecha: '13/03/2018' },
    ]

    alertas = [
        { dato: 'problemas', valor: '7', subdato: 'hipertensión, diabetes y 5 más...', tipo: 'danger', color: '', icono: 'trastorno', path: 'misProblemas' },
        { dato: 'alergias', valor: '3', subdato: 'penicilina, carbamazepina y metmorfina', tipo: 'warning', color: '', icono: 'lupa-ojo', path: 'misProblemas' },
        { dato: 'prescripciones', valor: '5', subdato: 'subutamol, enalapril y 3 más...', tipo: 'custom', color: '#00cab6', icono: 'pildoras', path: 'misPrescripciones' },
        { dato: 'laboratorios', valor: '1', subdato: 'Resultados del hemograma', tipo: 'custom', color: '#a0a0a0', icono: 'pildoras', path: 'misLaboratorios' },
        { dato: 'vacunas', valor: '1', subdato: 'subutamol, enalapril y 3 más...', tipo: 'custom', color: '#92278e', icono: 'pildoras', path: 'misVacunas' },

    ]

    @Output() motivoAccesoHuds = new EventEmitter<any>();

    pacientes$: Observable<Paciente[]>
    paciente$: Observable<Paciente>
    width: number;
    datosSecundarios = true;
    selectedId: number;
    @Output() eventoSidebar = new EventEmitter<number>();

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width >= 980) {
            return true;
        }
        else false;
    }

    constructor(
        private plex: Plex,
        private route: ActivatedRoute,
        private router: Router,
        private pacienteService: PacienteService,
        private el: ElementRef,
    ) { }

    ngOnInit() {
        this.pacientes$ = this.pacienteService.getPacientes();
    }

    ocultarDatos() {
        this.datosSecundarios = !this.datosSecundarios;
        console.log(this.datosSecundarios);
    }

    onChange() {
        this.plex.info('success', 'Este cartel se demoro un segundo en aparecer después de escribir.');
    }

}
