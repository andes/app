import { AfterViewInit, Component, ElementRef, EventEmitter, Input, LOCALE_ID, OnChanges, Output, ViewChild } from '@angular/core';

require('./bootstrap-datepicker/bootstrap-datepicker.js');
require('./bootstrap-datepicker/bootstrap-datepicker.es.min.js');
const jQuery = window['jQuery'] = require('jquery/dist/jquery');

@Component({
    selector: 'calendario-novedades',
    templateUrl: 'calendario-novedades.component.html',
    providers: [{
        provide: LOCALE_ID, useValue: 'es-AR'
    }]
})
export class CalendarioNovedadesComponent implements AfterViewInit, OnChanges {
    @Input() filtroFecha: Date;
    @Output() setFiltroFecha = new EventEmitter<Date>();

    private $input: any;
    private $div: any;
    private options: any = {};
    private fechaActual = null;

    @ViewChild('input') input: ElementRef;
    @ViewChild('div') div: ElementRef;

    ngAfterViewInit(): void {
        this.initCalendar();
        this.crearCalendario();
    }

    ngOnChanges(changes: any): void {
        if (!changes.filtroFecha.currentValue) {
            this.borrarSeleccion();
        }
    }

    private initCalendar() {
        this.$input = jQuery(this.input.nativeElement);
        this.$div = jQuery(this.div.nativeElement);

        this.$div.on('changeDate', (event: any) => {
            this.onChangeFecha(event);
        });
    }

    private onChangeFecha(event: { date: Date }) {
        this.fechaActual?.toString() === event.date.toString() ?
            this.borrarSeleccion()
            :
            this.fechaActual = event.date;

        this.setFiltroFecha.emit(this.fechaActual);
    }

    private borrarSeleccion() {
        this.fechaActual = null;
        if (this.$div) { this.$div.datepicker('update'); }
    }

    private crearCalendario() {
        this.options = {
            updateViewDate: false,
            weekStart: 1,
            defaultViewDate: new Date(),
            language: 'es',
            todayHighlight: true
        };

        this.$div.datepicker(this.options);
    }
}
