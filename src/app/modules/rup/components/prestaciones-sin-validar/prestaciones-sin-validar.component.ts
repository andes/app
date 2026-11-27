import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Plex } from '@andes/plex';
import { firstValueFrom, Subscription } from 'rxjs';
import { IPrestacionSinValidar } from '../../interfaces/prestacionSinValidar.interface';
import { PrestacionesService } from '../../services/prestaciones.service';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'rup-prestaciones-sin-validar',
    templateUrl: './prestaciones-sin-validar.component.html',
    styleUrls: ['./prestaciones-sin-validar.component.scss']
})
export class PrestacionesSinValidarComponent implements OnInit, OnDestroy {
    @Input() tieneAccesoHUDS = false;
    @Output() cerrar = new EventEmitter<void>();
    @Output() continuar = new EventEmitter<IPrestacionSinValidar>();
    @Output() verHuds = new EventEmitter<IPrestacionSinValidar>();
    @Output() refrescar = new EventEmitter<void>();

    public prestacionesSinValidar: IPrestacionSinValidar[] = [];
    public cargandoPrestacionesSinValidar = false;
    public hasMorePrestacionesSinValidar = true;

    private readonly limit = 15;
    private skip = 0;
    private reintentoSinNuevos = 0;
    private lastRequestPrestacionesSinValidar: Subscription;
    private destruido = false;
    private viewportTimeout: any;

    @ViewChild('listaSinValidar', { read: ElementRef }) listaSinValidar: ElementRef;

    constructor(
        private plex: Plex,
        private servicioPrestacion: PrestacionesService,
        private servicioAgenda: AgendaService
    ) { }

    ngOnInit() {
        this.cargarPrestacionesSinValidar();
    }

    ngOnDestroy() {
        this.destruido = true;
        if (this.viewportTimeout) {
            clearTimeout(this.viewportTimeout);
            this.viewportTimeout = null;
        }
        this.stopCargaPrestacionesSinValidar();
    }

    cargarPrestacionesSinValidar() {
        if (this.destruido || this.cargandoPrestacionesSinValidar || !this.hasMorePrestacionesSinValidar) {
            return;
        }
        this.cargandoPrestacionesSinValidar = true;
        this.lastRequestPrestacionesSinValidar = this.servicioPrestacion.getPrestacionesSinValidar({
            skip: this.skip,
            limit: this.limit
        }).subscribe({
            next: (response) => {
                if (this.destruido) {
                    return;
                }
                const items = response?.items || [];
                const existentes = new Set(this.prestacionesSinValidar.map(prestacion => prestacion.id));
                const nuevasPrestaciones = items.filter(prestacion => !existentes.has(prestacion.id));

                this.skip += items.length;
                this.prestacionesSinValidar = this.prestacionesSinValidar.concat(nuevasPrestaciones);
                this.hasMorePrestacionesSinValidar = !!response?.hasMore && items.length > 0;
                this.cargandoPrestacionesSinValidar = false;

                if (!nuevasPrestaciones.length && items.length && this.hasMorePrestacionesSinValidar) {
                    if (this.reintentoSinNuevos < 1) {
                        this.reintentoSinNuevos++;
                        this.cargarPrestacionesSinValidar();
                    } else {
                        this.hasMorePrestacionesSinValidar = false;
                        this.reintentoSinNuevos = 0;
                    }
                    return;
                }

                this.reintentoSinNuevos = 0;
                this.completarViewport();
            },
            error: () => {
                this.cargandoPrestacionesSinValidar = false;
                if (!this.destruido) {
                    this.plex.info('warning', 'No se pudieron cargar las prestaciones sin validar', 'Aviso');
                }
            }
        });
    }

    onScroll() {
        this.cargarPrestacionesSinValidar();
    }

    registrarInasistencia(prestacion: IPrestacionSinValidar) {
        this.actualizarAsistencia(prestacion, 'noAsistio');
    }

    revertirInasistencia(prestacion: IPrestacionSinValidar) {
        this.actualizarAsistencia(prestacion, 'sacarAsistencia');
    }

    invalidar(prestacion: IPrestacionSinValidar) {
        this.confirmarInvalidar(prestacion);
    }

    private async actualizarAsistencia(prestacion: IPrestacionSinValidar, operacion: 'noAsistio' | 'sacarAsistencia') {
        const turnoInfo = prestacion.turnoInfo;
        if (!turnoInfo || !turnoInfo.encontrado) {
            this.plex.info('warning', 'No se encontró la agenda asociada al turno', 'Aviso');
            return;
        }

        const msg = operacion === 'noAsistio' ?
            `¿Está seguro que desea registrar la inasistencia del paciente: <b> ${prestacion.paciente.apellido} ${prestacion.paciente.alias || prestacion.paciente.nombre} </b> ?` :
            '¿Está seguro que desea revertir los cambios?';

        const confirmado = await this.plex.confirm(msg);
        if (this.destruido || !confirmado) {
            return;
        }

        try {
            await firstValueFrom(this.servicioAgenda.patch(turnoInfo.idAgenda, { op: operacion, turnos: [turnoInfo.id] }));
            if (this.destruido) {
                return;
            }
            turnoInfo.asistencia = operacion === 'noAsistio' ? 'noAsistio' : null;
            this.refrescar.emit();
        } catch {
            if (!this.destruido) {
                this.plex.info('warning', 'No se pudo actualizar la asistencia', 'Aviso');
            }
        }
    }

    private async confirmarInvalidar(prestacion: IPrestacionSinValidar) {
        const turnoInfo = prestacion.turnoInfo;
        const data = turnoInfo ? {
            idAgenda: turnoInfo.encontrado ? turnoInfo.idAgenda : null,
            idTurno: turnoInfo.id,
            tipoTurno: turnoInfo.encontrado ? turnoInfo.tipoTurno : null
        } : null;

        const confirmado = await this.plex.confirm('¿Está seguro que desea invalidar esta prestación?');
        if (this.destruido || !confirmado) {
            return;
        }

        try {
            await firstValueFrom(this.servicioPrestacion.invalidarPrestacion(prestacion, data));
            if (this.destruido) {
                return;
            }
            this.quitarPrestacion(prestacion.id);
            this.refrescar.emit();
        } catch {
            if (!this.destruido) {
                this.plex.info('warning', 'No se pudo invalidar la prestación', 'Aviso');
            }
        }
    }

    private quitarPrestacion(id: string) {
        const cantidadAnterior = this.prestacionesSinValidar.length;
        this.prestacionesSinValidar = this.prestacionesSinValidar.filter(prestacion => prestacion.id !== id);
        if (this.prestacionesSinValidar.length < cantidadAnterior) {
            this.skip = Math.max(0, this.skip - 1);
        }
        if (!this.prestacionesSinValidar.length && this.hasMorePrestacionesSinValidar) {
            this.cargarPrestacionesSinValidar();
        } else {
            this.completarViewport();
        }
    }

    private completarViewport() {
        if (this.destruido || !this.hasMorePrestacionesSinValidar || this.cargandoPrestacionesSinValidar) {
            return;
        }
        if (this.viewportTimeout) {
            clearTimeout(this.viewportTimeout);
        }
        this.viewportTimeout = setTimeout(() => {
            if (this.destruido) {
                return;
            }
            const host = this.listaSinValidar?.nativeElement as HTMLElement;
            const contenedor = host?.firstElementChild as HTMLElement;
            if (contenedor && contenedor.clientHeight > 0 && contenedor.scrollHeight <= contenedor.clientHeight) {
                this.cargarPrestacionesSinValidar();
            }
        });
    }

    private stopCargaPrestacionesSinValidar() {
        if (this.lastRequestPrestacionesSinValidar) {
            this.lastRequestPrestacionesSinValidar.unsubscribe();
            this.lastRequestPrestacionesSinValidar = null;
        }
        this.cargandoPrestacionesSinValidar = false;
    }
}
