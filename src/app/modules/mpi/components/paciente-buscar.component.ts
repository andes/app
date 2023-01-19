import { Component, Output, EventEmitter, OnInit, OnDestroy, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../interfaces/PacienteBuscarResultado.inteface';
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
    styleUrls: []
})
export class PacienteBuscarComponent implements OnInit, OnDestroy {
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
    /* returnScannedPatient en true retorna un objeto con los datos del paciente escaneado en caso de
        que este no estuviera registrado */
    @Input() returnScannedPatient = false;

    // Eventos
    @Output() searchStart: EventEmitter<null> = new EventEmitter<null>();
    @Output() searchEnd: EventEmitter<PacienteBuscarResultado> = new EventEmitter<PacienteBuscarResultado>();
    @Output() searchClear: EventEmitter<null> = new EventEmitter<null>();


    constructor(
        private plex: Plex,
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
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
    }

    /**
     * Busca paciente cada vez que el campo de busqueda cambia su valor
     */
    public buscar($event) {
        /* Error en Plex, ejecuta un change cuando el input pierde el foco porque detecta que cambia el valor */
        if ($event.type) {
            return;
        }
        const textoLibre = (this.textoLibre && this.textoLibre.length) ? this.textoLibre.trim() : '';
        if (textoLibre && textoLibre.length) {
            // Controla el scanner
            if (!this.pacienteBuscar.controlarScanner(textoLibre)) {
                this.plex.info('warning', 'El lector de código de barras no está configurado. Comuníquese con la Mesa de Ayuda de TICS');
                return;
            }
            if (this.searchSubscription) {
                this.searchSubscription.unsubscribe();
            }
            this.searchStart.emit();
            this.pacienteBuscar.search(textoLibre, this.returnScannedPatient).subscribe(respuesta => {
                if (respuesta) {
                    this.searchEnd.emit(respuesta);
                }
            });
        } else {
            this.searchClear.emit();
        }
    }
}
