import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { forkJoin } from 'rxjs';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { first, map, pluck } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { ObjectID } from 'bson';

@Component({
    selector: 'app-prestar-devolver-recurso',
    templateUrl: 'prestar-devolver-recurso.component.html',
})

export class PrestarDevolverRecursoComponent implements OnInit {
    @Input() accion;
    @Output() saved = new EventEmitter<any>();

    public unidadesOrganizativas$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
        pluck('unidadesOrganizativas'),
        map(unidadesOrganizativas => unidadesOrganizativas.filter(uo => uo.id !== (this.cama.unidadOrganizativa as any)._id))
    );

    public fecha;
    public selectedUnidadOrganizativa;
    public ambito: string;
    public cama: ISnapshot;
    public inProgress = false;
    public accionPermitida = false;
    private esOrganizacionV2: boolean; // true si usa capas unificadas

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
        const datosCama: any = {
            _id: this.cama.id,
            esMovimiento: true,
            estado: cama.estado,
            unidadOrganizativa: (this.accion === 'devolver') ? cama.unidadOrganizativaOriginal : this.selectedUnidadOrganizativa,
            extras: (this.accion === 'devolver') ? { devolucion: true } : { prestamo: true }
        };
        let saveRequest;
        if (this.esOrganizacionV2) { // Para organizaciones-v2 solo deberia modificar capa médica
            if (cama.estado === 'ocupada') {
                /** Como la cama está ocupada, se debe generar un estado nuevo con un idMovimiento
                 *  de manera que esta acción pueda ser rastreable y eliminarse en caso de ser necesario.
                */
                const idMovimiento = new ObjectID().toString();
                datosCama.extras = { idMovimiento };
                datosCama.estado = cama.estado;
            }
            saveRequest = this.camasHTTP.updateEstados(this.ambito, 'medica', this.fecha, datosCama);
        } else {
            saveRequest = this.camasHTTP.updateEstados(this.ambito, this.mapaCamasService.capa, this.fecha, datosCama);
        }
        saveRequest.subscribe(() => {
            const title = this.accion === 'prestar' ? 'Recurso prestado' : 'Recurso devuelto';
            this.plex.info(
                'success',
                `El recurso ahora se encuentra en <b>${datosCama.unidadOrganizativa.term}</b>`,
                title
            );
            this.saved.emit();
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
            this.camasHTTP.snapshot(this.ambito, this.mapaCamasService.capa, this.fecha, null, null, this.cama.id).pipe(
                map(snapshots => snapshots[0])
            ),
            this.organizacionService.usaCapasUnificadas(this.auth.organizacion.id)
        ]).subscribe(([camaCapa, organizacionV2]) => {
            this.inProgress = false;
            this.esOrganizacionV2 = organizacionV2;
            // El estado de otra capa no condiciona el préstamo.
            this.accionPermitida = organizacionV2 || camaCapa?.estado === 'disponible';
        });
    }
}
