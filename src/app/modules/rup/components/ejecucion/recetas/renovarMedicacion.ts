import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecetaService } from 'projects/portal/src/app/services/receta.service';

@Component({
    selector: 'renovar-medicacion',
    templateUrl: 'renovarMedicacion.html',
    // styleUrls: ['renovarMedicacion.scss']
})

export class RenovarMedicacionComponent {
    constructor(
        public plex: Plex,
        private recetasService: RecetaService,
    ) { }

    @Input() seleccionRecetas: any[];
    @Input() profesional: any;

    @Output() reset: EventEmitter<any> = new EventEmitter<any>();

    public observacion: string;

    public renovarMedicacion() {
        const filtroRecetas = this.seleccionRecetas.filter(receta => receta);
        const medicamento = filtroRecetas[0]?.medicamento.concepto.term;

        this.plex.confirm(`¿Está seguro que desea renovar ${filtroRecetas.length > 1 ? `las (${filtroRecetas.length}) medicaciones seleccionadas` : `<br><b>"${medicamento}"</b>`}?`, 'Atención').then(confirmacion => {
            if (confirmacion) {
                const recetaIds = this.seleccionRecetas.map(receta => receta.id);
                this.recetasService.renovar(recetaIds).subscribe({
                    next: () => {
                        this.reset.emit();
                        this.plex.toast('success', 'Medicaciones renovadas correctamente');
                    },
                    error: () => {
                        this.plex.toast('danger', 'Error al renovar las medicaciones');
                    }
                });
            }
        });
    }
}
