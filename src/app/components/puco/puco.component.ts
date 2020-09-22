
import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ObraSocialService } from './../../services/obraSocial.service';
import { ProfeService } from './../../services/profe.service';
import { SugerenciasService } from '../../services/sendmailsugerencias.service';
import { IProfe } from '../../interfaces/IProfe';
import { forkJoin as observableForkJoin } from 'rxjs';
import { DocumentosService } from '../../services/documentos.service';
import { Auth } from '@andes/auth';

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
    public pacienteSumar: any;
    public showPrintForm = false;
    public usuarioSelected = null;
    private resSumar: any;
    private resPuco = [];
    private resProfe: IProfe[];
    private timeoutHandle: number;
    public requestInProgress: boolean;

    @Input() autofocus: Boolean = true;

    // termino a buscar ..
    public searchTerm: String = '';

    // ultima request que se almacena con el subscribe
    private lastRequest: Subscription;

    constructor(
        private obraSocialService: ObraSocialService,
        private profeService: ProfeService,
        private sugerenciasService: SugerenciasService,
        private auth: Auth,
        private documentosService: DocumentosService) { }

    /* limpiamos la request que se haya ejecutado */
    ngOnDestroy() {
        if (this.lastRequest) {
            this.lastRequest.unsubscribe();
        }
    }
    ngOnInit() {

        observableForkJoin([
            this.obraSocialService.getPadrones({}),
            this.profeService.getPadrones({})]
        ).subscribe(padrones => {

            let periodoMasActual = new Date();  // fecha actual para configurar el select a continuacion ..

            // se construye el contenido del select segun la cantidad de meses hacia atras que se pudiera consultar
            for (let i = 0; i < this.cantidadPeriodos; i++) {
                let periodoAux = moment(periodoMasActual).subtract(i, 'month');
                this.periodos[i] = { id: i, nombre: moment(periodoAux).format('MMMM [de] YYYY'), version: periodoAux };    // Ej: {1, "mayo 2018", "2018/05/05"}

            }
            this.setPeriodo(this.periodos[0]);  // por defecto se setea el periodo en el corriente mes
            this.periodoMasAntiguo = this.periodos[this.cantidadPeriodos - 1];  // ultimo mes hacia atras que mostrará el select


            // (Para el sidebar) Se setean las variables para mostrar los padrones de PUCO que se encuentran disponibles.
            if (padrones[0].length) {
                for (let i = 0; i < padrones[0].length; i++) {

                    if (i === padrones[0].length - 1) {
                        this.listaPeriodosPuco += moment(padrones[0][i].version).utc().format('MMMM [de] YYYY');
                    } else {
                        this.listaPeriodosPuco += moment(padrones[0][i].version).utc().format('MMMM [de] YYYY') + ', ';
                    }
                }
                this.ultimaActualizacionPuco = moment(padrones[0][0].version).utc();
            }


            // (Para el sidebar) Se setean las variables para mostrar los padrones de INCLUIR SALUD que se encuentran disponibles.
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

    // Realiza controles simples cuando se modifica el valor del select
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

    /* Al realizar una búsqueda, verifica que esta no se realice sobre un periodo/mes aún no actualizado (Sin padrón correspondiente).
    * De ser asi retorna el padrón mas actual para que la búsqueda se realice sobre este.
    */
    verificarPeriodo(periodo1, periodo2) {
        periodo1 = new Date(periodo1);
        periodo2 = new Date(periodo2);
        let p1 = moment(periodo1).startOf('month').format('YYYY-MM-DD');
        let p2 = moment(periodo2).add(3, 'hours').startOf('month').format('YYYY-MM-DD');

        if (moment(p1).diff(p2) > 0) {
            return p2;
        } else {
            return p1;
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
                    // se verifica que el periodo seleccionado corresponda a un padrón existente.
                    let periodoPuco = this.verificarPeriodo(this.periodoSelect.version, this.ultimaActualizacionPuco);
                    let periodoProfe = this.verificarPeriodo(this.periodoSelect.version, this.ultimaActualizacionProfe);

                    observableForkJoin([
                        this.obraSocialService.getSumar({ dni: search }),
                        this.obraSocialService.get({ dni: search, periodo: periodoPuco }),
                        this.profeService.get({ dni: search, periodo: periodoProfe })]).subscribe(t => {
                            this.loading = false;
                            this.resSumar = t[0];
                            this.resPuco = t[1];
                            this.resProfe = (t[2] as any);

                            if ((this.resPuco.length > 0) || (this.resProfe.length > 0)) {
                                if (this.resPuco.length > 0) {
                                    this.usuarios = <any>this.resPuco;
                                }
                                if (this.resProfe.length > 0) {
                                    if (this.resPuco) {
                                        this.usuarios = this.resPuco.concat(this.resProfe);
                                    } else {
                                        this.usuarios = <any>this.resProfe;
                                    }
                                }
                            } else if (this.resSumar.length > 0) {
                                const dataSumar = this.resSumar[0];
                                this.usuarios.push({
                                    dni: dataSumar.afidni,
                                    nombre: `${dataSumar.afinombre} ${dataSumar.afiapellido}`,
                                    financiador: 'Programa SUMAR',
                                    claveBeneficiario: dataSumar.clavebeneficiario
                                });
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
    }

    // Boton reporte de errores/sugerencias
    sugerencias() {
        this.sugerenciasService.post();
    }


    checkLog() {
        return this.auth.loggedIn();
    }

    imprimirConstatacion(usuario: any) {
        let dto = {
            dni: usuario.dni,
            nombre: usuario.nombre,
            codigoFinanciador: (usuario.codigoFinanciador) ? usuario.codigoFinanciador : '',
            financiador: usuario.financiador,
            claveBeneficiario: usuario.claveBeneficiario
        };

        this.requestInProgress = true;
        this.documentosService.descargarConstanciaPuco(dto, dto.nombre).subscribe(
            () => this.requestInProgress = false,
            () => this.requestInProgress = false
        );

    }

}
