/**
 * NO MIRAR ESTA PANTALLA - TODAVÏA NO SE ESTA USANDO
 */

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { cache } from '@andes/shared';
import { Timeline } from 'vis-timeline/peer';
import { DataSet } from 'vis-data';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';
import { ISectores } from 'src/app/interfaces/IOrganizacion';
import { forkJoin, Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
    selector: 'in-timeline-mapa-camas',
    templateUrl: './timeline-mapa-camas.component.html',
    styles: [`

        .vis-dot {
            border-color: var(--color);
        }

        .vis-item {
            background-color: var(--color);;
        }


        .vis-group.selected {
            background-color: var(--bg-color);
        }

        .vis-label.selected {
            background-color: var(--bg-color);
        }

        .vis-label {
            cursor: pointer;
        }
    `],
    encapsulation: ViewEncapsulation.None
})
export class TimelineMapaCamasComponent implements OnInit {

    private capa: string;
    private ambito: string;

    @ViewChild('prueba') timelineDiv;
    public internacion: IResumenInternacion;
    public prestaciones: IPrestacion[];
    public prestacionesCopy: IPrestacion[];
    datos = [];
    groups = [];
    movimientos;
    movimientosCopia;
    desde: Date = moment().add(-2, 'M').startOf('M').toDate();
    hasta: Date = new Date();
    public organizacion$: Observable<any>;
    public unidadesOrganizativas$: Observable<any>;
    public sectores$: Observable<ISectores[]>;
    public sectorSelected;
    public unidadOrganizativaSelect;
    public paciente: string;

    constructor(
        private activatedRoute: ActivatedRoute,
        public elementosRUPService: ElementosRUPService,
        private mapaCamasService: MapaCamasHTTP,
        private organizacionesService: OrganizacionService,
        private auth: Auth
    ) {

    }

    groupBy(xs: ISnapshot[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    ngOnInit() {
        this.capa = this.activatedRoute.snapshot.paramMap.get('capa');
        this.ambito = this.activatedRoute.snapshot.paramMap.get('ambito');

        this.organizacion$ = this.organizacionesService.getById(this.auth.organizacion.id).pipe(
            cache()
        );
        this.unidadesOrganizativas$ = this.organizacion$.pipe(pluck('unidadesOrganizativas'));

        this.sectores$ = this.organizacion$.pipe(
            map((organizacion) => {
                const { mapaSectores } = organizacion;

                function reverse(_sectores: ISectores[]) {
                    return _sectores.reduce(
                        (sectores, actual) => {
                            if (actual.hijos.length > 0) {
                                const rs = reverse(actual.hijos);
                                sectores = [...sectores, ...rs];
                            }
                            sectores = [...sectores, actual];
                            return sectores;
                        },
                        []
                    );
                }

                return reverse(mapaSectores);

            })
        );
        this.cargarMovimientosPeriodo();
    }

    cargarMovimientosPeriodo() {

        forkJoin([
            this.mapaCamasService.snapshot(
                this.ambito,
                this.capa,
                this.desde
            ),
            this.mapaCamasService.historial(
                this.ambito,
                this.capa,
                this.desde,
                this.hasta,
                {}
            )
        ]).subscribe(([estados, movimientos]) => {

            movimientos = [...estados, ...movimientos];

            this.movimientos = movimientos;
            this.movimientosCopia = movimientos;
            this.sectorName();
            this.cargarMovimientos();
        });


    }

    filtrar() {
        this.movimientos = this.movimientosCopia.slice();

        if (this.sectorSelected && this.movimientos.length > 0) {
            this.movimientos = this.movimientos.filter(
                m => m.sectores.some(s => s._id === this.sectorSelected.id)
            );

        }

        if (this.unidadOrganizativaSelect && this.movimientos.length > 0) {

            this.movimientos = this.movimientos.filter(
                m => m.unidadOrganizativa.conceptId === this.unidadOrganizativaSelect.conceptId);

        }


    }


    private sectorName() {

        this.movimientos.forEach((snap) => {
            const sectores = snap.sectores || [];

            const index = sectores.findIndex(i => i._id === snap.unidadOrganizativa._id);

            const sectorName = [...sectores.slice(index + 1)].map(s => s.nombre).join(', ');

            (snap as any).sectorName = sectorName;
        });
    }

    cargarMovimientos() {

        if (this.sectorSelected || this.unidadOrganizativaSelect || this.paciente) {

            this.timelineDiv.nativeElement.innerHTML = '';
            this.datos = [];

            this.filtrar();
            let movimientos = this.movimientos;
            const camasUnicas = {};



            const movs = this.groupBy(movimientos, 'idCama');
            for (const k in movs) {
                movs[k] = movs[k].sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
            }

            for (const k in movs) {
                const mov = movs[k];

                for (let i = 0; i < mov.length; i++) {

                    const movimiento = mov[i];

                    if (movimiento.estado === 'ocupada') {

                        let fechaFin = null;
                        for (let j = i + 1; j < mov.length; j++) {
                            if (mov[j] !== 'ocupada') {
                                fechaFin = mov[j].fecha;
                                break;
                            }
                        }
                        fechaFin = fechaFin || new Date();

                        this.datos.push({
                            cama: k,
                            title: movimiento.sectorName + ', ' + movimiento.nombre,
                            desde: movimiento.fecha,
                            hasta: fechaFin,
                            paciente: movimiento.paciente,
                            idInternacion: movimiento.idInternacion,
                            unidadOrganizativa: movimiento.unidadOrganizativa.term
                        });

                        camasUnicas[k] = {
                            id: k,
                            title: movimiento.sectorName + ', ' + movimiento.nombre
                        };

                    } else if (movimiento.estado === 'bloqueada') {
                        let fechaFin = null;
                        if (mov[i + 1]) {
                            fechaFin = mov[i + 1].fecha;
                        }
                        fechaFin = fechaFin || new Date();

                        this.datos.push({
                            cama: k,
                            title: movimiento.sectorName + ', ' + movimiento.nombre,
                            desde: movimiento.fecha,
                            hasta: fechaFin,
                            paciente: movimiento.paciente,
                            idInternacion: movimiento.idInternacion,
                            className: 'bloqueada',
                        });

                        camasUnicas[k] = {
                            id: k,
                            title: movimiento.sectorName + ', ' + movimiento.nombre
                        };

                    }

                }

            }

            const tracks = Object.values(camasUnicas).map((k: any) => {
                return {
                    'content': k.title,
                    'id': k.id,
                };
            });

            this.filtrarPaciente();

            let c = 0;
            const items = new DataSet(this.datos.map(d => {
                return {
                    group: d.cama,
                    id: c++,
                    content: d.paciente ? `${d.paciente.documento} | ${d.paciente.apellido} ${d.paciente.nombre}` : 'BLOQUEADA',
                    start: d.desde,
                    end: d.hasta,
                    className: d.className,
                    color: d.idInternacion?.slice(-6),
                    unidadOrganizativa: d.unidadOrganizativa
                };
            }));


            const groups = new DataSet(tracks as any);


            // Configuration for the Timeline
            const options = {
                width: '100%',
                height: '100%',
                margin: {
                    item: 20
                },
                stack: false,
                template: (item, element: HTMLElement, data) => {
                    if (data.color) {
                        element.parentElement.parentElement.style.setProperty(`--color`, '#' + data.color);
                    } else if (data.className) {
                        element.parentElement.parentElement.style.setProperty(`--color`, 'red');
                    }
                    if (data.content) {
                        return data.content;
                    }
                    return '';
                },
                tooltip: {
                    delay: 100,
                    template: function (originalItemData, parsedItemData) {
                        return `<span>${originalItemData.unidadOrganizativa}</span>`;
                    }
                }
            };

            // Create a Timeline
            const timeline = new Timeline(this.timelineDiv.nativeElement, null, options as any);
            // timeline.setOptions();
            timeline.setGroups(groups as any);
            timeline.setItems(items);

        }





    }


    private filtrarPaciente() {
        if (this.paciente && this.datos.length > 0) {

            const esNumero = Number.isInteger(Number(this.paciente));
            if (esNumero) {
                this.datos = this.datos.filter(dato => dato.paciente?.documento.includes(this.paciente));
            } else {

                this.datos = this.datos.filter(dato => {
                    let nombreApellido = dato.paciente?.apellido.concat(' ', dato.paciente.paciente);
                    if (nombreApellido?.toLowerCase().includes(this.paciente.toLowerCase())) {
                        return dato;
                    }
                }

                );

            }
        }


    }




}
