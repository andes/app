import { PrestacionesService } from '../../services/prestaciones.service';
import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { ResumenPacienteDinamicoService } from '../../services/resumenPaciente-dinamico.service';

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

    constructor(private servicioResumenPaciente: ResumenPacienteDinamicoService,
        private plex: Plex) { }

    ngOnInit() {
        // Los conceptos se encuentran ordenados como deben aparecer en la tabla
        this.tablaModelo = [
            { 'titulo': 'Fecha' },
            { 'titulo': 'Edad' },
            { 'titulo': 'Peso en Kgs.', 'concepto': { 'conceptId': '27113001' } },    // peso
            { 'titulo': 'PC. Peso', 'concepto': { 'conceptId': '170005003' } }, // percentilo peso del niño
            { 'titulo': 'Talla en cm.', 'concepto': { 'conceptId': '14456009' } },    // talla
            { 'titulo': 'PC. Talla', 'concepto': { 'conceptId': '248338008' } },   // percentilo de talla
            { 'titulo': 'IMC', 'concepto': { 'conceptId': '60621009' } },   // imc
            { 'titulo': 'PC. IMC', 'concepto': { 'conceptId': '446974000' } },   // percentilo imc
            { 'titulo': 'Perim. Cef.', 'concepto': { 'conceptId': '363812007' } },   // perimetro cefalico
            { 'titulo': 'PC. Perim. Cef.', 'concepto': { 'conceptId': '248397001' } },   // percentilo perim cefalico
            { 'titulo': 'Tensión arterial', 'concepto': { 'conceptId': '46973005' } },   // presion arterial
            { 'titulo': 'Lactancia materna', 'concepto': { 'conceptId': '3658006' } },   // lactancia
            { 'titulo': 'Desarrollo psicomotor', 'concepto': { 'conceptId': '65401001' } }   // desarrollo psicomotor
        ];

        this.loadPrestaciones();
    }

    loadPrestaciones() {
        let conceptos = [];
        // armamos un array solo con los conceptos {conceptId: xxxxxxx}

        this.tablaModelo.forEach(elto => {
            if (elto.concepto) {
                conceptos.push(elto.concepto);
            }
        });
        this.servicioResumenPaciente.get(this.paciente.id, { 'expresion': this.expresion, 'conceptos': JSON.stringify(conceptos) }).subscribe(resultado => {
            this.prestaciones = resultado;
            this.crearTabla();
        });
    }

    crearTabla() {
        // por cada prestacion obtenida cargamos los datos que se van a mostrar en la tabla
        this.prestaciones.forEach(prestacion => {
            let filaTabla = [];
            // pusheamos la fecha
            filaTabla.push(moment(prestacion.fecha).format('DD/MM/YYYY'));
            // pusheamos la edad
            filaTabla.push(prestacion.motivo);
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