import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import * as moment from 'moment';
import { DocumentoEscaneado, DocumentoEscaneados } from './../../../components/paciente/documento-escaneado.const';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { PacienteHttpService } from '../../../core/mpi/services/pacienteHttp.service';
import { PacienteBuscarService } from '../../../core/mpi/services/paciente-buscar.service';
import { Subscription } from 'rxjs';

interface PacienteEscaneado {
    documento: string;
    apellido: string;
    nombre: string;
    sexo: string;
    fechaNacimiento: Date;
    scan: string;
}

@Component({
    selector: 'paciente-buscar',
    templateUrl: 'paciente-buscar.html',
    styleUrls: ['paciente-buscar.scss']
})
export class PacienteBuscarComponent implements OnInit, OnDestroy {
    private timeoutHandle: number;
    public textoLibre: string = null;
    public autoFocus = 0;
    public routes;
    private pacienteRoute = '/apps/mpi/paciente';
    private searchSubscription = new Subscription();
    get disabled() {
        return !this.textoLibre || this.textoLibre.length === 0;
    }

    @Input() hostComponent = '';
    @Input() create = false;
    @Input() returnScannedPatient = false;  // Indica si queremos retornar el objeto del paciente escaneado

    // Eventos
    @Output() searchStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchEnd: EventEmitter<PacienteBuscarResultado> = new EventEmitter<PacienteBuscarResultado>();
    @Output() searchClear: EventEmitter<any> = new EventEmitter<any>();


    constructor(
        private plex: Plex,
        private pacienteHttp: PacienteHttpService,
        private pacienteBuscar: PacienteBuscarService) {
    }

    public ngOnInit() {
        this.autoFocus = this.autoFocus + 1;
        this.routes = [
            { label: 'BEBÉ', route: `${this.pacienteRoute}/bebe/${this.hostComponent}` },
            { label: 'EXTRANJERO', route: `${this.pacienteRoute}/extranjero/${this.hostComponent}` },
            { label: 'CON DNI ARGENTINO', route: `${this.pacienteRoute}/con-dni/${this.hostComponent}` },
            { label: 'SIN DNI ARGENTINO', route: `${this.pacienteRoute}/sin-dni/${this.hostComponent}` },
        ];
    }

    ngOnDestroy(): void {
        clearInterval(this.timeoutHandle);
    }


    /**
     * Controla si se ingresó el caracter " en la primera parte del string, indicando que el scanner no está bien configurado
     *
     * @private
     * @returns {boolean} Indica si está bien configurado
     */
    private controlarScanner(): boolean {
        if (this.textoLibre) {
            let index = this.textoLibre.indexOf('"');
            if (index >= 0 && index < 20 && this.textoLibre.length > 5) {
                /* Agregamos el control que la longitud sea mayor a 5 para incrementar la tolerancia de comillas en el input */
                this.plex.info('warning', 'El lector de código de barras no está configurado. Comuníquese con la Mesa de Ayuda de TICS');
                this.textoLibre = null;
                return false;
            }
        }
        return true;
    }

    /**
     * Busca paciente cada vez que el campo de busqueda cambia su valor
     */
    public buscar($event) {
        /* Error en Plex, ejecuta un change cuando el input pierde el foco porque detecta que cambia el valor */
        if ($event.type) {
            return;
        }
        // Cancela la búsqueda anterior
        if (this.timeoutHandle) {
            window.clearTimeout(this.timeoutHandle);
        }

        // Controla el scanner
        if (!this.controlarScanner()) {
            return;
        }

        let textoLibre = this.textoLibre && this.textoLibre.trim();
        // Inicia búsqueda
        if (textoLibre) {
            this.timeoutHandle = window.setTimeout(() => {
                this.searchStart.emit();
                this.timeoutHandle = null;

                // Si matchea una expresión regular, busca inmediatamente el paciente
                let pacienteEscaneado = this.pacienteBuscar.comprobarDocumentoEscaneado(textoLibre);
                if (pacienteEscaneado) {
                    this.pacienteBuscar.findByScan(pacienteEscaneado).subscribe(resultadoPacientes => {
                        if (resultadoPacientes.pacientes.length) {
                            return this.searchEnd.emit(resultadoPacientes);
                        } else {
                            // Si el paciente no fue encontrado ..
                            if (this.returnScannedPatient) {
                                // Ingresa a registro de pacientes ya que es escaneado
                                return this.searchEnd.emit({ pacientes: [pacienteEscaneado], escaneado: true, scan: textoLibre, err: null });
                            } else {
                                return this.searchEnd.emit({ pacientes: [], err: null });
                            }
                        }
                    });
                } else {
                    // 2. Busca por texto libre
                    if (this.searchSubscription) {
                        this.searchSubscription.unsubscribe();
                    }
                    this.searchSubscription = this.pacienteHttp.match({
                        type: 'multimatch',
                        cadenaInput: textoLibre
                    }).subscribe(
                        resultado => {
                            this.searchEnd.emit({ pacientes: resultado, err: null });
                        },
                        (err) => this.searchEnd.emit({ pacientes: [], err: err })
                    );
                }
            }, 500);
        } else {
            this.searchClear.emit();
        }
    }
}
