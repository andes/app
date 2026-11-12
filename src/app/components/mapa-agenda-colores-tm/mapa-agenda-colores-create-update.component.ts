import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { IMapaAgendaColor, MapaAgendaColorAlcance } from '../../interfaces/IMapaAgendaColor';
import { normalizeSnomedConcept } from '../../interfaces/servicio-intermedio.normalize';
import { ISnomedConcept } from '../../modules/rup/interfaces/snomed-concept.interface';
import { MapaAgendaColoresService } from '../turnos/gestor-agendas/mapa-agendas/mapa-agenda-colores.service';
import {
    alcancesCreables,
    etiquetaAlcance,
    puedeAccederAbmMapaAgendaColores,
    puedeMutarMapaAgendaColor
} from './mapa-agenda-colores-permisos.util';

/** ECL raíz «Procedimiento» para búsqueda SNOMED (mismo patrón TM servicios intermedio). */
const SNOMED_PROCEDURE_ROOT_ECL = '<<71388002';
const DEFAULT_COLOR = '#2196f3';

@Component({
    selector: 'mapa-agenda-colores-tm-create-update',
    templateUrl: './mapa-agenda-colores-create-update.component.html',
    styleUrls: ['./mapa-agenda-colores-create-update.component.scss']
})
export class MapaAgendaColoresCreateUpdateComponent implements OnInit, OnDestroy {

    readonly conceptoSnomedExpression = SNOMED_PROCEDURE_ROOT_ECL;

    /** Valor estático: los inicializadores de campo corren antes que `alcanceOpciones` y la inyección de `Auth`. */
    model: IMapaAgendaColor = {
        concepto: undefined,
        color: DEFAULT_COLOR,
        alcance: 'organizacion',
        activo: true
    };
    /** Objeto Profesional para `tmProfesionales` (solo alta). */
    profesionalSeleccionado: any;

    reglaId: string | null = null;
    loading = false;
    saving = false;

    alcanceOpciones: { id: MapaAgendaColorAlcance; nombre: string }[] = [];
    puedeEditarRegla = true;

    private routeSub: Subscription;

    constructor(
        private auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private plex: Plex,
        private mapaAgendaColoresService: MapaAgendaColoresService
    ) { }

    ngOnInit() {
        if (!puedeAccederAbmMapaAgendaColores(this.auth)) {
            this.router.navigate(['inicio']);
            return;
        }
        this.alcanceOpciones = alcancesCreables(this.auth).map((id) => ({
            id,
            nombre: etiquetaAlcance(id)
        }));
        if (!this.alcanceOpciones.length) {
            this.router.navigate(['inicio']);
            return;
        }

        this.routeSub = this.route.params.subscribe((params) => {
            const id = params['id'] as string | undefined;
            this.reglaId = id ?? null;
            if (this.reglaId) {
                this.cargar(this.reglaId);
            } else {
                this.model = this.emptyModel();
                this.profesionalSeleccionado = undefined;
                this.puedeEditarRegla = true;
                this.actualizarTitulo(false);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe();
    }

    get isEdit(): boolean {
        return !!this.reglaId;
    }

    get alcanceEsProfesional(): boolean {
        return this.alcanceKeyword(this.model.alcance) === 'profesional';
    }

    get alcanceEsGlobal(): boolean {
        return this.alcanceKeyword(this.model.alcance) === 'global';
    }

    etiquetaAlcance = etiquetaAlcance;

    /** Alcance resuelto para plantilla (plex-select puede dejar un objeto momentáneamente en el modelo). */
    get alcanceActual(): MapaAgendaColorAlcance {
        return this.alcanceKeyword(this.model.alcance);
    }

    volver() {
        this.router.navigate(['/tm/mapa-agenda-colores']);
    }

    guardar(event: { formValid?: boolean }) {
        if (!event?.formValid) {
            this.plex.toast('danger', 'Revise los campos obligatorios.');
            return;
        }
        if (this.isEdit && !this.puedeEditarRegla) {
            this.plex.toast('danger', 'No tiene permiso para editar esta regla.');
            return;
        }
        if (!this.isEdit) {
            const concepto = normalizeSnomedConcept(this.model.concepto as ISnomedConcept);
            if (!concepto?.conceptId || !concepto.term) {
                this.plex.toast('danger', 'Seleccione un concepto SNOMED válido.');
                return;
            }
            const alcance = this.alcanceKeyword(this.model.alcance);
            if (alcance === 'profesional' && !this.profesionalSeleccionado?.id) {
                this.plex.toast('danger', 'Seleccione un profesional.');
                return;
            }
        }
        const body = this.buildPayload();
        this.saving = true;
        const req = this.isEdit && this.reglaId
            ? this.mapaAgendaColoresService.update(this.reglaId, body)
            : this.mapaAgendaColoresService.create(body);

        req.pipe(
            finalize(() => { this.saving = false; })
        ).subscribe(
            () => {
                this.plex.toast('success', this.isEdit ? 'Regla de color actualizada.' : 'Regla de color creada.');
                this.router.navigate(['/tm/mapa-agenda-colores']);
            },
            () => {
                this.plex.toast('danger', 'No se pudo guardar la regla de color.');
            }
        );
    }

    onAlcanceChange() {
        this.model.alcance = this.alcanceKeyword(this.model.alcance);
        if (this.model.alcance !== 'profesional') {
            this.profesionalSeleccionado = undefined;
        }
    }

    /** Plex-select emite el ítem completo de `data`; el API espera el keyword (`global` | `organizacion` | `profesional`). */
    private alcanceKeyword(
        alcance: MapaAgendaColorAlcance | { id: MapaAgendaColorAlcance; nombre?: string } | null | undefined
    ): MapaAgendaColorAlcance {
        if (alcance != null && typeof alcance === 'object' && 'id' in alcance) {
            return alcance.id;
        }
        return alcance as MapaAgendaColorAlcance;
    }

    private cargar(id: string) {
        this.loading = true;
        this.mapaAgendaColoresService.get(id).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            (doc: IMapaAgendaColor) => {
                this.model = {
                    ...this.emptyModel(),
                    ...doc,
                    concepto: doc.concepto ? normalizeSnomedConcept(doc.concepto) : undefined,
                    color: doc.color || DEFAULT_COLOR,
                    alcance: doc.alcance,
                    activo: doc.activo !== false
                };
                this.puedeEditarRegla = puedeMutarMapaAgendaColor(this.auth, doc);
                if (!this.puedeEditarRegla) {
                    this.plex.toast('warning', 'Puede consultar esta regla; no tiene permiso para modificarla.');
                }
                this.actualizarTitulo(true);
            },
            () => {
                this.plex.toast('danger', 'No se pudo cargar la regla de color.');
                this.volver();
            }
        );
    }

    private actualizarTitulo(edita: boolean) {
        this.plex.updateTitle(
            edita ? 'Tablas maestras / Editar color mapa de agendas' : 'Tablas maestras / Nueva regla de color'
        );
    }

    private emptyModel(): IMapaAgendaColor {
        const defaultAlcance = this.alcanceOpciones?.[0]?.id
            ?? (this.auth ? alcancesCreables(this.auth)[0] : undefined)
            ?? 'organizacion';
        return {
            concepto: undefined,
            color: DEFAULT_COLOR,
            alcance: defaultAlcance,
            activo: true
        };
    }

    private buildPayload(): Partial<IMapaAgendaColor> {
        if (this.isEdit) {
            return {
                color: (this.model.color || '').trim(),
                activo: this.model.activo !== false
            };
        }

        const concepto = normalizeSnomedConcept(this.model.concepto as ISnomedConcept)!;
        const alcance = this.alcanceKeyword(this.model.alcance);
        const payload: Partial<IMapaAgendaColor> = {
            concepto,
            color: (this.model.color || '').trim(),
            alcance,
            activo: this.model.activo !== false
        };

        if (alcance === 'profesional' && this.profesionalSeleccionado?.id) {
            payload.profesional = { _id: String(this.profesionalSeleccionado.id) };
        }

        return payload;
    }

    profesionalCargadoLabel(): string {
        const p = this.model.profesional;
        if (!p) {
            return '—';
        }
        const id = p._id ?? p.id;
        return `${p.apellido || ''} ${p.nombre || ''}`.trim() || (id != null ? String(id) : '—');
    }
}
