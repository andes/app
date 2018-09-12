import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { ResumenPacienteDinamicoService } from '../../services/resumenPaciente-dinamico.service';
import { VacunasService } from '../../../../services/vacunas.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';

@Component({
    selector: 'rup-resumenPaciente-dinamico-nino',
    templateUrl: 'resumenPaciente-dinamico-nino.html'
})

export class ResumenPacienteDinamicoNinoComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Input() paciente: IPaciente;
    private tablaModelo = [];   // modelo de tabla a imprimir, con titulos e idConcepts ordenados como se deberia mostrar. No modificar.
    public tabla = [];  // tabla que finalmente va a mostrar la informacion. Se utiliza el formato de la tabla modelo para confeccionarla.
    public prestaciones = [];
    private expresion = '<<410620009'; // filtro de conceptos snomed (niño sano)
    public vacunas = [];
    public registro = null;

    constructor(private servicioResumenPaciente: ResumenPacienteDinamicoService,
        private servicioVacunas: VacunasService,
        private prestacionesService: PrestacionesService,
        private elementosRUPService: ElementosRUPService,
        private plex: Plex) { }

    ngOnInit() {
        // Los conceptos se encuentran ordenados como deben aparecer en la tabla
        // this.tablaModelo = [
        //     { 'titulo': 'Fecha' },
        //     { 'titulo': 'Edad' },
        //     { 'titulo': 'Peso en Kgs.', 'concepto': { 'conceptId': '27113001' } },    // peso
        //     { 'titulo': 'PC. Peso', 'concepto': { 'conceptId': '170005003' } }, // percentilo peso del niño
        //     { 'titulo': 'Talla en cm.', 'concepto': { 'conceptId': '14456009' } },    // talla
        //     { 'titulo': 'PC. Talla', 'concepto': { 'conceptId': '248338008' } },   // percentilo de talla
        //     { 'titulo': 'IMC', 'concepto': { 'conceptId': '60621009' } },   // imc
        //     { 'titulo': 'PC. IMC', 'concepto': { 'conceptId': '446974000' } },   // percentilo imc
        //     { 'titulo': 'Perim. Cef.', 'concepto': { 'conceptId': '363812007' } },   // perimetro cefalico
        //     { 'titulo': 'PC. Perim. Cef.', 'concepto': { 'conceptId': '248397001' } },   // percentilo perim cefalico
        //     { 'titulo': 'Tensión arterial', 'concepto': { 'conceptId': '46973005' } },   // presion arterial
        //     { 'titulo': 'Lactancia materna', 'concepto': { 'conceptId': '3658006' } },   // lactancia
        //     { 'titulo': 'Desarrollo psicomotor', 'concepto': { 'conceptId': '65401001' } }   // desarrollo psicomotor
        ];

        this.loadPrestaciones();
        this.loadVacunas();
        this.loadResumen();
    }
    // carga el resumen de historia clinica
    loadResumen() {
        this.prestacionesService.getRegistrosHuds(this.paciente.id, '6035001').subscribe(prestaciones => {
            if (prestaciones && prestaciones.length) {
                prestaciones.sort(function (a, b) {
                    let dateA = new Date(a.fecha).getTime();
                    let dateB = new Date(b.fecha).getTime();
                    return dateA > dateB ? 1 : -1;
                });
                this.registro = prestaciones[prestaciones.length - 1].registro;
            }
        });
    }

    loadVacunas() {
        this.servicioVacunas.get(this.paciente.id).subscribe(resultado => {
            this.vacunas = resultado;
        });
    }

    loadPrestaciones() {
        let conceptos = [];
        // se carga un array solo con los conceptos {conceptId: xxxxxxx}

        this.tablaModelo.forEach(elto => {
            if (elto.concepto) {
                conceptos.push(elto.concepto);
            }
        });

        this.servicioResumenPaciente.get(this.paciente.id).subscribe(resultado => {
            // se ordena el array de mayor a menor segun fecha (Mas actuales primero)
            resultado.sort(function (a, b) {
                let dateA = new Date(a.fecha).getTime();
                let dateB = new Date(b.fecha).getTime();
                return dateA < dateB ? 1 : -1;
            });

            // Para evitar mostrar consultas repetidas se llena un array auxiliar solo con la prestacion mas actual de las repetidas,
            // es decir, la primera aparicion de cada prestacion (Ya que primero son ordenadas por fecha en forma decreciente).
            let prestacionesAux = [];
            resultado.forEach(unaPrestacion => {
                if (!prestacionesAux.find(p => p.motivo.conceptId === unaPrestacion.motivo.conceptId)) {
                    prestacionesAux.push(unaPrestacion);
                }
            });

            this.prestaciones = prestacionesAux;
            this.crearTabla();
        });
    }

    crearTabla() {
        // por cada prestacion cargamos los datos que se van a mostrar en la tabla
        this.prestaciones.forEach(prestacion => {
            let filaTabla = [];
            // se carga la fecha
            filaTabla.push(moment(prestacion.fecha).format('DD/MM/YYYY'));
            // se carga la edad
            filaTabla.push(prestacion.motivo.term);
            // recorremos las columnas de la tabla modelo para armar la nueva tabla con la informacion en el mismo orden
            this.tablaModelo.forEach(col => {
                if (col.concepto) {
                    // obtenemos id de concepto de la tabla modelo para buscarlo en el arreglo de prestaciones
                    let eltoConcepto = prestacion.conceptos.find(c => c.concepto.conceptId === col.concepto.conceptId);
                    if (eltoConcepto) {
                        if (Array.isArray(eltoConcepto.valor)) {
                            filaTabla.push(eltoConcepto.valor[eltoConcepto.valor.length - 1].concepto.term);
                        } else {
                            filaTabla.push(eltoConcepto.valor);
                        }
                    } else {
                        filaTabla.push('S/D');
                    }
                }
            });
            this.tabla.push(filaTabla);
        });
    }
}