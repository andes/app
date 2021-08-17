import { Plex } from '@andes/plex';
import { IPlexTableColumns } from '@andes/plex/src/lib/table/table.interfaces';
import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { HeaderPacienteComponent } from 'src/app/components/paciente/headerPaciente.component';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { DataSet } from 'vis-data';
import { Timeline } from 'vis-timeline/peer';
import { getRegistros } from '../../operators/populate-relaciones';
import { getSemanticTag } from '../../pipes/semantic-class.pipes';
import { HUDSStore } from '../../services/huds.store';


@Component({
    selector: 'huds-timeline',
    templateUrl: './huds-timeline.component.html',
    styleUrls: ['../../components/core/_rup.scss', './huds-timeline.scss'],

    encapsulation: ViewEncapsulation.None
})
export class HUDSTimelineComponent implements OnInit {

    @ViewChild('prueba') timelineDiv;

    private pacienteID: string;

    public showListado = false;

    public itemSelected: IPrestacion;
    public datoIdSelected: string;

    public prestaciones: any[];
    public timeline;
    private groups = [];

    public desde: Date;
    public hasta: Date;

    public fechaActual = moment().toDate();
    private groupSelected = 'prestaciones';
    private dataSet: IDataSet[] = [];

    public dataSetVisible$ = new BehaviorSubject<IDataSet[]>([]);
    public capa = '';

    public textoFiltro = '';
    public textoFiltroVisivility = false;

    paciente: IPaciente;

    constructor(
        private activatedRoute: ActivatedRoute,
        private prestacionService: PrestacionesService,
        public elementosRUPService: ElementosRUPService,
        private pacienteService: PacienteService,
        private plex: Plex,
        private location: Location,
        private hudsStore: HUDSStore
    ) { }

    colores = {
        'hallazgo': '#f4a03b',
        'trastorno': '#ff4a1a',
        'procedimiento': '#92278e',
        'producto': '#00bcb4',
        'elemento de registro': '#8bc43f'
    };

    public columns: IPlexTableColumns[] = [

        {
            key: 'term',
            label: 'Registro',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.term.localeCompare(b.term),
            filterBy: (a: any) => a.term
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.profesional.localeCompare(b.profesional),
            filterBy: (a: any) => a.profesional
        },
        {
            key: 'organizacion',
            label: 'Organizacion',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.organizacion.localeCompare(b.organizacion),
            filterBy: (a: any) => a.organizacion
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


    ngOnInit() {
        this.pacienteID = this.activatedRoute.snapshot.paramMap.get('id');
        this.pacienteService.getById(this.pacienteID).subscribe(paciente => {
            this.paciente = paciente;
            this.plex.setNavbarItem(HeaderPacienteComponent, { paciente });
        });


        this.procesarHUDS().subscribe((huds) => {
        });


    }



    procesarHUDS() {
        return this.hudsStore.getHUDSPaciente(this.pacienteID).pipe(
            switchMap(prestaciones => this.prestacionService.getByPacienteHallazgo(this.pacienteID).pipe(map(() => prestaciones))),
            switchMap((prestaciones) => {
                return combineLatest([
                    of(prestaciones),
                    this.prestacionService.getByPacienteHallazgo(this.pacienteID),
                    this.prestacionService.getByPacienteTrastorno(this.pacienteID),
                    this.prestacionService.getByPacienteProcedimiento(this.pacienteID),
                    this.prestacionService.getByPacienteMedicamento(this.pacienteID),
                    this.prestacionService.getByPacienteElementoRegistros(this.pacienteID),
                ]);
            }),

            map(([prestaciones, hallazgos, trastornos, procedimientos, productos, elementos]) => {

                this.prestaciones = prestaciones;

                this.prestaciones.forEach(p => {
                    this.dataSet.push({
                        group: 'prestaciones',
                        id: p.id,
                        idPrestacion: p.id,
                        organizacion: p.organizacion.nombre,
                        profesional: p.profesional,
                        fecha: p.fecha,
                        term: p.prestacion.term,
                        color: p.ambito === 'ambulatorio' ? '#0070cc' : '#ffa900',
                        tipo: p.tipo,
                        data: p.data,
                        icon: 'mano-corazon'
                    });
                });


                unwind(procedimientos, 'evoluciones').forEach(p => {
                    this.dataSet.push({
                        group: 'procedimientos',
                        id: `${p.evoluciones.idPrestacion}-${p.evoluciones.idRegistro}`,
                        idPrestacion: p.evoluciones.idPrestacion,
                        fecha: p.evoluciones.fechaCarga,
                        term: p.concepto.term,
                        organizacion: p.evoluciones.organizacion,
                        profesional: p.evoluciones.profesional,
                        tipo: 'concepto',
                        data: p.original,
                        icon: 'termometro'
                    });
                });

                unwind(trastornos, 'evoluciones').forEach(p => {
                    this.dataSet.push({
                        group: 'trastornos',
                        id: `${p.evoluciones.idPrestacion}-${p.evoluciones.idRegistro}`,
                        idPrestacion: p.evoluciones.idPrestacion,
                        fecha: p.evoluciones.fechaCarga,
                        term: p.concepto.term,
                        organizacion: p.evoluciones.organizacion,
                        profesional: p.evoluciones.profesional,
                        tipo: 'concepto',
                        data: p.original,
                        icon: 'trastorno'
                    });
                });

                unwind(hallazgos, 'evoluciones').forEach(p => {
                    this.dataSet.push({
                        group: 'hallazgos',
                        id: `${p.evoluciones.idPrestacion}-${p.evoluciones.idRegistro}`,
                        idPrestacion: p.evoluciones.idPrestacion,
                        fecha: p.evoluciones.fechaCarga,
                        term: p.concepto.term,
                        organizacion: p.evoluciones.organizacion,
                        profesional: p.evoluciones.profesional,
                        tipo: 'concepto',
                        data: p.original,
                        icon: 'lupa-ojo'
                    });
                });

                unwind(productos, 'evoluciones').forEach(p => {
                    this.dataSet.push({
                        group: 'productos',
                        id: `${p.evoluciones.idPrestacion}-${p.evoluciones.idRegistro}`,
                        idPrestacion: p.evoluciones.idPrestacion,
                        fecha: p.evoluciones.fechaCarga,
                        term: p.concepto.term,
                        organizacion: p.evoluciones.organizacion,
                        profesional: p.evoluciones.profesional,
                        tipo: 'concepto',
                        data: p.original,
                        icon: 'pildoras'
                    });
                });



                this.craearTimelinea(this.dataSet, trastornos);


                return this.dataSet;

            })
        );
    }


    craearTimelinea(huds, trastornos) {
        const valores = [];
        huds.forEach((i) => {
            valores.push({
                group: i.group,
                id: i.id,
                content: ' ',
                start: i.fecha,
                term: i.term,
                idPrestacion: i.idPrestacion,
                color: i.color,
                data: i
            });
        });

        trastornos.forEach(p => {
            const ultimo = p.evoluciones[0];
            valores.push({
                group: `${p.concepto.conceptId}_${p.idPrestacion}`,
                id: `${p.concepto.conceptId}_${p.idRegistro}`,
                content: p.concepto.term,
                start: p.evoluciones[p.evoluciones.length - 1].fechaCarga,
                end: ultimo.estado === 'resuelto' ? ultimo.fechaCarga : new Date(),
                term: p.concepto.term,
                // idPrestacion: i.idPrestacion,
                color: ultimo.estado === 'resuelto' ? '#00a8e0' : '#ff4a1a',
                type: 'range',
                data: p
            });

            p.evoluciones.forEach(ev => {

                ev.relacionadoCon.forEach(rel => {
                    if (!rel.id) {
                        return;
                    }
                    const semantic = getSemanticTag(rel.concepto);
                    valores.push({
                        className: 'relacion',
                        group: `${p.concepto.conceptId}_${p.idPrestacion}`,
                        id: `${p.concepto.conceptId}_${p.idRegistro}_${rel._id}`,
                        // content: p.concepto.term,
                        start: rel.fechaCarga,
                        term: rel.concepto.term,
                        // idPrestacion: i.idPrestacion,
                        color: this.colores[semantic],
                    });
                });
            });

        });

        this.groups = [
            {
                'content': 'Prestaciones',
                'id': 'prestaciones',
                className: 'prestaciones selected',
                color: '#0070cc',
                selectable: true,
                treeLevel: 1
            },
            // {
            //     'content': 'Solicitudes',
            //     'id': 'solicitudes',
            //     className: 'solicitudes',
            //     color: '#0070cc',
            //     selectable: true
            // },
            {
                'content': 'Procedimientos',
                'id': 'procedimientos',
                className: 'procedimientos',
                color: '#92278e',
                selectable: true,
                treeLevel: 1
            },
            {
                'content': 'Trastornos',
                'id': 'trastornos',
                className: 'trastornos',
                color: '#ff4a1a',
                selectable: true,
                nestedGroups: trastornos.map(p => `${p.concepto.conceptId}_${p.idPrestacion}`),
                treeLevel: 1
            },
            {
                'content': 'Hallazgos',
                'id': 'hallazgos',
                className: 'hallazgos',
                color: '#f4a03b',
                selectable: true,
                treeLevel: 1
            },
            {
                'content': 'Productos',
                'id': 'productos',
                className: 'productos',
                color: '#00bcb4',
                selectable: true,
                treeLevel: 1
            },
        ];

        trastornos.forEach(p => {
            this.groups.push({
                'content': p.concepto.term,
                'id': `${p.concepto.conceptId}_${p.idPrestacion}`,
                className: 'trastornos',
                color: '#ff4a1a',
                selectable: false,
                treeLevel: 2
            });
        });


        const groups = new DataSet(this.groups);

        const items = new DataSet(valores);

        // Configuration for the Timeline
        const options = {
            width: '100%',
            // height: '400px',
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
                if (item.type === 'range') {
                    const parent = element.parentElement.parentElement;
                    parent.style.setProperty(`--color`, data.color || group.color);
                } else {
                    const parent = element.parentElement;
                    parent.style.setProperty(`--color`, data.color || group.color);
                }
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
        this.timeline = new Timeline(this.timelineDiv.nativeElement, null, options as any);
        this.timeline.setGroups(groups);
        this.timeline.setItems(items);

        // this.timeline.on('select', function (properties) {
        //     const ii = (this.timeline as any).itemsData.get(properties.items[0]);
        // });

        this.timeline.on('changed', () => {
            const element: HTMLElement = this.timelineDiv.nativeElement;

            this.groups.forEach((g) => {
                const es: HTMLElement[] = <any>element.querySelectorAll(`.vis-group.${g.id}`);
                es.forEach((e: any) => e.style.setProperty(`--bg-color`, g.color + '2e'));

                const es2: HTMLElement[] = <any>element.querySelectorAll(`.vis-label.${g.id}`);
                es2.forEach((e: any) => e.style.setProperty(`--bg-color`, g.color + '2e'));
            });
        });

        this.timeline.on('click', (properties) => {
            const { group, what, item } = properties;
            if (what === 'group-label') {
                this.selectTrack(this.timeline, group);
            }
            if (what === 'item') {
                this.selectTrack(this.timeline, group);
                const ii = (this.timeline as any).itemsData.get(item);
                this.onItemSelect(ii.data);
            }
        });

        this.timeline.on('rangechanged', (properties) => {
            this.zoomChange(properties.start, properties.end);
        });
    }

    setView(inicio, fin) {
        this.timeline.setWindow(inicio, fin);
    }

    selectTrack(timeline, track) {
        const groupInfo = this.groups.find(p => p.id === track);

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

    getHUDS(paciente) {
        return this.prestacionService.getByPaciente(paciente.id, true).pipe(
            map(prestaciones => {
                return prestaciones.filter(prestacion => prestacion.estadoActual.tipo === 'validada')
                    .sort((a, b) => {
                        return a.ejecucion.fecha.getTime() - b.ejecucion.fecha.getTime();
                    });
            })
        );
    }

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


    onItemSelect(data) {
        if (data.id === this.datoIdSelected) {
            this.datoIdSelected = null;
            this.itemSelected = null;
        } else {
            this.datoIdSelected = data.id;
            this.itemSelected = data;
        }
    }

    onClose() {
        this.datoIdSelected = null;
        this.itemSelected = null;
    }

    volver() {
        this.location.back();
    }

    onToogleListado() {
        this.showListado = !this.showListado;
        if (this.showListado) {
            this.timeline.setOptions({
                height: '250px'
            });
        } else {
            this.timeline.setOptions({
                height: null
            });
        }
    }
}

interface IDataSet {
    group: string;
    id: string;
    idPrestacion: string;
    organizacion?: string;
    profesional?: string;
    fecha: Date;
    term: string;
    cama?: string;
    unidadOrganizativa?: string;
    color?: string;
    tipo?: string;
    data?: any;
    icon?: string
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

function unwind(listado: any[], key: string) {
    return listado.reduce((acc, current) => {
        const target = current[key];
        if (Array.isArray(target)) {
            const ar = target.map(elem => {
                return {
                    ...current,
                    [key]: elem,
                    original: current
                };
            });
            acc = [...acc, ...ar];
        }
        return acc;
    }, []);
}
