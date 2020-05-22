import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { Auth } from '@andes/auth';
import { HUDSService } from '../../services/huds.service';

@Component({
    selector: 'app-punto-inicio-internacion',
    templateUrl: './puntoInicio-internacion.html',
    styleUrls: ['./puntoInicio-internacion.scss'],
})
export class PuntoInicioInternacionComponent implements OnInit {

    public listado: any;
    public pacienteSeleccionado;
    public epicrisisPaciente = [];
    public showLoader = false;
    public internacionEjecucion;
    public conceptosInternacion;

    public registros = [
        { label: 'VALORACION INICIAL', handler: () => { this.nuevoRegistro(this.conceptosInternacion.valoracionInicial); } },
        { label: 'EVOLUCION', handler: () => { this.nuevoRegistro(this.conceptosInternacion.evolucion); } },
        { label: 'PLAN DE INDICACIONES', handler: () => { this.nuevoRegistro(this.conceptosInternacion.indicaciones); } },
        { label: 'EPICRISIS', handler: () => { this.nuevoRegistro(this.conceptosInternacion.epicrisis); } },

    ];
    public tipoPrestaciones = [];

    constructor(
        public servicioPrestacion: PrestacionesService,
        private plex: Plex,
        private router: Router,
        private elementoRupService: ElementosRUPService,
        private auth: Auth,
        public hudsService: HUDSService
    ) { }

    ngOnInit() {
        this.elementoRupService.ready.subscribe(() => {
            this.conceptosInternacion = this.elementoRupService.getConceptosInternacion();


        });
    }

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
        this.hudsService.generateHudsToken(this.auth.usuario, this.auth.organizacion, paciente, this.conceptosInternacion.epicrisis.term, this.auth.profesional, null, null).subscribe(hudsToken => {
            window.sessionStorage.setItem('huds-token', hudsToken.token);

            this.tipoPrestaciones = [
                this.conceptosInternacion.valoracionInicial.conceptId,
                this.conceptosInternacion.indicaciones.conceptId,
                this.conceptosInternacion.epicrisis.conceptId,
                this.conceptosInternacion.evolucion.conceptId
            ];
            this.servicioPrestacion.getPrestacionesXtipo(paciente.id, this.tipoPrestaciones).subscribe(prestaciones => {
                this.epicrisisPaciente = prestaciones;
                this.showLoader = false;
            });
        });
    }

    /**
     * Crea la prestacion de epicrisis
     * Nos rutea a la ejecucion de RUP.
     * @param paciente
     */
    nuevoRegistro(concepto) {
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.pacienteSeleccionado, concepto, 'ejecucion', 'internacion');
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
        this.servicioPrestacion.notificaRuta({ nombre: 'Punto inicio', ruta: 'internacion/inicio' });
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
