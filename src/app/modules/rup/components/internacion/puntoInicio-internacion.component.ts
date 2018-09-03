import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-punto-inicio-internacion',
    templateUrl: './puntoInicio-internacion.html',
    styleUrls: ['./puntoInicio-internacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class PuntoInicioInternacionComponent implements OnInit {

    public pacientes: any;
    public pacienteSeleccionado;

    constructor(
        // public servicioPrestacion: PrestacionesService,
        // private auth: Auth,
        private plex: Plex,
        // private router: Router,
        // public organizacionService: OrganizacionService,
        // public camasService: CamasService
    ) { }

    ngOnInit() {

    }


    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    onPacienteSelected(event) {
        this.pacienteSeleccionado = event;
    }
}
