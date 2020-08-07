import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { Subscription, combineLatest } from 'rxjs';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent implements OnInit, OnDestroy {
    public pacientes;
    public snapshot;
    public selectedCama;

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
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
        let cama = this.verificarPaciente(paciente);
        if (cama) {
            this.mapaCamasService.selectPaciente(null);
            this.plex.info('warning', `${paciente.nombreCompleto} (${paciente.documento}) se encuentra internado
                en la cama <strong>${cama.nombre}</strong> en <strong>${cama.sectores[cama.sectores.length - 1].nombre}</strong>
                de la unidad organizativa <strong>${cama.unidadOrganizativa.term}</strong>.`, 'Paciente ya internado');
        } else {
            this.mapaCamasService.selectPaciente(paciente.id);
        }
    }

    verificarPaciente(paciente: IPaciente) {
        let cama = null;
        this.snapshot.map((snap) => {
            if (snap.estado === 'ocupada') {
                if (snap.idCama !== this.selectedCama.idCama) {
                    if (snap.paciente.id === paciente.id) {
                        cama = snap;
                    }
                }
            }
        });
        return cama;
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }
}
