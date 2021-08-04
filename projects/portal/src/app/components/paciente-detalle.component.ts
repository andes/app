import { Component, OnInit, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';
import { LaboratorioService } from '../services/laboratorio.service';
import { VacunaService } from '../services/vacuna.service';
import { Router } from '@angular/router';
import { PacientePortalService } from '../services/paciente-portal.service';
import { CARDS } from '../enums';

@Component({
    selector: 'pdp-paciente-detalle',
    templateUrl: './paciente-detalle.html'
})

export class PacienteDetalleComponent implements OnInit {

    public width: number;
    public datosSecundarios = true;
    public registros$: Observable<any>;
    public paciente: IPaciente;

    // modal
    public motivoError = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public descripcionError = '';
    public errores: any[];

    // cards
    private filtroCards = ['problemas', 'alergias', 'prescripciones', 'laboratorios', 'vacunas'];
    public alertas = [];
    public cardSelected;


    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private auth: Auth,
        private laboratorioService: LaboratorioService,
        private router: Router,
        private vacunaService: VacunaService
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        this.pacienteService.me().subscribe(resp => this.paciente = resp);
        this.alertas = CARDS.filter(card => this.filtroCards.includes(card.nombre));

        this.errores = [
            {
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

    goTo(path) {
        if (path) {
            this.cardSelected = this.alertas.find(a => a.path === path);
            this.router.navigate(['/' + path]);
        }
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
