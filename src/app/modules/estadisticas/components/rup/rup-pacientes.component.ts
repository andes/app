import * as moment from 'moment';
import { Component, HostBinding, OnInit } from '@angular/core';
import { EstRupService } from '../../services/rup-estadisticas.service';
import { SnomedService } from '../../services/snomed.service';
import { Plex } from '@andes/plex';
import { ISnomedConcept } from '../../../rup/interfaces/snomed-concept.interface';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';


function hasAncestor(conceptos, _padre, item) {
    const statedAncestors = conceptos[item.concepto.conceptId].relationships;
    return !!statedAncestors.find(i => i.conceptId === _padre.conceptId);
}

interface IRegistros {
    concepto: ISnomedConcept;
    prestaciones: any[];
    ids: string[];
    relaciones: any[];
    relacionesName: string[];
    count: number;

}
@Component({
    templateUrl: 'rup-pacientes.html',
    styleUrls: ['rup-pacientes.scss']
})
export class RupPacientesComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();

    public detallar = true;
    public loading = false;
    public prestacion: any;
    public prestaciones = [];
    public prestacionesHijas = [];
    public filtros = {};

    public registros: IRegistros[] = [];
    public tablas: any = [];
    public conceptos: { [key: string]: ISnomedConcept } = {};

    public mensajeInicial = true;

    // Permite :hover y click()
    public selectable = true;
    public openSidebar = false;
    public conceptosColumns = [
        {
            key: 'conceptoTerm',
            label: 'Concepto',
            sorteable: false,
            opcional: true
        },
        {
            key: 'conceptoSemanticTag',
            label: 'Semantic Tag',
            sorteable: false,
            opcional: true
        },
        {
            key: 'cantidad',
            label: 'Cantidad',
            sorteable: false,
            opcional: true
        },
        {
            key: 'cantidadRelacionados',
            label: 'Cant. Rel.',
            sorteable: false,
            opcional: true
        },
        {
            key: 'relaciones',
            label: 'Relaciones',
            sorteable: false,
            opcional: true
        },
    ];

    public columns = [
        {
            key: 'sexoedad',
            label: 'Sexo/Edad',
            sorteable: false,
            opcional: false
        },
        {
            key: '0',
            label: '0',
            sorteable: false,
            opcional: false
        },
        {
            key: '10',
            label: '10',
            sorteable: false,
            opcional: false
        },
        {
            key: '20',
            label: '20',
            sorteable: false,
            opcional: false
        },
        {
            key: '30',
            label: '30',
            sorteable: false,
            opcional: false
        },
        {
            key: '40',
            label: '40',
            sorteable: false,
            opcional: false
        },
        {
            key: '50',
            label: '50',
            sorteable: false,
            opcional: false
        },
        {
            key: '60',
            label: '60',
            sorteable: false,
            opcional: false
        },
        {
            key: '70',
            label: '70',
            sorteable: false,
            opcional: false
        },
        {
            key: '80',
            label: '80',
            sorteable: false,
            opcional: false
        },
        {
            key: '90',
            label: '90',
            sorteable: false,
            opcional: false
        },
        {
            key: 'total',
            label: 'Total',
            sorteable: false,
            opcional: false
        },
    ];

    public estadisticasColumns = [
        {
            key: 'sexodecada',
            label: 'Sexo/Decada',
            sorteable: false,
            opcional: false
        },
        {
            key: '0',
            label: '0',
            sorteable: false,
            opcional: false
        },
        {
            key: '10',
            label: '10',
            sorteable: false,
            opcional: false
        },
        {
            key: '20',
            label: '20',
            sorteable: false,
            opcional: false
        },
        {
            key: '30',
            label: '30',
            sorteable: false,
            opcional: false
        },
        {
            key: '40',
            label: '40',
            sorteable: false,
            opcional: false
        },
        {
            key: '50',
            label: '50',
            sorteable: false,
            opcional: false
        },
        {
            key: '60',
            label: '60',
            sorteable: false,
            opcional: false
        },
        {
            key: '70',
            label: '70',
            sorteable: false,
            opcional: false
        },
        {
            key: '80',
            label: '80',
            sorteable: false,
            opcional: false
        },
        {
            key: '90',
            label: '90',
            sorteable: false,
            opcional: false
        },
    ];

    public localidadesColumns = [
        {
            key: 'localidad',
            label: 'Localidad',
            sorteable: false,
            opcional: false
        },
        {
            key: 'cantidad',
            label: 'Cantidad',
            sorteable: false,
            opcional: true
        },
    ];
    public column = [
        {
            key: 'concepto',
            label: 'Concepto',
        },
        {
            key: 'hijos',
            label: 'Hijos registrados',
        },
    ];

    constructor(
        public estService: EstRupService,
        public snomed: SnomedService,
        private plex: Plex,
        private conceptosTurneablesService: ConceptosTurneablesService

    ) { }

    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'RUP' }
        ]);
        this.conceptosTurneablesService.getAll().subscribe(result => {
            this.prestaciones = result;
        });
    }

    onPrestacionChange() {
        if (this.prestacion) {
            this.snomed.getQuery({ expression: '<<' + this.prestacion.conceptId }).subscribe((result) => {
                if (result.length <= 10) {
                    result.forEach((item) => {
                        item.check = true;
                    });
                    this.prestacionesHijas = result;
                } else {
                    this.prestacionesHijas = [];
                    this.prestacion.check = true;
                    this.prestacionesHijas[0] = this.prestacion;
                }
                this.updateSeleccionDetalle(true);
            });
        } else {
            this.prestacionesHijas = [];
            this.updateSeleccionDetalle(false);
        }
    }

    onChange() {
        this.selectedConcept = this.selectIndex = this.selectedChilds = this.selectedFather = null;
        this.tableDemografia = this.tableLocalidades = null;

        if (this.prestacion) {
            this.tablas = [];
            this.registros = [];
            this.loading = true;

            const prestaciones = this.prestacionesHijas.filter(item => item.check).map(item => item.conceptId);
            this.estService.get({ desde: this.desde, hasta: this.hasta, prestaciones }).subscribe((resultados) => {
                this.mensajeInicial = false;
                this.loading = false;
                if (this.detallar) {
                    this.createTable(this.prestacionesHijas.filter(item => item.check), resultados.pacientes);
                }
                this.crearTotales(this.prestacionesHijas, resultados.pacientes);
                this.registros = resultados.registros;
                this.prepararRegistros();
                resultados.metadata.forEach((concepto) => {
                    this.conceptos[concepto.conceptId] = concepto;
                });
            });
        }
    }

    updateSeleccionDetalle(value) {
        this.detallar = value;
        this.prestacionesHijas?.map(hijo => hijo.check = value);
    }

    /*
        decada: 7
        sexo: "femenino"
    */

    createTable(prestaciones, data) {
        prestaciones.forEach((prestacion) => {
            const items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {
                const info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

                items.forEach((item) => {
                    const d = item._id.decada > 9 ? 9 : item._id.decada;
                    const s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });


                const table = {
                    prestacion: prestacion,
                    data: info
                };

                this.tablas.push(table);

            }
        });
    }

    crearTotales(prestaciones, data) {
        const info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
        prestaciones.forEach((prestacion) => {
            const items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {

                items.forEach((item) => {
                    const d = item._id.decada > 9 ? 9 : item._id.decada;
                    const s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });
            }
        });
        const table = {
            prestacion: { term: this.detallar ? 'Totalizado' : this.prestacion.term },
            data: info
        };
        this.tablas.push(table);
    }

    prepararRegistros() {
        // Filtramos el informa del encuentro
        this.registros.forEach(row => {
            const names = [];
            row.relaciones.filter(e => e.concepto?.conceptId !== '371531000').forEach((item) => {
                this.registros.forEach((reg) => {
                    const i = reg.ids.indexOf(item.id);
                    if (i >= 0) {
                        names.push(reg.concepto.term);
                    }
                });
            });
            row.relacionesName = names;
        });
    }

    /**
     * Estructuras adicionales para la funcionalidad de agrupacion
     */
    showFather = {};
    selectedConcept = null;
    selectIndex = null;
    selectedChilds = null;
    selectedFather = null;

    show(row, index) {
        if (!this.selectedConcept || this.selectedConcept.concepto.conceptId !== row.concepto.conceptId) {
            this.selectedConcept = row;
            this.selectIndex = index;
            this.showFather[row.concepto.conceptId] = !(!!this.showFather[row.concepto.conceptId]);
            this.selectedChilds = this.selectedFather = null;
            this.demografia();
        } else {
            this.selectIndex = this.selectedChilds = this.selectedFather = null;
            this.tableDemografia = this.tableLocalidades = null;
        }
        this.openSidebar = true;
    }

    groupBy(row, padre) {
        this.snomed.getConcepts([padre.conceptId]).subscribe((concepts) => {
            this.conceptos[concepts[0].conceptId] = concepts[0];

            const hijos = this.getChilds(padre);
            const elemento: any = {
                concepto: padre,
                count: hijos.reduce((a, b) => a + b.count, 0),
                ids: hijos.reduce((a, b) => [...a, ...b.ids], []),
                prestaciones: hijos.reduce((a, b) => [...a, ...b.prestaciones], []),
                relaciones: hijos.reduce((a, b) => [...a, ...b.relaciones], []),
                hijos,
                hijosName: hijos.reduce(((a, item) => a + item.concepto.term + ','), '')
            };
            const names = [];
            elemento.relaciones.filter(e => e.concepto?.conceptId !== '371531000').forEach((item) => {
                this.registros.forEach((reg) => {
                    let i;
                    if (typeof item === 'string') {
                        i = reg.ids.indexOf(item);
                    } else {
                        i = reg.ids.indexOf(item.id);
                    }
                    i = reg.ids.indexOf(item);
                    if (i >= 0) {
                        names.push(reg.concepto.term);
                    }
                });
            });
            elemento.relacionesName = names;

            this.registros[this.selectIndex] = elemento;

            this.registros = this.registros.filter(item => !hasAncestor(this.conceptos, padre, item));

            this.selectedConcept = this.selectIndex = this.selectedChilds = this.selectedFather = null;
            this.tableDemografia = this.tableLocalidades = null;
            this.plex.toast('success', 'Concepto agrupado exitosamente');

        });
    }

    showChild(padre) {
        if (!this.selectedFather || padre.conceptId !== this.selectedFather.conceptId) {
            this.selectedChilds = this.getChilds(padre);
            this.selectedFather = padre;
        } else {
            this.selectedChilds = null;
            this.selectedFather = null;
        }
    }

    /**
     * Dado un concepto devuelve todos los hijos de ese concepto
     * @param concept
     */
    getChilds(concept) {
        return this.registros.filter(item => hasAncestor(this.conceptos, concept, item));
    }


    public tableDemografia = null;
    public tableLocalidades = null;
    demografia() {
        this.estService.demografia(this.selectedConcept.prestaciones.map(i => i.prestacion_id)).subscribe(datos => {
            const { demografia, localidades } = datos;
            const tabla = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

            demografia.forEach(dato => {
                tabla[dato.sexo === 'femenino' ? 0 : 1][dato.decada] += dato.count;
            });
            this.tableDemografia = tabla;
            this.tableLocalidades = localidades;
        });
    }

    cerrar() {
        this.selectedConcept = null;
    }
}
