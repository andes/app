import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { RecetaService } from 'src/app/services/receta.service';

@Component({
    selector: 'suspender-medicacion',
    templateUrl: 'suspenderMedicacion.html',
    styleUrls: ['suspenderMedicacion.scss']
})

export class SuspenderMedicacionComponent implements AfterViewChecked {
    constructor(
        public plex: Plex,
        private recetasService: RecetaService,
        private cdr: ChangeDetectorRef
    ) { }

    @Input() seleccionRecetas: any[];
    @Input() motivosSuspension: any[];
    @Input() profesional: any;

    @Output() reseted: EventEmitter<any> = new EventEmitter<any>();

    public motivoSelector: any;
    public observacion: string;

    get groupedMedicamentos() {
        if (!this.seleccionRecetas || !Array.isArray(this.seleccionRecetas)) {
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
        if (!this.seleccionRecetas || !Array.isArray(this.seleccionRecetas) || this.seleccionRecetas.length === 0) {
            this.plex.toast('warning', 'No hay recetas seleccionadas para suspender');
            return;
        }

        const medicamento = this.seleccionRecetas[0]?.medicamento?.concepto?.term || 'medicamento';
        this.plex.confirm(`¿Está seguro que desea suspender ${this.seleccionRecetas.length > 1 ? `las (${this.seleccionRecetas.length}) medicaciones seleccionadas` : `<br><b>"${medicamento}"</b>`}?`, 'Atención').then(confirmacion => {
            if (confirmacion) {
                const recetaIds = this.seleccionRecetas.map(receta => receta.id).filter(id => id != null);
                this.recetasService.suspender(recetaIds, this.profesional, this.motivoSelector?.nombre || 'Sin motivo', this.observacion).subscribe({
                    next: () => {
                        this.reseted.emit();
                        this.plex.toast('success', 'Medicaciones suspendidas correctamente');
                    },
                    error: () => {
                        this.plex.toast('danger', 'Error al suspender las medicaciones');
                    }
                });
            }
        });
    }

    ngAfterViewChecked() {
        if (this.cdr) {
            this.cdr.detectChanges();
        }
    }
}
