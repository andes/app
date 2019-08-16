import { Plex } from '@andes/plex';
import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { PacienteHttpService } from '../services/pacienteHttp.service';
import { PacienteBuscarService } from './paciente-buscar.service';



@Component({
    selector: 'paciente-buscar',
    templateUrl: 'paciente-buscar.html',
    styleUrls: ['paciente-buscar.scss']
})
export class PacienteBuscarComponent implements OnInit, OnDestroy {
    private timeoutHandle: number;
    public textoLibre: string = null;
    public autoFocus = 0;
    public disabled = true;

    public routes = [
        { label: 'BEBÉ', route: '/mpi/paciente/bebe' },
        { label: 'EXTRANJERO', route: '/mpi/paciente/extranjero' },
        { label: 'CON DNI ARGENTINO', route: '/mpi/paciente/con-dni' },
        { label: 'SIN DNI ARGENTINO', route: '/mpi/paciente/sin-dni' },
    ];

    @Input() create = true;
    @Input() disable = false;


    // Eventos
    @Output() searchStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchEnd: EventEmitter<any> = new EventEmitter<any>();
    @Output() searchClear: EventEmitter<any> = new EventEmitter<any>();

    // Flag indica filtrar inactivos

    constructor(
        private plex: Plex,
        private pacienteHttp: PacienteHttpService,
        private pacienteBuscar: PacienteBuscarService,
    ) {
    }

    public ngOnInit() {
        this.autoFocus = this.autoFocus + 1;
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
     * Busca paciente cada vez que el campo de busca cambia su valor
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
                        this.searchEnd.emit(resultadoPacientes);
                    });
                } else {
                    // 2. Busca por texto libre
                    this.pacienteHttp.search(textoLibre).subscribe(
                        resultado => {
                            this.searchEnd.emit({ pacientes: resultado, err: null });
                        },
                        (err) => this.searchEnd.emit({ pacientes: [], err: err })
                    );
                }
            }, 200);
        } else {
            this.searchClear.emit();
        }
    }
}
