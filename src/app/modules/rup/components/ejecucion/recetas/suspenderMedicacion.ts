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

    public motivoSelector: any;
    public observacion: string;

    public suspenderMedicacion() {
        const filtroRecetas = this.seleccionRecetas.filter(receta => receta);
        const medicamento = filtroRecetas[0]?.medicamento.concepto.term;

        this.plex.confirm(`¿Está seguro que desea suspender ${filtroRecetas.length > 1 ? `las (${filtroRecetas.length}) medicaciones seleccionadas` : `<br><b>"${medicamento}"</b>`}?`, 'Atención').then(confirmacion => {
            if (confirmacion) {
                const recetaIds = this.seleccionRecetas.map(receta => receta.id);
                this.recetasService.suspender(recetaIds, this.profesional, this.motivoSelector.nombre, this.observacion).subscribe({
                    next: () => {
                        this.reset.emit();
                        this.plex.toast('success', 'Medicaciones suspendidas correctamente');
                    },
                    error: () => {
                        this.plex.toast('danger', 'Error al suspender las medicaciones');
                    }
                });
            }
        });
    }
}
