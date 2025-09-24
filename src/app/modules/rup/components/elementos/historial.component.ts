/* eslint-disable no-console */
import { Component, OnInit, Input } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { of } from 'rxjs';

@Component({
    selector: 'rup-historial',
    templateUrl: './historial.html'
})
@RupElement('HistorialComponent')
export class HistorialComponent extends RUPComponent implements OnInit {
    @Input() registro: any;
    @Input() prestacion: any;
    @Input() params: any = {};
    @Input() conceptId?: string;
    @Input() fechaDesde?: Date;
    @Input() cantidad?: number;
    @Input() ecl?: string;

    public historial: any[] = [];
    public isLoading = false;

    ngOnInit() {
        const pacienteId = this.prestacion?.paciente?.id;
        const conceptId = this.registro?.concepto?.conceptId;

        if (!pacienteId || !conceptId) {
            return;
        }

        this.isLoading = true;

        this.prestacionesService.getByPaciente(pacienteId).pipe(
            map(prestaciones => {
                let registros: any[] = [];

                // armo listado de registros
                prestaciones.forEach(p => {
                    p.ejecucion?.registros?.forEach(r => {
                        if (r.valor) {
                            registros.push({
                                fecha: p.ejecucion.fecha,
                                valor: r.valor,
                                concepto: r.concepto?.term,
                                conceptId: r.concepto?.conceptId,
                                prestacion: p.solicitud?.tipoPrestacion?.term,
                                prestacionId: p._id
                            });
                        }
                    });
                });

                // filtro por concepto puntual
                if (conceptId) {
                    registros = registros.filter(r => r.conceptId === conceptId);
                }

                // filtro por fecha desde
                if (this.fechaDesde) {
                    registros = registros.filter(r =>
                        new Date(r.fecha).getTime() >= new Date(this.fechaDesde).getTime()
                    );
                }

                // orden descendente por fecha
                registros.sort((a, b) =>
                    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                );

                // límite de cantidad
                if (this.cantidad) {
                    registros = registros.slice(0, this.cantidad);
                }

                return registros;
            }),
            switchMap(registros => {
                // filtro por ECL (si está definido)
                if (this.ecl) {
                    return this.eclqueriesServicies.search({ key: this.ecl }).pipe(
                        switchMap((eclResult: any) => {
                            const eclQuery = Array.isArray(eclResult) ? eclResult[0] : eclResult;
                            if (eclQuery?.valor) {
                                return this.snomedService.getQuery({ expression: eclQuery.valor }).pipe(
                                    map((concepts: any[]) => {
                                        const validConcepts = concepts.map(c => c.conceptId);
                                        return registros.filter(r => validConcepts.includes(r.conceptId));
                                    })
                                );
                            }
                            return of(registros);
                        })
                    );
                }
                return of(registros);
            })
        ).subscribe(historial => {
            this.historial = historial;
            this.isLoading = false;
        });
    }

    getData() { return null; }
    setData(_: any) { }
    validate() { return true; }
}
