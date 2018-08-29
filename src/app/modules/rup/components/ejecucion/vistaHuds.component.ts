import { Component, OnInit, HostBinding, ViewEncapsulation, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ObjectID } from 'bson';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { LogService } from '../../../../services/log.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { DocumentosService } from './../../../../services/documentos.service';
import { Slug } from 'ng2-slugify';
import { saveAs } from 'file-saver';

@Component({
    selector: 'rup-vistaHuds',
    templateUrl: 'vistaHuds.html',
    encapsulation: ViewEncapsulation.None
})
export class VistaHudsComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;


    @Input() paciente: IPaciente;


    // Defaults de Tabs panel derecho
    public panelIndex = 0;

    // Array de registros de la HUDS a agregar en tabs
    public registrosHuds: any[] = [];

    // Tiene permisos para descargar?
    public puedeDescargarPDF = false;

    // Usa el keymap 'default'
    private slug = new Slug('default');

    constructor(public elementosRUPService: ElementosRUPService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        private servicioPaciente: PacienteService,
        private logService: LogService,
        private servicioPrestacion: PrestacionesService,
        private conceptObserverService: ConceptObserverService,
        private servicioDocumentos: DocumentosService) { }

    /**
    *Inicializamos con el id del paciente
    * Cargamos los problemas del paciente
    *
    */
    ngOnInit() {

        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();

        if (!this.paciente) {
            this.route.params.subscribe(params => {
                let id = params['id'];
                // Carga la información completa del paciente
                this.servicioPaciente.getById(
                    id).subscribe(paciente => {
                        this.paciente = paciente;
                    });
            });
        } else {
            // Loggeo de lo que ve el profesional
            this.logService.post('rup', 'hudsPantalla', {
                paciente: {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    apellido: this.paciente.apellido,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    documento: this.paciente.documento
                }
            }).subscribe(() => { return true; });
        }
    }

    agregarListadoHuds(elemento) {
        if (elemento.tipo === 'prestacion') {
            // Limpiar los valores observados al iniciar la ejecución
            // Evita que se autocompleten valores de una consulta anterior
            this.conceptObserverService.destroy();
            // Loggeo de lo que ve el médico
            this.logService.post('rup', 'hudsPrestacion', {
                paciente: {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    apellido: this.paciente.apellido,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    documento: this.paciente.documento
                },
                prestacion: elemento.data.id
            }).subscribe(() => { return true; });
        }
        // this.registrosHuds = registrosHuds;
    }
    volver() {
        this.router.navigate(['rup']);
    }
    // recibe el tab que se clikeo y lo saca del array..
    cerrartab($event) {
        this.registrosHuds.splice($event, 1);
    }



    descargarResumen(nombre, tabIndex) {
        this.registrosHuds.forEach(x => {
            x.icon = 'down';
        });
        setTimeout(() => {

            let content = '';
            let datosSolicitud: any = document.getElementById('prestacion-' + tabIndex).cloneNode(true);

            /**
             * Cada logo va a quedar generado como base64 desde la API:
             *
             * <img src="data:image/png;base64,..." style="float: left;">
             * <img src="data:image/png;base64,..." style="width: 80px; margin-right: 10px;">
             * <img src="data:image/png;base64,..." style="display: inline-block; width: 100px; float: right;">
             *
             */

            const header = `
                <div class="resumen-solicitud">
                    ${datosSolicitud.innerHTML}
                </div>
            `;

            content += header;
            content += `
            <div class="paciente">
                <b>Paciente:</b> ${this.paciente.apellido}, ${this.paciente.nombre} - 
                ${this.paciente.documento} - ${moment(this.paciente.fechaNacimiento).fromNow(true)}
            </div>
            `;

            this.servicioDocumentos.descargar(content).subscribe(data => {
                if (data) {
                    // Generar descarga como PDF
                    this.descargarArchivo(nombre, data, { type: 'application/pdf' });
                } else {
                    // Fallback a impresión normal desde el navegador
                    window.print();
                }
            });
        });
    }

    private descargarArchivo(nombre: string, data: any, headers: any): void {
        let blob = new Blob([data], headers);
        let nombreArchivo = this.slug.slugify(nombre + moment().format('DD-MM-YYYY-hmmss')) + '.pdf';
        saveAs(blob, nombreArchivo);
    }

}
