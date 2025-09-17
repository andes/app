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

    get groupedMedicamentos() {
        if (!this.seleccionRecetas) {
            return [];
        }
        const validRecetas = this.seleccionRecetas.filter(receta => receta && receta.medicamento && receta.medicamento.concepto);
        const grouped = validRecetas.reduce((acc, receta) => {
            const term = receta.medicamento.concepto.term;
            if (!acc[term]) {
                acc[term] = {
                    term: term,
                    count: 0,
                    profesional: receta.profesional
                };
            }
            acc[term].count++;
            return acc;
        }, {});
        return Object.values(grouped);
    }

    public suspenderMedicacion() {
        const medicamento = this.seleccionRecetas[0]?.medicamento.concepto.term;
        this.plex.confirm(`¿Está seguro que desea suspender ${this.seleccionRecetas.length > 1 ? `las (${this.seleccionRecetas.length}) medicaciones seleccionadas` : `<br><b>"${medicamento}"</b>`}?`, 'Atención').then(confirmacion => {
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
