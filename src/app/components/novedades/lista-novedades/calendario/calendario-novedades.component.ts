import { AfterViewInit, Component, ElementRef, LOCALE_ID, ViewChild } from '@angular/core';
// import * as Enums from './../../utils/enumerados';
const jQuery = window['jQuery'] = require('jquery/dist/jquery');
const moment = window['moment'] = require('moment/moment.js');
require('./bootstrap-datepicker/bootstrap-datepicker.js');
require('./bootstrap-datepicker/bootstrap-datepicker.es.min.js');

const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sabado'];
const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
    selector: 'calendario-novedades',
    templateUrl: 'calendario-novedades.component.html',
    providers: [{
        provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class CalendarioNovedadesComponent implements AfterViewInit {
    private $input: any;
    private $div: any;
    private options: any = {};

    @ViewChild('input') input: ElementRef;
    @ViewChild('div') div: ElementRef;

    ngAfterViewInit(): void {
        this.initjQueryObjects();
        this.buildCalendarOptions();
    }

    /**
   * Setup Methods
   */
    private initjQueryObjects() {
        this.$input = jQuery(this.input.nativeElement);
        this.$div = jQuery(this.div.nativeElement);

        this.$div.on('changeDate', (event) => {
            this.onChangeFecha(event);

        });
        // this.$div.on('changeMonth', (event) => {
        //     this.changeMonth(event.date);
        // });
        // this.$div.on('show', (event) => {
        //     console.log('evento show');
        // });
    }

    private changeMonth(fecha) {
        // this._turnoService.getTurnosMes({ fecha: fecha })
        //     .subscribe((turnosMes) => {
        //         jQuery(this.div.nativeElement).datepicker('setDatesDisabled', this.diasDeshabilitados(turnosMes, fecha));
        //     });
        // this.fechaElegida = undefined;
    }
    /**
   * Config. Agenda Methods
   */
    private getConfiguracionAgenda() {


    }

    private onChangeFecha(event: any) {
        // eslint-disable-next-line no-console
        console.log('evento changeDate', event);
    }

    private buildCalendarOptions() {
        this.options = {
            updateViewDate: false,
            weekStart: 1,
            defaultViewDate: new Date(),
            language: 'es',
            todayHighlight: true
        };

        this.$div.datepicker(this.options);
    }



    private addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    private getDaysOfWeekDisabled() {
        const dias = [0, 1, 2, 3, 4, 5, 6];
        // if (this.agendaConfig) {

        //     this.agendaConfig.diasHabilitados.forEach((dia: any) => {

        //         const indexOfDia = dias.indexOf((dia.id + 1) % 7);
        //         dias.splice(indexOfDia, 1);
        //     });
        // }
        return dias.toString();
    }


}
