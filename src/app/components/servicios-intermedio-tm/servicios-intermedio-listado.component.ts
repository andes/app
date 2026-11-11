import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IServicioIntermedio, IServicioIntermedioSearchParams } from '../../interfaces/IServicioIntermedio';
import { getServicioIntermedioId } from '../../interfaces/servicio-intermedio.normalize';
import { ServicioIntermedioService } from '../../modules/rup/services/servicio-intermedio.service';

@Component({
    selector: 'servicios-intermedio-tm-listado',
    templateUrl: './servicios-intermedio-listado.component.html',
    styleUrls: ['./servicios-intermedio-listado.component.scss']
})
export class ServiciosIntermedioListadoComponent implements OnInit {

    /** Texto libre: API `search` sobre `nombre` (ResourceBase). */
    searchTerm = '';

    /**
     * `plSort` solo acepta Observable (combineLatest en Plex); exponemos la lista así para la tabla.
     */
    readonly items$ = new BehaviorSubject<IServicioIntermedio[]>([]);
    loading = false;
    loadingMore = false;
    skip = 0;
    readonly pageSize = 25;
    finScroll = false;

    public columns = [
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            opcional: false,
            sort: (a: IServicioIntermedio, b: IServicioIntermedio) => a.nombre.localeCompare(b.nombre)
        },
        {
            key: 'turneables',
            label: 'Conceptos turneables',
            sorteable: false,
            opcional: true
        },
        {
            key: 'procedimientos',
            label: 'Procedimientos / ECL',
            sorteable: false,
            opcional: true
        },
        {
            key: 'acciones',
            label: 'Acciones',
            sorteable: false,
            opcional: false
        }
    ];

    constructor(
        private auth: Auth,
        private router: Router,
        private plex: Plex,
        private servicioIntermedioService: ServicioIntermedioService
    ) { }

    ngOnInit() {
        if (this.auth.getPermissions('tm:servicios-intermedio:?').length < 1) {
            this.router.navigate(['inicio']);
            return;
        }
        this.plex.updateTitle('Tablas maestras / Servicios intermedio');
        this.filtrar();
    }

    idOf(row: IServicioIntermedio): string | undefined {
        return getServicioIntermedioId(row);
    }

    turneablesCount(row: IServicioIntermedio): number {
        return row.conceptosTurneables?.length ?? 0;
    }

    /** Indicador: ECL configurada vs solo procedimientos materializados. */
    tieneEcl(row: IServicioIntermedio): boolean {
        return !!(row.procedimientosEcl && String(row.procedimientosEcl).trim().length);
    }

    procedimientosCount(row: IServicioIntermedio): number {
        return row.procedimientos?.length ?? 0;
    }

    filtrar() {
        this.skip = 0;
        this.finScroll = false;
        this.items$.next([]);
        this.fetchPage();
    }

    onScroll() {
        if (this.finScroll || this.loading || this.loadingMore) {
            return;
        }
        this.fetchPage();
    }

    private fetchPage() {
        const isFirstPage = this.skip === 0;
        if (isFirstPage) {
            this.loading = true;
        } else {
            this.loadingMore = true;
        }

        const params: IServicioIntermedioSearchParams = {
            limit: this.pageSize,
            skip: this.skip
        };
        const q = this.searchTerm?.trim();
        if (q) {
            params.search = q;
        }

        this.servicioIntermedioService.search(params).pipe(
            finalize(() => {
                this.loading = false;
                this.loadingMore = false;
            })
        ).subscribe(
            (list) => {
                this.items$.next([...this.items$.getValue(), ...list]);
                this.skip += list.length;
                if (list.length < this.pageSize) {
                    this.finScroll = true;
                }
            },
            () => {
                this.plex.toast('danger', 'No se pudo cargar el listado de servicios intermedio.');
            }
        );
    }

    irEditar(row: IServicioIntermedio) {
        const id = this.idOf(row);
        if (!id) {
            return;
        }
        this.router.navigate(['/tm/servicios-intermedio/create', id]);
    }

    borrar(row: IServicioIntermedio) {
        const id = this.idOf(row);
        if (!id) {
            return;
        }
        this.plex.confirm(
            `¿Eliminar el servicio intermedio «${row.nombre}»? Esta acción no se puede deshacer.`,
            'Confirmar eliminación'
        ).then((confirmado) => {
            if (!confirmado) {
                return;
            }
            this.servicioIntermedioService.delete(id).subscribe(
                () => {
                    this.plex.toast('success', 'Servicio intermedio eliminado correctamente.');
                    this.filtrar();
                },
                () => {
                    this.plex.toast('danger', 'No se pudo eliminar el servicio intermedio.');
                }
            );
        });
    }
}
