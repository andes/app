import { Component, OnInit } from '@angular/core';
import { PrestacionesService } from './../../services/prestaciones.service';
import { of, BehaviorSubject, Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { get } from 'lodash';

@Component({
    selector: 'rup-historial',
    templateUrl: 'historial.html'
})
export class HistorialComponent implements OnInit {
    private pacienteId$ = new BehaviorSubject<string>(null);
    public historial$: Observable<any[]>;
    public filteredHistorial: any[] = [];
    public showFullHistory = false;
    public isLoading = false;

    // parámetros opcionales
    public params: any = {
        fechaDesde: null,
        cantidad: null,
        ecl: null
    };

    // estos vienen de RUP cuando se use en una prestación
    public registro: any;
    public prestacion: any;

    constructor(
        private prestacionesService: PrestacionesService
    ) { }

    ngOnInit() {
        const pacienteId = get(this.prestacion, 'paciente.id');
        this.pacienteId$.next(pacienteId);

        this.isLoading = true;
        this.historial$ = this.pacienteId$.pipe(
            switchMap(id => id ? this.prestacionesService.getConceptosByPaciente(id) : of([])),
            map(registros => {
                const registrosConcepto = registros.filter(r => r.concepto.conceptId === this.registro.concepto.conceptId);

                // aplicar filtros
                let filtered = registrosConcepto;
                if (this.params.fechaDesde) {
                    const fechaDesde = new Date(this.params.fechaDesde);
                    filtered = filtered.filter(r => new Date(r.createdAt) >= fechaDesde);
                }
                if (this.params.ecl) {
                    // Placeholder: acá deberías resolver el ECL contra SNOMED si corresponde
                }

                // ordenar por fecha desc
                const sorted = filtered.sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                this.filteredHistorial = sorted;
                this.isLoading = false;

                // limitar por cantidad si está seteado
                if (this.params.cantidad) {
                    return sorted.slice(0, this.params.cantidad);
                }

                return sorted;
            })
        );
    }

    toggleFullHistory() {
        this.showFullHistory = !this.showFullHistory;
    }
}
