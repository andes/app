import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { Subscription, combineLatest } from 'rxjs';
import { IngresoPacienteService } from './ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent implements OnInit, OnDestroy {
    public snapshot;
    public selectedCama;

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService,
        private ingresoPacienteService: IngresoPacienteService,
        private pacienteService: PacienteService
    ) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.snapshot$,
            this.mapaCamasService.selectedCama,
        ).subscribe(([snapshot, cama]) => {
            this.snapshot = snapshot;
            this.selectedCama = cama;
        });
    }

    onPacienteSelected(paciente: IPaciente) {
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        const cama = this.verificarPaciente(paciente);
        if (cama) {
            this.plex.info('warning', `${paciente.nombreCompleto} (${paciente.documento}) se encuentra internado
                en la cama <strong>${cama.nombre}</strong> en <strong>${cama.sectores[cama.sectores.length - 1].nombre}</strong>
                de la unidad organizativa <strong>${cama.unidadOrganizativa.term}</strong>.`, 'Paciente ya internado');
        } else {
            this.ingresoPacienteService.selectPaciente(paciente.id);
        }
    }

    verificarPaciente(paciente: IPaciente) {
        let cama = null;
        this.snapshot.map((snap) => {
            if (snap.estado === 'ocupada') {
                if (snap.id !== this.selectedCama.id) {
                    if (snap.paciente.id === paciente.id) {
                        cama = snap;
                    }
                }
            }
        });
        return cama;
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        }
    }
}
