import { Plex } from '@andes/plex';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { InformeEstadisticaService } from 'src/app/modules/rup/services/informe-estadistica.service';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';
import { MapaCamasService } from '../../services/mapa-camas.service';

interface Periodo {
    desde: moment.Moment;
    hasta: moment.Moment;
}

@Component({
    selector: 'app-periodos-censables',
    templateUrl: './periodos-censables.html',
    styleUrls: ['./periodos-censables.scss']
})

export class PeriodosCensablesComponent implements OnInit {
    prestacion;
    informeEstadistica: IInformeEstadistica;
    capa: string;
    agregar = false;
    nuevoPeriodo: Periodo;
    periodos: Periodo[] = [];
    error = null;
    loading = false;

    @Input() editable;
    @ViewChild('scrollbottom') sidebar: ElementRef;

    constructor(
        private mapaCamasService: MapaCamasService,
        private servicioPrestacion: PrestacionesService,
        private informeEstadisticaService: InformeEstadisticaService,
        private plex: Plex
    ) { }

    ngOnInit() {
        combineLatest([
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.informeEstadistica$,
            this.mapaCamasService.capa2
        ]).subscribe(([prestacion, informeEstadistica, capa]: [any, IInformeEstadistica, string]) => {
            this.capa = capa;
            this.prestacion = prestacion;
            this.informeEstadistica = informeEstadistica;

            if (capa === 'estadistica-v2' || (capa === 'estadistica' && informeEstadistica)) {
                if (informeEstadistica?.periodosCensables?.length) {
                    this.periodos = informeEstadistica.periodosCensables.map(p => ({
                        desde: moment(p.desde),
                        hasta: p.hasta ? moment(p.hasta) : null
                    }));
                } else if (informeEstadistica?.informeIngreso?.esCensable) {
                    this.periodos = [];
                }
            } else {
                const primerRegistro = prestacion?.ejecucion?.registros[0];
                if (!!primerRegistro?.esCensable) {
                    this.periodos = prestacion?.periodosCensables || [];
                }
            }
        });

        this.initNuevoPeriodo();
    }

    private initNuevoPeriodo() {
        this.nuevoPeriodo = {
            desde: moment(),
            hasta: null
        };
    }

    private periodoInvalido(desde, hasta) {
        if (desde > hasta) {
            this.error = 'El periodo elegido es inválido';
            return true;
        }

        return false;
    }

    private periodoDuplicado(desde, hasta) {
        if (this.periodos.find((periodo) => moment(periodo.desde)?.isSame(desde, 'day') && moment(periodo.hasta)?.isSame(hasta, 'day'))) {
            this.error = 'El periodo ingresado ya existe';
            return true;
        };

        return false;
    }

    public periodoSuperpuesto(desde, hasta) {
        let superpuesto = false;
        const existeIlimitado = this.periodos.some(periodo => periodo.hasta === null);

        if (!hasta && existeIlimitado) {
            superpuesto = true;
        }

        for (const periodo of this.periodos) {
            const periodoDesde = moment(periodo.desde);
            const periodoHasta = moment(periodo.hasta);

            if (hasta) {
                if (periodoHasta.isBetween(desde, hasta) || periodoDesde.isBetween(desde, hasta)) {
                    superpuesto = true;
                    break;
                }
            } else {
                if (periodoHasta.isAfter(desde) || periodoHasta.isSame(desde, 'day')) {
                    superpuesto = true;
                    break;
                }
            }
        }

        if (superpuesto) {
            this.error = 'El periodo no debe superponerse a otro';
        }

        return superpuesto;
    }

    private guardarPrestacion(): Observable<any> {
        if (this.informeEstadistica) {
            const patchData: any = {
                periodosCensables: this.periodos.map(p => ({
                    desde: moment(p.desde).toDate(),
                    hasta: p.hasta ? moment(p.hasta).toDate() : null
                })),
                informeIngreso: {
                    ...this.informeEstadistica.informeIngreso,
                    esCensable: !!this.periodos?.length
                }
            };
            return this.informeEstadisticaService.patch(this.informeEstadistica._id || this.informeEstadistica.id, patchData);
        }

        if (this.prestacion) {
            const registros = this.prestacion.ejecucion?.registros;

            if (!!this.periodos?.length) {
                registros[0].esCensable = true;
            } else {
                delete registros[0].esCensable;
            }

            const params: any = {
                op: 'periodosCensables',
                periodosCensables: this.periodos,
                registros,
            };

            return this.servicioPrestacion.patch(this.prestacion.id, params);
        }

        return of(null);
    }

    private addPeriodoSinLimite(desde) {
        const nuevoPeriodo = { desde, hasta: null };

        if (!this.periodoSuperpuesto(desde, null)) {
            this.guardarPeriodo(nuevoPeriodo);
        }
    }

    public addPeriodoLimitado(desde, hasta) {
        const fechaHasta = moment(hasta);

        if (!this.periodoInvalido(desde, hasta)) {
            if (!this.periodoDuplicado(desde, hasta) && !this.periodoSuperpuesto(desde, hasta)) {
                this.guardarPeriodo({ ...this.nuevoPeriodo, fechaHasta });
            }
        }
    }

    public agregarPeriodo() {
        const { desde, hasta } = this.nuevoPeriodo;

        if (hasta) {
            if (!this.periodoInvalido(desde, hasta)) {
                this.addPeriodoLimitado(desde, hasta);
            }
        } else {
            this.addPeriodoSinLimite(desde);
        }
    }

    public toggleAgregar() {
        this.agregar = !this.agregar;
    }

    public eliminarPeriodo(index) {
        this.periodos?.splice(index, 1);
        this.error = null;

        this.guardarPrestacion().subscribe({
            error: () => this.plex.toast('danger', 'Ha ocurrido un error al eliminar el periodo')
        });
    }

    private scrollBottom() {
        const sidebar = document.getElementById('sidebarCamas').querySelector('.plex-box-content');
        sidebar.scrollTo(0, sidebar.scrollHeight);
    }

    public guardarPeriodo(nuevoPeriodo) {
        this.error = null;
        this.loading = true;
        this.periodos.push(nuevoPeriodo);

        this.guardarPrestacion().subscribe({
            complete: () => {
                this.plex.toast('success', 'Periodos guardados exitosamente');
                this.toggleAgregar();
                this.initNuevoPeriodo();
                this.scrollBottom();
            },
            error: () =>
                this.plex.toast('danger', 'Ha ocurrido un error al guardar el periodo')
        }).add(() => this.loading = false);
    }

    public cancelar() {
        this.agregar = false;
        this.error = null;
        this.initNuevoPeriodo();
        this.scrollBottom();
    }
}
