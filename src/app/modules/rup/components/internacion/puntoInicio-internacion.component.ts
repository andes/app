import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../services/prestaciones.service';

@Component({
    selector: 'app-punto-inicio-internacion',
    templateUrl: './puntoInicio-internacion.html',
    styleUrls: ['./puntoInicio-internacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class PuntoInicioInternacionComponent implements OnInit {

    public listado: any;
    public pacienteSeleccionado;
    public epicrisisPaciente = [];
    public showLoader = false;

    public epicrisis = {
        'conceptId': '721919000',
        'term': 'epicrisis de enfermería',
        'fsn': 'epicrisis de enfermería (elemento de registro)',
        'semanticTag': 'elemento de registro'
    };

    constructor(
        public servicioPrestacion: PrestacionesService,
        private plex: Plex,
        private router: Router,
    ) { }

    ngOnInit() { }

    /**
     * Funcionalidades del buscador de MPI
     */
    searchStart() {
        this.listado = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.listado = resultado.pacientes;
        }
    }

    /**
     * Cuando seleccionamos un paciente busca todas sus epicrisis
     * formatea la descripcion a mostrar en el listado de epicrisis
     * @param paciente
     */
    onPacienteSelected(paciente) {
        this.showLoader = true;
        this.pacienteSeleccionado = paciente;
        this.servicioPrestacion.getPrestacionesXtipo(paciente.id, this.epicrisis.conceptId).subscribe(epicrisis => {
            this.epicrisisPaciente = epicrisis
                .map(e => {
                    if (e.ejecucion.registros && e.ejecucion.registros[0] && e.ejecucion.registros[0].registros) {
                        e.ejecucion.registros[0].registros[0].valor = e.ejecucion.registros[0].registros[0].valor.substring(0, 100) + '...';
                    }
                    return e;
                });
            this.showLoader = false;
        });
    }

    /**
     * Crea la prestacion de epicrisis
     * Nos rutea a la ejecucion de RUP.
     * @param paciente
     */
    nuevaEpicrisis(paciente) {
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(paciente, this.epicrisis, 'ejecucion', 'internacion');
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.router.navigate(['rup/ejecucion', prestacion.id]);
        });
    }

    /**
     * Ruteo a epicris/huds
     * @param id
     * @param key
     */
    ruteo(id, key) {
        this.servicioPrestacion.notificaRuta({ nombre: 'Punto inicio', ruta: 'internacion/puntoInicio' });
        switch (key) {
            case 'huds':
                this.router.navigate(['rup/vista/', id]);
                break;
            case 'epicrisis':
                this.router.navigate(['rup/ejecucion', id]);
                break;
            default:
                this.router.navigate([]);
                break;
        }
    }
}
