import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ISubscription } from 'rxjs/Subscription';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ObraSocialService } from './../../services/obraSocial.service';
import { ProfeService } from './../../services/profe.service';
import { PeriodoPadronesPucoService } from '../../services/periodoPadronesPuco.service';
import { PeriodoPadronesProfeService } from '../../services/periodoPadronesProfe.service';
import { SugerenciasService } from '../../services/sendmailsugerencias.service';

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
    public ultimaActualizacionPuco: Date;
    public listaPeriodosProfe = '';   // solo para sidebar
    public ultimaActualizacionProfe: Date;
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
        private sugerenciasService: SugerenciasService,
        private plex: Plex) { }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
    }
    ngOnInit() {

        Observable.forkJoin([
            this.periodoPadronesPucoService.get({}),
            this.periodoPadronesProfeService.get({})]).subscribe(padrones => {
                let arrAux = padrones[0].concat(padrones[1]);
                arrAux.sort((a, b) => a.version < b.version);
                //  let periodoMasActual = new Date(arrAux[0].version); // el padron mas actual entre puco y profe
                let periodoMasActual = new Date();  // fecha actual

                for (let i = 0; i < this.cantidadPeriodos; i++) {
                    let periodoAux = moment(periodoMasActual).subtract(i, 'month');
                    this.periodos[i] = { id: i, nombre: moment(periodoAux).format('MMMM [de] YYYY'), version: periodoAux };    // Ej: {1, "mayo 2018", "2018/05/05"}

                }
                this.periodoSelect = this.periodos[0];
                this.setPeriodo(this.periodos[0]);  // por defecto se setea el periodo mas actual
                this.periodoMasAntiguo = this.periodos[this.cantidadPeriodos - 1];


                // Se almacenan los padrones de puco
                if (padrones[0].length) {
                    for (let i = 0; i < padrones[0].length; i++) {

                        if (i === padrones[0].length - 1) {
                            this.listaPeriodosPuco += moment(padrones[0][i].version).format('MMMM [de] YYYY');
                        } else {
                            this.listaPeriodosPuco += moment(padrones[0][i].version).format('MMMM [de] YYYY') + ', ';
                        }
                    }
                    this.ultimaActualizacionPuco = padrones[0][0].version;
                }


                // Se almacenan los padrones de incluid salud
                if (padrones[1].length) {
                    for (let i = 0; i < padrones[1].length; i++) {

                        if (i === padrones[1].length - 1) {
                            this.listaPeriodosProfe += moment(padrones[1][i].version).format('MMMM [de] YYYY');
                        } else {
                            this.listaPeriodosProfe += moment(padrones[1][i].version).format('MMMM [de] YYYY') + ', ';
                        }
                    }
                    this.ultimaActualizacionProfe = padrones[1][0].version;
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

    /* Verifica que el periodo seleccionado para la búsqueda corresponda a un padrón ya actualizado.
    * De ser asi retorna dicho periodo, de lo contrario retorna el periodo más actual.
    */
    verificarPeriodo(periodo1, periodo2) {
        periodo1 = new Date(periodo1);
        periodo2 = new Date(periodo2);
        let p1 = moment(periodo1).startOf('month').format('YYYY-MM-DD');
        let p2 = moment(periodo2).startOf('month').format('YYYY-MM-DD');

        if (moment(p1).diff(p2) > 0) {
            return periodo2;
        } else {
            return periodo1;
        }
    }

    buscar(): void {

        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
            this.loading = false;
        }
        // Se limpian los resultados de la busqueda anterior
        this.usuarios = [];

        if (this.searchTerm && /^([0-9])*$/.test(this.searchTerm.toString())) {

            this.loading = true;
            this.errorSearchTerm = false;
            let search = this.searchTerm.trim();

            this.timeoutHandle = window.setTimeout(() => {
                this.timeoutHandle = null;
                if (this.periodoSelect) {
                    let periodoPuco = this.verificarPeriodo(this.periodoSelect.version, this.ultimaActualizacionPuco);
                    let periodoProfe = this.verificarPeriodo(this.periodoSelect.version, this.ultimaActualizacionProfe);

                    Observable.forkJoin([
                        this.obraSocialService.get({ dni: search, periodo: periodoPuco }),
                        this.profeService.get({ dni: search, periodo: periodoProfe })]).subscribe(t => {
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
                } else {    // Cuando se quiere buscar un dni sin ingresar un periodo
                    this.loading = false;
                }
            }, 400);
        } else {
            if (this.searchTerm) {
                this.errorSearchTerm = true;
                // this.searchTerm = this.searchTerm.substr(0, this.searchTerm.length - 1);
            }
        }
    };

    // Boton reporte de errores/sugerencias
    sugerencias() {
        this.sugerenciasService.post();
    }
}
