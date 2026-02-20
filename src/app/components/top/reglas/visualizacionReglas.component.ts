import moment from 'moment';
import { Auth } from '@andes/auth';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { DocumentosService } from 'src/app/services/documentos.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { IRegla } from '../../../interfaces/IRegla';
import { Observable, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { ReglaService } from '../../../services/top/reglas.service';

@Component({
    selector: 'visualizacion-reglas',
    templateUrl: './visualizacionReglas.html',
    styles: [`
        .loader {
            position: absolute;
            top: 45%;
            left: 45%;
        }
        .loading {
            opacity: 50%;
        }
    `]
})
export class VisualizacionReglasComponent implements OnInit {
    @Input() esParametrizado = false;
    @Input() prestacion: ISnomedConcept = null;

    @Output() addSolicitud = new EventEmitter<any>();
    /**
     * Organización ingresada en el filtro de organización origen
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    /**
     * Prestación ingresada en el filtro de prestación origen
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    public organizacionOrigen: IOrganizacion;
    public prestacionOrigen: ITipoPrestacion;
    /**
     * Organización ingresada en el filtro de organización destino
     * @type {IOrganizacion}
     * @memberof VisualizacionReglasComponent
     */
    public organizacionDestino: IOrganizacion;
    /**
     * Prestación ingresada en el filtro de prestación destino
     * @type {ITipoPrestacion}
     * @memberof VisualizacionReglasComponent
     */
    public prestacionDestino: ITipoPrestacion;
    /**
     * Datos de las filas de la tabla resultados. Se realiza en typescript por ser
     * más sencillo que en HTML
     *
     * @type {any[]}
     * @memberof VisualizacionReglasComponent
     */
    public arrayReglas: any = [];
    public filas: any[];
    public parametros;
    public filas$: Observable<any[]>;
    public loader = false;
    private scrollEnd = false;
    public search = '';

    constructor(
        private servicioReglas: ReglaService,
        private auth: Auth,
        public servicioPrestacion: PrestacionesService,
        private documentosService: DocumentosService
    ) { }

    ngOnInit() {
        this.parametros = {
            organizacionOrigen: undefined,
            organizacionDestino: undefined,
            prestacionDestino: undefined,
            prestacionOrigen: this.prestacion?.conceptId || undefined,
            search: this.search,
            skip: 0,
            limit: 10
        };
        if (this.esParametrizado) {
            this.parametros['organizacionOrigen'] = this.auth.organizacion.id;
            this.parametros['prestacionesOrigen'] = 'rup:tipoPrestacion:?';
            this.actualizarTabla();
        }
    }

    get hayFiltro() {
        return this.organizacionOrigen || this.organizacionDestino || this.prestacionOrigen || this.prestacionDestino;
    }

    refrescarFiltro() {
        this.parametros['organizacionOrigen'] = this.organizacionOrigen?.id || undefined;
        this.parametros['organizacionDestino'] = this.organizacionDestino?.id || undefined;
        this.parametros['prestacionDestino'] = this.prestacionDestino?.conceptId || undefined;
        this.parametros['prestacionOrigen'] = this.prestacionOrigen?.conceptId || undefined;

        // cada vez que se modifican los filtros seteamos el skip en 0
        this.parametros['skip'] = 0;
        this.scrollEnd = false;
        if (this.parametros.organizacionOrigen || this.parametros.organizacionDestino || this.parametros.prestacionOrigen || this.parametros.prestacionDestino) {
            this.actualizarTabla();
        } else {
            this.arrayReglas = [];
        }
    }

    public onSearchStart(event: any) {
        this.search = event.value;
        this.parametros['search'] = this.search;
        this.parametros['skip'] = 0;
        this.actualizarTabla();
    }

    /**
     * Recarga los datos de la tabla según los filtros ingresados. Debe tener por lo menos un filtro ingresado para que
     * se actualice la tabla
     * @memberof VisualizacionReglasComponent
     */
    actualizarTabla() {
        if (this.parametros['skip'] === 0) {
            this.loader = true;
            this.arrayReglas = [];
        }

        this.servicioReglas.get(this.parametros)
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe((reglas: [IRegla]) => {
                this.loader = false;
                this.arrayReglas.push(...reglas.filter(regla => regla.destino?.prestacion?.id));
                this.generarFilasObservable();
                this.parametros.skip = this.arrayReglas.length;
                if (!this.arrayReglas.length || this.arrayReglas.length < this.parametros.limit) {
                    this.scrollEnd = true;
                }
            });

    }

    generarFilasObservable() {

        this.filas$ = of(
            this.arrayReglas.flatMap(regla =>
                regla.origen.prestaciones?.flatMap((prestacionAux: any) => {

                    if (
                        !this.prestacionOrigen ||
                        this.prestacionOrigen.conceptId === prestacionAux.prestacion.conceptId
                    ) {
                        if (
                            !this.prestacion ||
                            prestacionAux.prestacion.conceptId === this.prestacion.conceptId
                        ) {

                            const fila = {
                                organizacionOrigen: regla.origen.organizacion,
                                prestacionOrigen: prestacionAux.prestacion,
                                organizacionDestino: regla.destino.organizacion,
                                prestacionDestino: regla.destino.prestacion,
                            };
                            return fila;
                        }
                    }
                    return []; // Devuelve un array vacío si no se cumple ninguna condición
                })
            )
        );

        this.filas$.subscribe(filas => {
            filas.sort((fila1, fila2) => {
                if (fila2.prestacionDestino.term < fila1.prestacionDestino.term) {
                    return 1;
                }
                if (fila2.prestacionDestino.term > fila1.prestacionDestino.term) {
                    return -1;
                }
                return 0;
            });
        });
    }

    public seleccionarConcepto(concepto) {
        this.addSolicitud.emit(concepto);
    }

    descargarReglas() {
        const params = {
            organizacionOrigen: this.organizacionOrigen?.id,
            organizacionDestino: this.organizacionDestino?.id,
            prestacionOrigen: this.prestacionOrigen?.conceptId,
            prestacionDestino: this.prestacionDestino?.conceptId
        };

        this.documentosService.descargarReglasGlobales(params, `reglasGlobales ${moment().format('DD-MM-hh-mm-ss')}`).subscribe();
    }

    onScroll() {
        if (!this.scrollEnd) {
            this.actualizarTabla();
        }
    }
}


