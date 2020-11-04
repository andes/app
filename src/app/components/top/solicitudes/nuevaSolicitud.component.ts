import { Component, OnInit, OnDestroy } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PacienteService } from '../../../core/mpi/services/paciente.service';

@Component({
    selector: 'nueva-solicitud',
    templateUrl: './nuevaSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class NuevaSolicitudComponent implements OnInit, OnDestroy {
    private sub;
    paciente: any;
    fieldsDetalle = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado'];
    // ---- Variables asociadas a componentes paciente buscar
    resultadoBusqueda = null;
    pacienteSelected = null;
    loading = false;
    tipoSolicitud: any;

    constructor(
        private pacienteService: PacienteService,
        private plex: Plex,
        public sanitazer: DomSanitizer,
        public adjuntosService: AdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/solicitudes',
            name: 'TOP'
        }, {
            name: 'Nueva solicitud'
        }
        ]);
        this.sub = this.route.params.subscribe(params => {
            if (params['paciente']) {
                this.tipoSolicitud = params['tipo'];
                this.seleccionarPaciente(params['paciente']);
            } else {
                this.router.navigate(['./']);
            }
        });
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    // Componente paciente-listado
    seleccionarPaciente(paciente): void {
        this.pacienteService.getById(paciente).subscribe(
            resultado => {
                this.paciente = resultado;
            },
            error => {
                this.plex.info('danger', 'Intente nuevamente', 'Error en la búsqueda de paciente');
                this.volver();
            }
        );
    }

    volver() {
        this.router.navigate(['/solicitudes']);
    }

    returnForm() {
        this.volver();
    }
}
