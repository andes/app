import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { PacientePortalService } from '../services/paciente-portal.service';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';
import { PrestacionService } from '../services/prestaciones.service';
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
    alertas = [
        { dato: 'problemas', valor: '7', subdato: 'hipertensión, diabetes y 5 más...', tipo: 'dark', color: '', icono: 'trastorno', path: 'misProblemas', semanticTag: 'trastorno' },
        { dato: 'alergias', valor: '3', subdato: 'penicilina, carbamazepina y metmorfina', tipo: 'dark', color: '', icono: 'lupa-ojo', path: 'misProblemas', semanticTag: 'hallazgo' },
        { dato: 'prescripciones', valor: '5', subdato: 'subutamol, enalapril y 3 más...', tipo: 'dark', color: '#00cab6', icono: 'pildoras', path: 'misPrescripciones', semanticTag: 'producto' },
        { dato: 'laboratorios', valor: '0', subdato: 'Resultados del hemograma', tipo: 'dark', color: '#a0a0a0', icono: 'recipiente', path: 'misLaboratorios', semanticTag: 'laboratorio' },
        { dato: 'vacunas', valor: '0', subdato: 'subutamol, enalapril y 3 más...', tipo: 'dark', color: '#92278e', icono: 'vacuna', path: 'misVacunas', semanticTag: 'procedimiento' },
    ];

    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private auth: Auth,

        private prestacionesService: PrestacionService
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        this.pacienteService.getById(idPaciente).subscribe(data => this.paciente = data);

        this.prestacionesService.getVacunas(idPaciente).subscribe(vacunas => {
            this.alertas.map(a => {
                if (a.dato === 'vacunas') {
                    a.valor = vacunas.length.toString();
                }


            });
        });

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

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }

}
