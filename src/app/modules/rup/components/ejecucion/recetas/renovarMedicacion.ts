import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecetaService } from 'projects/portal/src/app/services/receta.service';

@Component({
    selector: 'renovar-medicacion',
    templateUrl: 'renovarMedicacion.html',
})

export class RenovarMedicacionComponent {
    constructor(
        public plex: Plex,
        private recetasService: RecetaService,
    ) { }

    @Input() seleccionRecetas: any[];
    @Input() profesional: any;

    @Output() reset: EventEmitter<any> = new EventEmitter<any>();
    @Output() cerrar: EventEmitter<any> = new EventEmitter<any>();

    public renovarMedicacion() {
        const recetaIds = this.seleccionRecetas
            .filter(receta => receta !== null)
            .map(({ id }) => id);

        this.recetasService.renovar(recetaIds, this.profesional).subscribe({
            next: () => {
                this.reset.emit();
                this.cerrar.emit();
                this.plex.toast('success', 'Medicaciones renovadas correctamente');
            },
            error: () => {
                this.plex.toast('danger', 'Error al renovar las medicaciones');
            }
        });
    }
}
