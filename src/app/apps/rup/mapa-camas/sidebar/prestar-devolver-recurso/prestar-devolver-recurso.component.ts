import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { cache } from '@andes/shared';
import { forkJoin, Observable } from 'rxjs';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { first, map, pluck } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-prestar-devolver-recurso',
    templateUrl: 'prestar-devolver-recurso.component.html',
})

export class PrestarDevolverRecursoComponent implements OnInit {
    @Input() accion;
    @Output() onSave = new EventEmitter<any>();

    public unidadesOrganizativas$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
        cache(),
        pluck('unidadesOrganizativas')
    );

    public fecha;
    public selectedUnidadOrganizativa;

    public ambito: string;
    public cama: ISnapshot;
    public inProgress = false;
    public accionPermitida = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        public organizacionService: OrganizacionService,
        private camasHTTP: MapaCamasHTTP
    ) { }

    ngOnInit() {
        this.fecha = this.mapaCamasService.fecha2.getValue();
        this.ambito = this.mapaCamasService.ambito2.getValue();

        this.mapaCamasService.camaSelectedSegunView$.pipe(first()).subscribe((cama) => {
            this.cama = cama;
            this.onDateChange();
        });
    }


    guardar(cama) {
        if (!this.accionPermitida) {
            return;
        }
        const datosCama = {
            _id: this.cama.id,
            esMovimiento: false,
            unidadOrganizativa: (this.accion === 'devolver') ? cama.unidadOrganizativaOriginal : this.selectedUnidadOrganizativa
        };
        forkJoin([
            this.camasHTTP.save(this.ambito, 'estadistica', this.fecha, datosCama),
            this.camasHTTP.save(this.ambito, 'medica', this.fecha, datosCama),
        ]).subscribe(() => {
            const title = this.accion === 'prestar' ? 'Recurso prestado' : 'Recurso devuelto';
            this.plex.info(
                'success',
                `El recurso está la siguiente unidad organizativa: ${cama.unidadOrganizativa.term}`,
                title
            );
            this.onSave.emit();
            this.mapaCamasService.setFecha(this.fecha);
        });
    }

    onType() {
        this.inProgress = true;
    }

    onDateChange() {
        this.inProgress = true;
        this.accionPermitida = false;
        forkJoin([
            this.camasHTTP.snapshot(this.ambito, 'estadistica', this.fecha, null, null, this.cama.id).pipe(
                map(snapshots => snapshots[0])
            ),
            this.camasHTTP.snapshot(this.ambito, 'medica', this.fecha, null, null, this.cama.id).pipe(
                map(snapshots => snapshots[0])
            ),
            this.camasHTTP.historial(this.ambito, 'estadistica', this.fecha, new Date(), { idCama: this.cama.id }),
            this.camasHTTP.historial(this.ambito, 'medica', this.fecha, new Date(), { idCama: this.cama.id }),
        ]).subscribe(([estadistica, medica, historialEst, historialMed]) => {
            this.inProgress = false;
            const camasDisponibles = estadistica.estado === 'disponible' && medica.estado === 'disponible';
            const historialVacio = historialEst.length === 0 && historialMed.length === 0;
            if (camasDisponibles && historialVacio) {
                this.accionPermitida = true;
            } else {
                this.accionPermitida = false;
            }
        });
    }
}
