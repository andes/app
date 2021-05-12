/**
 * NO MIRAR ESTA PANTALLA - TODAVÏA NO SE ESTA USANDO
 */

import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { InternacionResumenHTTP, IResumenInternacion } from '../../services/resumen-internacion.http';
import { getRegistros } from '../../../../../modules/rup/operators/populate-relaciones';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';

import { Timeline } from 'vis-timeline/peer';
import { DataSet } from 'vis-data';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';
import { ISectores } from 'src/app/interfaces/IOrganizacion';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'in-timeline-mapa-camas',
    templateUrl: './timeline-mapa-camas.component.html',
    styles: [`

        .vis-dot {
            border-color: var(--color);
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

    @ViewChild('prueba') timelineDiv;

    private idInternacion: string;

    public internacion: IResumenInternacion;

    public prestaciones: IPrestacion[];
    public prestacionesCopy: IPrestacion[];

    groups = [];

    desde: Date = moment().add(-3, 'M').startOf('M').toDate();
    hasta: Date = new Date();



    constructor(
        private activatedRoute: ActivatedRoute,
        public elementosRUPService: ElementosRUPService,
        private mapaCamasService: MapaCamasHTTP,

        private organizacionesService: OrganizacionService,
        private auth: Auth
    ) {

    }


    datos = {};


    groupBy(xs: ISnapshot[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }


    sectores$: Observable<ISectores[]>;
    sectorSelected;

    ngOnInit() {

        this.sectores$ = this.organizacionesService.getById(this.auth.organizacion.id).pipe(
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

    }


    onVisualizar() {
        this.mapaCamasService.historial(
            'internacion',
            'medica',
            this.desde,
            this.hasta,
            {}
        ).subscribe((movimientos) => {


            movimientos = movimientos.filter(
                m => m.sectores.some(s => s._id === this.sectorSelected.id)
            );

            movimientos.forEach((snap) => {
                const sectores = snap.sectores || [];

                const index = sectores.findIndex(i => i._id === this.sectorSelected._id);

                const sectorName = [...sectores.slice(index + 1)].map(s => s.nombre).join(', ');
                (snap as any).sectorName = sectorName;
            });

            const camasUnicas = {};

            const datos = [];

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

                        datos.push({
                            cama: k,
                            title: movimiento.sectorName + ', ' + movimiento.nombre,
                            desde: movimiento.fecha,
                            hasta: fechaFin,
                            paciente: movimiento.paciente,
                            idInternacion: movimiento.idInternacion
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

            let c = 0;
            const items = new DataSet(datos.map(d => {
                return {
                    group: d.cama,
                    id: c++,
                    content: d.paciente.apellido,
                    start: d.desde,
                    end: d.hasta
                };
            }));


            const groups = new DataSet(tracks as any);


            // Configuration for the Timeline
            const options = {
                width: '100%',
                height: '700px',
                margin: {
                    item: 20
                },
                stack: false,

            };

            // Create a Timeline
            const timeline = new Timeline(this.timelineDiv.nativeElement, null, options as any);
            // timeline.setOptions();
            timeline.setGroups(groups as any);
            timeline.setItems(items);


        });
    }





}
