import { Component, OnInit, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { PacientePortalService } from '../services/paciente-portal.service';
import { CARDS } from '../enums';
import { LogPacienteService } from 'src/app/services/logPaciente.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'pdp-paciente-detalle',
    templateUrl: './paciente-detalle.html'
})

export class PacienteDetalleComponent implements OnInit {

    public width: number;
    public datosSecundarios = true;
    public registros$: Observable<any>;
    public paciente$: Observable<IPaciente>;

    // modal
    public motivoError = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public descripcionError = '';
    public errores = [
        {
            id: 1,
            nombre: 'Error en mis registros de salud',
            operacion: 'error:registrosSalud'
        },
        {
            id: 2,
            nombre: 'Error en mis datos personales',
            operacion: 'error:datosPersonales'
        },
        {
            id: 3,
            nombre: 'Otro error',
            operacion: 'error:otro'
        }
    ];;

    // cards
    public alertas = [];
    public cardSelected;
    public inicio; // true si se está en el menu inicio

    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private auth: Auth,
        private router: Router,
        private logPacienteService: LogPacienteService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.paciente$ = this.pacienteService.me();
        this.alertas = CARDS;
        this.inicio = this.router.url === '/mi-inicio';
    }

    goTo(path) {
        if (path) {
            this.cardSelected = this.alertas.find(a => a.path === path);
            this.router.navigate(['/' + path]);
        }
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width < 780;
    }

    ocultarDatos() {
        this.datosSecundarios = !this.datosSecundarios;
    }

    guardar() {
        const data = {
            paciente: this.auth.mobileUser.pacientes[0].id,
            operacion: this.motivoError.select.operacion,
            descripcion: this.descripcionError
        };
        this.logPacienteService.post(data).subscribe(resp => {
            if (resp) {
                this.plex.toast('success', 'Reporte emitido exitosamente');
            }
        }, error => {
            this.plex.toast('danger', 'Ha ocurrido un error enviando el reporte');
        });
    }
}
