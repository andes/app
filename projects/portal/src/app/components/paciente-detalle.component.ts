import { Component, OnInit, ElementRef, ViewChild, ViewChildren, QueryList, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { PacientePortalService } from '../services/paciente-portal.service';
import { IPacienteMatch } from 'src/app/modules/mpi/interfaces/IPacienteMatch.inteface';
import { map } from 'rxjs/operators';
import { PlexModalComponent } from '@andes/plex/src/lib/modal/modal.component';
import { LoginService } from '../login/service/login-portal-paciente.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Router } from '@angular/router';

@Component({
    selector: 'pdp-paciente-detalle',
    templateUrl: './paciente-detalle.html'
})

export class PacienteDetalleComponent implements OnInit {

    public paciente$: Observable<IPacienteMatch[]>;
    public width: number;
    public datosSecundarios = true;
    public registros$: Observable<any>;
    public paciente: IPaciente;

    // modal
    public motivoSelected = null;
    public modelo2 = {
        select: null,
        soloLectura: false,
        selectMultiple: null
    };
    public prueba = '';
    public cambio = '';
    public errores: any[];

    @ViewChildren('modal') modalRefs: QueryList<PlexModalComponent>;

    constructor(
        private pacienteService: PacientePortalService,
        private el: ElementRef,
        private loginService: LoginService,
        private router: Router
    ) { }

    ngOnInit() {
        if (!this.loginService.loggedIn()) {
            this.router.navigate(['./login']);
        }
        const idPaciente = this.loginService.user.pacientes[0].id;
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
        // pendiente
    }
}
