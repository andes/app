import * as moment from 'moment';
import { Component, AfterViewInit, HostBinding, OnInit } from '@angular/core';
import { EstRupService } from '../../services/rup-estadisticas.service';
import { SnomedService } from '../../services/snomed.service';
import { Plex } from '@andes/plex';
import { ISnomedConcept } from '../../../rup/interfaces/snomed-concept.interface';
import { ConceptosTurneablesService } from '../../../../services/conceptos-turneables.service';


function hasAncestor(conceptos, _padre, item) {
    const statedAncestors = conceptos[item.concepto.conceptId].statedAncestors;
    return !!statedAncestors.find(i => i === _padre.conceptId);
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
export class RupPacientesComponent implements AfterViewInit, OnInit {
    @HostBinding('class.plex-layout') layout = true;

    showData = false;

    // Filtros
    public desde: Date = moment(new Date()).startOf('month').toDate();
    public hasta: Date = new Date();
    public hoy = new Date();

    public detallar = true;
    public prestacion: any;
    public prestaciones = [];
    public prestacionesHijas = [];
    public filtros = {

    };

    public registros: IRegistros[] = [];
    public tablas: any = [];
    public conceptos: { [key: string]: ISnomedConcept } = {};

    constructor(
        public estService: EstRupService,
        public snomed: SnomedService,
        private plex: Plex,
        private conceptosTurneablesService: ConceptosTurneablesService

    ) { }

    ngOnInit() {
        this.plex.updateTitle([
            { route: '/', name: 'ANDES' },
            { name: 'Dashboard', route: '/dashboard' },
            { name: 'RUP' }
        ]);
    }

    ngAfterViewInit() {
        this.conceptosTurneablesService.getAll().subscribe(result => {
            this.prestaciones = result;
        });
    }

    onPrestacionChange() {
        if (this.prestacion) {
            this.snomed.getQuery({ expression: '<<' + this.prestacion.conceptId }).subscribe((result) => {
                result.forEach((item) => { item.check = true; });
                this.prestacionesHijas = result;
            });
        }
    }

    volver() {
        this.showData = false;
        this.selectedConcept = this.selectIndex = this.selectedChilds = this.selectedFather = null;
        this.tableDemografia = this.tableLocalidades = null;
    }

    onChange() {
        if (this.prestacion) {
            this.tablas = [];
            this.registros = [];

            let prestaciones = this.prestacionesHijas.filter(item => item.check).map(item => item.conceptId);
            this.estService.get({ desde: this.desde, hasta: this.hasta, prestaciones }).subscribe((resultados) => {
                this.showData = true;
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

    /*
        decada: 7
        sexo: "femenino"
    */

    createTable(prestaciones, data) {
        prestaciones.forEach((prestacion) => {
            let items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {
                let info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

                items.forEach((item) => {
                    let d = item._id.decada > 9 ? 9 : item._id.decada;
                    let s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });


                let table = {
                    prestacion: prestacion,
                    data: info
                };

                this.tablas.push(table);

            }
        });
    }

    crearTotales(prestaciones, data) {
        let info = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
        prestaciones.forEach((prestacion) => {
            let items = data.filter(item => item.prestacion.conceptId === prestacion.conceptId);
            if (items.length > 0) {

                items.forEach((item) => {
                    let d = item._id.decada > 9 ? 9 : item._id.decada;
                    let s = item._id.sexo === 'masculino' ? 0 : 1;

                    info[s][d] += item.count;
                    info[s][10] += item.count; // total file
                    info[2][d] += item.count; // total columna
                    info[2][10] += item.count; // total prestacion
                });
            }
        });
        let table = {
            prestacion: { term: this.detallar ? 'Totalizado' : this.prestacion.term },
            data: info
        };

        this.tablas.push(table);
    }

    prepararRegistros() {
        // Filtramos el informa del encuentro
        this.registros.forEach(row => {
            const names = [];
            row.relaciones.filter(e => e.concepto.conceptId !== '371531000').forEach((item) => {
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
            this.selectedConcept = this.selectIndex = this.selectedChilds = this.selectedFather = null;
            this.tableDemografia = this.tableLocalidades = null;
        }
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

            let names = [];
            elemento.relaciones.filter(e => e.concepto.conceptId !== '371531000').forEach((item) => {
                this.registros.forEach((reg) => {
                    const i = reg.ids.indexOf(item.id);
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
}
