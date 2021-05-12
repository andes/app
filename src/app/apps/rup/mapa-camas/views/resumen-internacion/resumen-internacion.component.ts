import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { InternacionResumenHTTP, IResumenInternacion } from '../../services/resumen-internacion.http';
import { getRegistros } from '../../../../../modules/rup/operators/populate-relaciones';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';

import { Timeline } from 'vis-timeline/peer';
import { DataSet } from 'vis-data';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { Plex } from '@andes/plex';
import { HeaderPacienteComponent } from 'src/app/components/paciente/headerPaciente.component';
import { IPlexTableColumns } from '@andes/plex/src/lib/table/table.interfaces';

@Component({
    selector: 'in-resumen-internacion',
    templateUrl: './resumen-internacion.component.html',
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

        /* .vis-background.vis-item {
            background-color: #FF000022;
        } */
    `],
    encapsulation: ViewEncapsulation.None
})
export class ResumenInternacionComponent implements OnInit {

    @ViewChild('prueba') timelineDiv;

    private idInternacion: string;

    public internacion: IResumenInternacion;

    public prestaciones: IPrestacion[];

    groups = [];

    desde: Date;
    hasta: Date;


    groupSelected = 'prestaciones';
    dataSet: IDataSet[] = [];

    dataSetVisible$ = new BehaviorSubject<IDataSet[]>([]);


    constructor(
        private activatedRoute: ActivatedRoute,
        private prestacionService: PrestacionesService,
        private resumenInternacionService: InternacionResumenHTTP,
        public elementosRUPService: ElementosRUPService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private pacienteService: PacienteService,
        private plex: Plex
    ) {

    }

    capa = '';

    public columns: IPlexTableColumns[] = [
        {
            key: 'term',
            label: 'Nombre',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.term.localeCompare(b.term),
            // filterBy: (a: any) => a.term
        },
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.organizacion.nombre.localeCompare(b.organizacion.nombre),
            // filterBy: (a: any) => a.organizacion.nombre
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.profesional.nombre.localeCompare(b.profesional.nombre)
        },
        {
            key: 'fecha',
            label: 'Fecha Registro',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.fecha.getTime() - b.fecha.getTime(),
            right: true

        }
    ];

    getInternacion(): Observable<any> {
        if (this.capa === 'estadistica') {
            return this.prestacionService.getById(this.idInternacion).pipe(
                map(prestacion => {
                    return {
                        paciente: prestacion.paciente,
                        fechaIngreso: prestacion.ejecucion.registros[0]?.valor.informeIngreso.fechaIngreso,
                        fechaEgreso: prestacion.ejecucion.registros[1]?.valor.InformeEgreso.fechaEgreso,
                    };
                })
            );
        } else {
            return this.resumenInternacionService.get(this.idInternacion);
        }
    }

    ngOnInit() {
        this.idInternacion = this.activatedRoute.snapshot.paramMap.get('idInternacion');
        this.capa = this.activatedRoute.snapshot.paramMap.get('capa');



        this.getInternacion().subscribe((resumen) => {
            this.internacion = resumen as any;

            this.pacienteService.getById(resumen.paciente.id).subscribe(paciente => {

                this.plex.setNavbarItem(HeaderPacienteComponent, { paciente });
            });

            combineLatest(
                this.procesarHUDS(),
                this.getMovimientosInternacion()
            ).subscribe(([huds, movimientos]) => {
                this.craearTimelinea(huds, movimientos);
            });





        });
    }
    _movimientos = [];


    procesarHUDS() {
        return this.getHUDS(this.internacion.paciente).pipe(
            map((prestaciones: IPrestacion[]) => {

                this.prestaciones = prestaciones
                    .filter(prestacion => prestacion.estadoActual.tipo === 'validada')
                    .filter((prestacion) => {
                        const fechaIni = moment(this.internacion.fechaIngreso);
                        const fechaFin = moment(this.internacion.fechaEgreso);
                        const fecha = moment(prestacion.ejecucion.fecha);
                        return fecha.isSameOrBefore(fechaFin, 'd') && fecha.isSameOrAfter(fechaIni, 'd');
                    }).sort((a, b) => {
                        return a.ejecucion.fecha.getTime() - b.ejecucion.fecha.getTime();
                    });



                const solicitudes = filtrarPorRegistros(
                    this.prestaciones,
                    (item) => item.registro.esSolicitud
                );

                const procedimientos = filtrarPorRegistros(
                    this.prestaciones,
                    (item) =>
                        !item.registro.esSolicitud &&
                        ['procedimiento', 'entidad observable', 'régimen/tratamiento'].includes(item.registro.concepto.semanticTag)
                );

                const diagnosticos = filtrarPorRegistros(
                    this.prestaciones,
                    (item) => ['trastorno', 'hallazgo', 'situación', 'evento'].includes(item.registro.concepto.semanticTag)
                );


                this.prestaciones.forEach(p => {
                    this.dataSet.push({
                        group: 'prestaciones',
                        id: p.id,
                        idPrestacion: p.id,
                        organizacion: p.solicitud.organizacion,
                        profesional: {
                            id: p.solicitud.profesional.id,
                            nombre: p.solicitud.profesional.apellido + ' ' + p.solicitud.profesional.nombre
                        },
                        fecha: p.ejecucion.fecha,
                        term: p.solicitud.tipoPrestacion.term
                    });
                });


                solicitudes.forEach(p => {
                    this.dataSet.push({
                        group: 'solicitudes',
                        id: p.registro.id,
                        idPrestacion: p.prestacion.id,
                        organizacion: p.prestacion.solicitud.organizacion,
                        profesional: {
                            id: p.prestacion.solicitud.profesional.id,
                            nombre: p.prestacion.solicitud.profesional.apellido + ' ' + p.prestacion.solicitud.profesional.nombre
                        },
                        fecha: p.prestacion.ejecucion.fecha,
                        term: p.registro.concepto.term
                    });
                });

                procedimientos.forEach(p => {
                    this.dataSet.push({
                        group: 'procedimientos',
                        id: p.registro.id,
                        idPrestacion: p.prestacion.id,
                        organizacion: p.prestacion.solicitud.organizacion,
                        profesional: {
                            id: p.prestacion.solicitud.profesional.id,
                            nombre: p.prestacion.solicitud.profesional.apellido + ' ' + p.prestacion.solicitud.profesional.nombre
                        },
                        fecha: p.prestacion.ejecucion.fecha,
                        term: p.registro.concepto.term
                    });
                });

                diagnosticos.forEach(p => {
                    this.dataSet.push({
                        group: 'diagnosticos',
                        id: p.registro.id,
                        idPrestacion: p.prestacion.id,
                        organizacion: p.prestacion.solicitud.organizacion,
                        profesional: {
                            id: p.prestacion.solicitud.profesional.id,
                            nombre: p.prestacion.solicitud.profesional.apellido + ' ' + p.prestacion.solicitud.profesional.nombre
                        },
                        fecha: p.prestacion.ejecucion.fecha,
                        term: p.registro.concepto.term
                    });
                });

                return this.dataSet;

            })
        );
    }

    getMovimientosInternacion() {
        return this.mapaCamasHTTP.historial(
            'internacion',
            this.capa,
            this.internacion.fechaIngreso,
            this.internacion.fechaEgreso || new Date(),
            { idInternacion: this.idInternacion }
        ).pipe(
            map((movimientos) => {

                const dataSetMovimientos = [];
                movimientos = movimientos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

                for (let i = 1; i < movimientos.length; i++) {
                    const prev = movimientos[i - 1];
                    const actual = movimientos[i];

                    const sectorName = [...prev.sectores].map(s => s.nombre).join(', ');

                    dataSetMovimientos.push({
                        group: 'movimientos',
                        start: prev.fecha,
                        end: actual.fecha,
                        content: prev.unidadOrganizativa.term,
                        type: 'range',
                        term: sectorName + ', ' + prev.nombre
                    });
                }

                if (movimientos[movimientos.length - 1].estado === 'ocupada') {
                    const prev = movimientos[movimientos.length - 1];
                    const sectorName = [...prev.sectores].map(s => s.nombre).join(', ');
                    dataSetMovimientos.push({
                        group: 'movimientos',
                        start: prev.fecha,
                        end: new Date(),
                        content: prev.unidadOrganizativa.term,
                        type: 'range',
                        term: sectorName + ', ' + prev.nombre
                    });
                }

                return dataSetMovimientos;
            })

        );
    }


    craearTimelinea(huds, movimientos) {
        const valores = [];

        huds.forEach((i) => {
            valores.push({
                group: i.group,
                id: i.id,
                content: ' ',
                start: i.fecha,
                term: i.term
            });
        });

        movimientos.forEach(m => {
            valores.push(m);
        });

        this.groups = [
            {
                'content': 'Movimientos',
                'id': 'movimientos',
                'value': 1,
                className: 'movimientos',
                color: '#0070cc',
                selectable: false
            },
            {
                'content': 'Prestaciones',
                'id': 'prestaciones',
                'value': 1,
                className: 'prestaciones selected',
                color: '#0070cc',
                selectable: true
            },
            {
                'content': 'Solicitudes',
                'id': 'solicitudes',
                'value': 2,
                className: 'solicitudes',
                color: '#0070cc',
                selectable: true
            },
            {
                'content': 'Procedimientos',
                'id': 'procedimientos',
                'value': 2,
                className: 'procedimientos',
                color: '#92278e',
                selectable: true
            },
            {
                'content': 'Diagnosticos',
                'id': 'diagnosticos',
                'value': 2,
                className: 'diagnosticos',
                color: '#FA8072',
                selectable: true
            },
        ];

        const groups = new DataSet(this.groups);

        const items = new DataSet(valores);

        // Configuration for the Timeline
        const options = {
            width: '100%',
            height: '220px',
            margin: {
                item: 20
            },
            // verticalScroll: true,
            type: 'point',
            stack: false,
            selectable: false,
            // groupHeightMode: 'fixed',
            template: (item, element: HTMLElement, data) => {
                const group = this.groups.find(g => g.id === data.group);
                const parent = element.parentElement;
                parent.style.setProperty(`--color`, group.color);
                if (data.content) {
                    return data.content;
                }
                return '';
            },
            tooltip: {
                delay: 100,
                template: function (originalItemData, parsedItemData) {
                    return `<span>${originalItemData.term}</span>`;
                }
            }
        };

        // Create a Timeline
        const timeline = new Timeline(this.timelineDiv.nativeElement, null, options as any);
        timeline.setGroups(groups);
        timeline.setItems(items);

        timeline.on('select', function (properties) {
            const ii = (timeline as any).itemsData.get(properties.items[0]);
        });

        timeline.on('changed', () => {
            const element: HTMLElement = this.timelineDiv.nativeElement;

            this.groups.forEach((g) => {
                const es: HTMLElement[] = <any>element.querySelectorAll(`.vis-group.${g.id}`);
                es.forEach((e: any) => e.style.setProperty(`--bg-color`, g.color + '2e'));

                const es2: HTMLElement[] = <any>element.querySelectorAll(`.vis-label.${g.id}`);
                es2.forEach((e: any) => e.style.setProperty(`--bg-color`, g.color + '2e'));
            });
        });

        timeline.on('click', (properties) => {
            const { group, what } = properties;
            if (what === 'group-label') {
                const groupInfo = this.groups.find(p => p.id === group);

                if (!groupInfo.selectable) {
                    return;
                }

                this.groups.forEach((groupItem) => {
                    const _className: string = groupItem.className;
                    const _isSelected = _className.endsWith('selected');
                    if (_isSelected) {
                        groupItem.className = groupItem.className.substring(0, groupItem.className.length - 9);
                    }
                });


                const className: string = groupInfo.className;
                const isSelected = className.endsWith('selected');

                if (!isSelected) {
                    this.groupSelected = groupInfo.id;
                    groupInfo.className = groupInfo.className + ' selected';
                }

                const _groups = new DataSet(this.groups);

                timeline.setGroups(
                    _groups as any
                );

                this.zoomChange(null, null);
            }

        });

        timeline.on('rangechanged', (properties) => {
            this.zoomChange(properties.start, properties.end);
        });

    }

    getHUDS(paciente) {
        return this.prestacionService.getByPaciente(paciente.id, true);
    }

    textoFiltro = '';
    textoFiltroVisivility = false;

    zoomChange(start: Date, end: Date) {
        if (start) {
            this.desde = start;
        }

        if (end) {
            this.hasta = end;
        }

        const dataSetVisible = this.dataSet.filter(
            datos => {
                const isTerm = !this.textoFiltro || this.textoFiltro.length === 0 || datos.term.includes(this.textoFiltro);
                const fecha = datos.fecha;
                const enIntervalo = moment(this.desde).isSameOrBefore(fecha) && moment(this.hasta).isSameOrAfter(fecha);
                return isTerm && datos.group === this.groupSelected && enIntervalo;
            }
        );

        this.dataSetVisible$.next(dataSetVisible);
    }



    prestacionIdSelected: string;
    datoIdSelected: string;

    onItemSelect(data) {
        if (data.id === this.datoIdSelected) {
            this.datoIdSelected = null;
            this.prestacionIdSelected = null;
        } else {
            this.datoIdSelected = data.id;
            this.prestacionIdSelected = data.idPrestacion;
        }
    }

    onClose() {
        this.datoIdSelected = null;
        this.prestacionIdSelected = null;
    }


}

interface IDataSet {
    group: string;
    id: string;
    idPrestacion: string;
    organizacion: { id: string, nombre: string };
    profesional: { id: string, nombre: string };
    fecha: Date;
    term: string;

}

const filtrarPorRegistros = (prestaciones: IPrestacion[], callback) => {
    return prestaciones
        .map(item => {
            return getRegistros(item).map(elem => ({
                prestacion: item,
                registro: elem
            }));
        })
        .reduce((a, b) => {
            return a.concat(b);
        }, [])
        .filter(callback);
};
