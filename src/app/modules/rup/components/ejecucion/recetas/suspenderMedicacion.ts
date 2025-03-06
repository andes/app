import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecetaService } from 'projects/portal/src/app/services/receta.service';

@Component({
    selector: 'suspender-medicacion',
    templateUrl: 'suspenderMedicacion.html',
    styleUrls: ['suspenderMedicacion.scss']
})

export class SuspenderMedicacionComponent {
    constructor(
        public plex: Plex,
        private recetasService: RecetaService,
    ) { }

    @Input() seleccionRecetas: any[];
    @Input() motivosSuspension: any[];
    @Input() profesional: any;

    @Output() reset: EventEmitter<any> = new EventEmitter<any>();
    @Output() cerrar: EventEmitter<any> = new EventEmitter<any>();

    public motivoSelector: any;
    public observacion: string;

    public suspenderMedicacion() {
        const recetaIds = this.seleccionRecetas
            .filter(receta => receta !== null)
            .map(({ id }) => id);

        this.recetasService.suspender(recetaIds, this.profesional, this.motivoSelector.nombre, this.observacion).subscribe({
            next: () => {
                this.reset.emit();
                this.cerrar.emit();
                this.plex.toast('success', 'Medicaciones suspendidas correctamente');
            },
            error: () => {
                this.plex.toast('danger', 'Error al suspender las medicaciones');
            }
        });

    }
}
