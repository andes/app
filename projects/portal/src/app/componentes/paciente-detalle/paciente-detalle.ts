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
    selector: 'app-paciente-detalle',
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
    ];

    alertas = [
        { dato: 'problemas', valor: '7', subdato: 'hipertensión, diabetes y 5 más...', tipo: 'dark', color: '', icono: 'trastorno', path: 'misProblemas', semanticTag: 'trastorno' },
        { dato: 'alergias', valor: '3', subdato: 'penicilina, carbamazepina y metmorfina', tipo: 'dark', color: '', icono: 'lupa-ojo', path: 'misProblemas', semanticTag: 'hallazgo' },
        { dato: 'prescripciones', valor: '5', subdato: 'subutamol, enalapril y 3 más...', tipo: 'dark', color: '#00cab6', icono: 'pildoras', path: 'misPrescripciones', semanticTag: 'producto' },
        { dato: 'laboratorios', valor: '1', subdato: 'Resultados del hemograma', tipo: 'dark', color: '#a0a0a0', icono: 'recipiente', path: 'misLaboratorios', semanticTag: 'laboratorio' },
        { dato: 'vacunas', valor: '1', subdato: 'subutamol, enalapril y 3 más...', tipo: 'dark', color: '#92278e', icono: 'vacuna', path: 'misVacunas', semanticTag: 'procedimiento' },
    ];

    @Output() motivoAccesoHuds = new EventEmitter<any>();
    @Output() eventoSidebar = new EventEmitter<number>();

    pacientes$: Observable<Paciente[]>;
    paciente$: Observable<Paciente>;
    width: number;
    datosSecundarios = true;
    selectedId: number;

    public contenido = '';
    public email = '';
    public motivoSelected = null;
    public errores: any[];
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public prueba = '';
    public cambio = '';

    @ViewChildren('modal') modalRefs: QueryList<PlexModalComponent>;

    openModal(index) {
        this.modalRefs.find((x, i) => i === index).show();
    }

    closeModal(index, formulario?) {
        this.modalRefs.find((x, i) => i === index).close();
        if (formulario) {
            formulario.reset();
        }
    }

    motivoSelect() {
        return this.motivoSelected === null;
    }

    notificarAccion(flag: boolean) {
        if (flag) {
            const item = this.errores.find((elem) => elem.id === this.motivoSelected);
            this.motivoAccesoHuds.emit(item.label);
        } else {
            this.motivoAccesoHuds.emit(null);
        }
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

        // plex-select errores
        this.errores = [{
            id: 1,
            nombre: 'Error en mis registros de salud',
        },
        {
            id: 2,
            nombre: 'Error en mis datos personales',
        },
        {
            id: 3,
            nombre: 'Otro error',
        }
        ];
    }

    ocultarDatos() {
        this.datosSecundarios = !this.datosSecundarios;
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        if (this.width < 780) {
            return true;
        } else {
            this.datosSecundarios = false;
        }
    }
}
