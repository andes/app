import { AfterViewInit, Component, ElementRef, Input, LOCALE_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
export class CalendarioNovedadesComponent implements AfterViewInit {
    @Input() fecha: string;

    private $input: any;
    private $div: any;
    private options: any = {};

    @ViewChild('input') input: ElementRef;
    @ViewChild('div') div: ElementRef;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
    ) {
    }

    ngAfterViewInit(): void {
        this.initCalendar();
        this.crearCalendario();
    }

    private initCalendar() {
        this.$input = jQuery(this.input.nativeElement);
        this.$div = jQuery(this.div.nativeElement);

        this.$div.on('changeDate', (event: any) => {
            this.onChangeFecha(event);
        });
    }

    private onChangeFecha(event: { date: Date }) {
        const fecha = moment(event.date).format('YYYY-MM-DD');

        this.abrirFecha(fecha);
    }

    private crearCalendario() {
        const fecha = this.fecha ? moment(this.fecha).toDate() : undefined;

        this.options = {
            updateViewDate: true,
            weekStart: 1,
            defaultViewDate: fecha,
            language: 'es',
            todayHighlight: false
        };

        this.$div.datepicker(this.options);
        this.$div.datepicker('update');

        if (fecha) { this.$div.datepicker('update', fecha); }
    }

    private abrirFecha(fecha: string) {
        this.router.navigate(['/novedades/fecha/', fecha], { relativeTo: this.route });
    }

    public volver() {
        this.router.navigate(['/novedades'], { relativeTo: this.route });
    }
}
