import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ObraSocialService } from './../../services/obraSocial.service';
import { ProfeService } from './../../services/profe.service';
import { PeriodoPadronesPucoService } from '../../services/periodoPadronesPuco.service';
import { PeriodoPadronesProfeService } from '../../services/periodoPadronesProfe.service';
import { Moment } from 'moment';

@Component({
    selector: 'puco',
    templateUrl: 'puco.html',
    styleUrls: ['puco.scss']
})

export class PucoComponent implements OnInit, OnDestroy {

    public loading = false;
    public errorSearchTerm = false; // true si se ingresan caracteres alfabeticos
    public periodos = [];   // select
    public periodoSelect;
    public listaPeriodosPuco = '';   // solo para sidebar
    public ultimaActualizacionPuco;
    public listaPeriodosProfe = '';   // solo para sidebar
    public ultimaActualizacionProfe;
    public cantidadPeriodos = 6;    // cantidad de versiones de padrones que se traen desde la DB
    public periodoMasAntiguo;    // la última version hacia atrás del padron a buscar
    public usuarios = [];
    private resPuco = [];
    private resProfe = [];
    private timeoutHandle: number;
    @Input() autofocus: Boolean = true;

    // termino a buscar ..
    public searchTerm: String = '';

    // ultima request que se almacena con el subscribe
    private lastRequest: ISubscription;

    constructor(
        private obraSocialService: ObraSocialService,
        private profeService: ProfeService,
        private periodoPadronesPucoService: PeriodoPadronesPucoService,
        private periodoPadronesProfeService: PeriodoPadronesProfeService,
        private plex: Plex) { }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
    }
    ngOnInit() {
        let periodoActual = new Date();

        // Se cargan las opciones de periodo del select
        for (let i = 0; i < this.cantidadPeriodos; i++) {
            let periodoAux = moment(periodoActual).subtract(i, 'month').format('YYYY/MM/DD');
            this.periodos[i] = { id: i, nombre: moment(periodoAux).format('MMMM [de] YYYY'), version: periodoAux };    // Ej: {1, "mayo 2018", "2018/05/05"}
        }
        this.setPeriodo(this.periodos[0]);  // por defecto se setea el periodo actual
        this.periodoMasAntiguo = this.periodos[this.cantidadPeriodos - 1];


        // Se cargan periodos de de actualizaciones de PUCO
        this.periodoPadronesPucoService.get({ desde: this.periodoMasAntiguo.version }).subscribe(rta => {
            if (rta.length) {
                for (let i = 0; i < rta.length; i++) {
                    // let formatoFecha = moment(new Date((String(rta[i].version)).substring(0, 4) + '/' + (String(rta[i].version)).substring(4, 6) + '/' + (String(rta[i].version)).substring(6, 8))).format('MMMM YYYY');

                    if (i === rta.length - 1) {
                        this.listaPeriodosPuco += moment(rta[i].version).format('MMMM [de] YYYY');
                    } else {
                        this.listaPeriodosPuco += moment(rta[i].version).format('MMMM [de] YYYY') + ', ';
                    }
                }
                this.ultimaActualizacionPuco = moment(rta[0].version).format('DD/MM/YYYY'); // moment(new Date((String(rta[0].version)).substring(0, 4) + '/' + (String(rta[0].version)).substring(4, 6) + '/' + (String(rta[0].version)).substring(6, 8))).format('DD/MM/YYYY');
            }
        });

        // Carga periodos de de actualizaciones de Incluir Salud
        this.periodoPadronesProfeService.get({ desde: this.periodoMasAntiguo.version }).subscribe(rta => {
            if (rta.length) {
                for (let i = 0; i < rta.length; i++) {
                    // let formatoFecha = moment(new Date((String(rta[i].version)).substring(0, 4) + '/' + (String(rta[i].version)).substring(4, 6) + '/' + (String(rta[i].version)).substring(6, 8))).format('MMMM YYYY');

                    if (i === rta.length - 1) {
                        this.listaPeriodosProfe += moment(rta[i].version).format('MMMM [de] YYYY');
                    } else {
                        this.listaPeriodosProfe += moment(rta[i].version).format('MMMM [de] YYYY') + ', ';
                    }
                }
                this.ultimaActualizacionProfe = moment(rta[0].version).format('DD/MM/YYYY'); // moment(new Date((String(rta[0].version)).substring(0, 4) + '/' + (String(rta[0].version)).substring(4, 6) + '/' + (String(rta[0].version)).substring(6, 8))).format('DD/MM/YYYY');
            }
        });
    }

    public setPeriodo(periodo) {
        if (periodo === null) {
            this.usuarios = []; // Si se borra el periodo del select, se borran los resultados
            this.searchTerm = '';
        } else {
            this.periodoSelect = periodo;

            if (this.searchTerm) {
                this.buscar();
            }
        }
    }

    buscar(): void {

        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }
        // Se limpian los resultados de la busqueda anterior
        this.usuarios = [];

        if (this.searchTerm && /^([0-9])*$/.test(this.searchTerm.toString())) {

            this.loading = true;
            this.errorSearchTerm = false;
            let search = this.searchTerm.trim();

            this.timeoutHandle = window.setTimeout(() => {
                this.timeoutHandle = null;

                Observable.forkJoin([
                    this.obraSocialService.get({ dni: search, periodo: this.periodoSelect.version }),
                    this.profeService.get({ dni: search, periodo: this.periodoSelect.version })]).subscribe(t => {
                        this.loading = false;
                        this.resPuco = t[0];
                        this.resProfe = t[1];

                        if (this.resPuco) {
                            this.usuarios = this.resPuco;
                        }
                        if (this.resProfe) {
                            if (this.resPuco) {
                                this.usuarios = this.resPuco.concat(this.resProfe);
                            } else {
                                this.usuarios = this.resProfe;
                            }
                        }
                    });
            }, 200);
        } else {
            if (this.searchTerm) {
                this.errorSearchTerm = true;
                // this.searchTerm = this.searchTerm.substr(0, this.searchTerm.length - 1);
            }
        }
    };
}
