import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { PacientePortalService } from '../services/paciente-portal.service';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';

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


    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private auth: Auth
    ) { }

    ngOnInit() {
        const idPaciente = this.auth.mobileUser.pacientes[0].id;
        this.pacienteService.getById(idPaciente).subscribe(data => this.paciente = data);

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
