import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';
import { cache } from '@andes/shared';
import { finalize, map } from 'rxjs/operators';
import { Observable, combineLatest, forkJoin } from 'rxjs';

@Component({
    selector: 'rup-vacuna',
    templateUrl: 'vacunas.html'
})
@RupElement('VacunasComponent')
export class VacunasComponent extends RUPComponent implements OnInit {
    public vacunas$: Observable<any[]>;
    public categorias$: Observable<any[]>;
    public condiciones$: Observable<any[]>;
    public laboratorios$: Observable<any[]>;
    public esquemas$: Observable<any[]>;
    public dosis$: Observable<any[]>;
    private validacion = false;
    public vacunasEncontradas;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                vacuna: {
                    fechaAplicacion: this.prestacion.ejecucion.fecha
                }
            };
        } else {
            if (!this.validacion && !this.soloValores) {
                this.loadVacunas();
                this.loadEsquemas();
                this.loadDosis();
            }
            this.getHistorialVacunas();
        }

        this.categorias$ = this.vacunasService.getNomivacCategorias({ sort: 'nombre' }).pipe(cache());
        this.condiciones$ = this.vacunasService.getNomivacCondiciones({ habilitado: true, sort: 'nombre' }).pipe(cache());
        this.laboratorios$ = this.vacunasService.getNomivacLaboratorios({ habilitado: true, sort: 'nombre' }).pipe(cache());

    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }


    loadVacunas() {
        let filtroCalendario = 'NO';
        if (this.registro.valor.vacuna.categoria && this.registro.valor.vacuna.categoria.nombre === 'Vacuna de calendario Nacional') {
            filtroCalendario = 'SI';
        }
        this.vacunas$ = this.vacunasService.getNomivacVacunas({ habilitado: true, calendarioNacional: filtroCalendario, sort: 'nombre' }).pipe(
            map(vacunas => {
                return vacunas.map((v) => {
                    return { _id: v._id, codigo: v.codigo, nombre: v.nombre, snomed_conceptId: v.snomed_conceptId };
                });
            })
        );
    }


    loadEsquemas() {
        if (this.registro.valor.vacuna.vacuna && this.registro.valor.vacuna.condicion) {
            this.esquemas$ = this.vacunasService.getNomivacEsquemas({ habilitado: true, vacuna: this.registro.valor.vacuna.vacuna._id, condicion: this.registro.valor.vacuna.condicion._id, sort: 'nombre' }).pipe(
                map(esquemas => {
                    return esquemas.map((e) => {
                        return { _id: e._id, codigo: e.codigo, nombre: e.nombre };
                    });
                })
            );
        } else {
            this.esquemas$ = null;
        }
    }

    loadDosis() {
        this.registro.valor.vacuna.dosis = null;
        if (this.registro.valor.vacuna.esquema) {
            this.dosis$ = this.vacunasService.getNomivacDosis({ habilitado: true, esquema: this.registro.valor.vacuna.esquema._id, sort: 'orden' }).pipe(
                map(dosis => {
                    if (this.vacunasEncontradas && this.vacunasEncontradas.length) {
                        return dosis.filter(d => !(this.vacunasEncontradas.find(v => d.nombre === v.dosis)));
                    } else {
                        return dosis.slice(0, 1);
                    }
                })
            );
        } else {
            this.dosis$ = null;
        }
    }


    getHistorialVacunas() {
        this.validacion = !this.ejecucionService;
        if (!this.validacion && !this.soloValores) {
            const conceptoBuscar = this.registro.concepto.conceptId;
            const rupVacunas$ = this.prestacionesService.getRegistrosHuds(this.paciente.id, conceptoBuscar);
            const nomivacVacunas$ = this.vacunasService.get(this.paciente.id);
            forkJoin([
                rupVacunas$,
                nomivacVacunas$
            ]).pipe(
                map(([registrosRup, registrosNomivac]) => {
                    let listaVacunas = [];
                    if (registrosRup && registrosRup.length) {
                        registrosRup.sort(function (a, b) {
                            let dateA = new Date(a.fecha).getTime();
                            let dateB = new Date(b.fecha).getTime();
                            return dateA > dateB ? -1 : 1;
                        });
                        listaVacunas = registrosRup.map(r => {
                            return {
                                fechaAplicacion: r.fecha,
                                vacuna: r.registro.valor.vacuna.vacuna.nombre,
                                condicion: r.registro.valor.vacuna.condicion.nombre,
                                esquema: r.registro.valor.vacuna.esquema.nombre,
                                dosis: r.registro.valor.vacuna.dosis.nombre
                            };
                        });
                    }
                    if (registrosNomivac && registrosNomivac.length) {
                        let nomivacFiltradas = registrosNomivac.filter((vac) =>
                            vac.codigo && vac.codigo === this.registro.valor.vacuna.vacuna.codigo.toString()
                        );
                        if (listaVacunas && listaVacunas.length) {
                            let filtroDuplicadas = nomivacFiltradas.filter(v => {
                                if (!listaVacunas.find(vr => vr.vacuna === v.vacuna && vr.dosis === v.dosis)) { return v; }
                            });
                            listaVacunas = [...listaVacunas, ...filtroDuplicadas];
                        } else {
                            listaVacunas = [...nomivacFiltradas];
                        }
                    }
                    return listaVacunas;
                })
            ).subscribe(d => {
                this.vacunasEncontradas = d;
            });
        }
    }

    checkDosis() {
        if (this.registro.valor.vacuna.dosis && this.vacunasEncontradas && this.vacunasEncontradas.length) {
            const ultimoRegistro = this.vacunasEncontradas[0];
            const tiempoInterdosis = this.registro.valor.vacuna.dosis.tiempoInterdosis;
            let diasdiferencia = this.prestacion.ejecucion.fecha.getTime() - ultimoRegistro.fechaAplicacion.getTime();
            let contdias = Math.round(diasdiferencia / (1000 * 60 * 60 * 24));
            if (contdias <= tiempoInterdosis) {
                this.plex.info('danger', 'No se cumple el tiempo interdosis', 'Problemas con la dosis seleccionada');
                this.registro.valor.vacuna.dosis = Object.assign({}, null);
            }
        }

    }

    onValidate() {
        if (!this.registro.valor.vacuna.dosis.codigo) {
            return false;
        } else {
            return true;
        }
    }

}
