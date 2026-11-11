import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { SnomedService } from '../../apps/mitos/services/snomed.service';
import { IServicioIntermedio } from '../../interfaces/IServicioIntermedio';
import { mapConceptosTurneablesForApi, normalizeSnomedConcept } from '../../interfaces/servicio-intermedio.normalize';
import { ISnomedConcept } from '../../modules/rup/interfaces/snomed-concept.interface';
import { ServicioIntermedioService } from '../../modules/rup/services/servicio-intermedio.service';

/**
 * ECL raíz «Procedimiento» (SNOMED CT) para búsqueda de un concepto asociado al TM.
 * Misma familia de patrones que `plex-select` + `[snomedExpression]` en RUP/TM.
 */
const SNOMED_PROCEDURE_ROOT_ECL = '<<71388002';

@Component({
    selector: 'servicios-intermedio-tm-create-update',
    templateUrl: './servicios-intermedio-create-update.component.html',
    styleUrls: ['./servicios-intermedio-create-update.component.scss']
})
export class ServiciosIntermedioCreateUpdateComponent implements OnInit, OnDestroy {

    readonly conceptoSnomedExpression = SNOMED_PROCEDURE_ROOT_ECL;
    /** Convención TM/RUP: permisos de prestaciones turneables (ver plan crud-servicio-intermedio). */
    readonly tmPrestacionesPerm = 'rup:tipoPrestacion:?';

    /** Sin `plSort` en la vista: orden fijo API; `sorteable` en false evita cabeceras clicables vacías. */
    readonly previewColumns = [
        { key: 'term', label: 'Término', sorteable: false, opcional: false },
        { key: 'conceptId', label: 'Concept ID', sorteable: false, opcional: true }
    ];

    model: IServicioIntermedio = this.emptyModel();

    servicioId: string | null = null;
    loading = false;
    saving = false;

    /** Resultado de previsualización ECL (solo procedimiento cuando el API lo provee en `semanticTag`). */
    previewRows: ISnomedConcept[] = [];
    previewLoading = false;
    previewNotice: string | null = null;

    private routeSub: Subscription;

    constructor(
        private auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private plex: Plex,
        private servicioIntermedioService: ServicioIntermedioService,
        private snomed: SnomedService
    ) { }

    ngOnInit() {
        if (this.auth.getPermissions('tm:servicios-intermedio:?').length < 1) {
            this.router.navigate(['inicio']);
            return;
        }
        this.routeSub = this.route.params.subscribe((params) => {
            const id = params['id'] as string | undefined;
            this.servicioId = id ?? null;
            if (this.servicioId) {
                this.cargar(this.servicioId);
            } else {
                this.model = this.emptyModel();
                this.previewRows = [];
                this.previewNotice = null;
                this.actualizarTitulo(false);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe();
    }

    get isEdit(): boolean {
        return !!this.servicioId;
    }

    get procedimientosReadonly(): ISnomedConcept[] {
        return this.model.procedimientos ?? [];
    }

    get mostrarProcedimientosServidor(): boolean {
        return this.procedimientosReadonly.length > 0;
    }

    previsualizarEcl() {
        const expr = (this.model.procedimientosEcl ?? '').toString().trim();
        if (!expr) {
            this.previewRows = [];
            this.previewNotice = 'Ingrese una expresión ECL para previsualizar.';
            return;
        }
        this.previewLoading = true;
        this.previewNotice = null;
        this.snomed.getQuery({
            expression: expr,
            type: 'inferred',
        }).pipe(
            finalize(() => { this.previewLoading = false; })
        ).subscribe(
            (rows: ISnomedConcept[]) => {
                const list = Array.isArray(rows) ? rows : [];
                const filtered = list.filter((r) =>
                    (r.semanticTag || '').toLowerCase() === 'procedimiento'
                );
                this.previewRows = filtered.length ? filtered : list;
                if (!this.previewRows.length) {
                    this.previewNotice = 'La consulta no devolvió conceptos con etiqueta «procedimiento» (o lista vacía).';
                }
            },
            () => {
                this.previewRows = [];
                this.previewNotice = 'No se pudo ejecutar la previsualización.';
            }
        );
    }

    volver() {
        this.router.navigate(['/tm/servicios-intermedio']);
    }

    guardar(event: { formValid?: boolean }) {
        if (!event?.formValid) {
            this.plex.toast('danger', 'Revise los campos obligatorios.');
            return;
        }
        const body = this.buildPayload();
        this.saving = true;
        const req = this.isEdit && this.servicioId
            ? this.servicioIntermedioService.update(this.servicioId, body)
            : this.servicioIntermedioService.create(body);

        req.pipe(
            finalize(() => { this.saving = false; })
        ).subscribe(
            () => {
                this.plex.toast('success', this.isEdit ? 'Servicio intermedio actualizado.' : 'Servicio intermedio creado.');
                this.router.navigate(['/tm/servicios-intermedio']);
            },
            () => {
                this.plex.toast('danger', 'No se pudo guardar el servicio intermedio.');
            }
        );
    }

    private cargar(id: string) {
        this.loading = true;
        this.servicioIntermedioService.get(id).pipe(
            finalize(() => { this.loading = false; })
        ).subscribe(
            (doc) => {
                this.model = {
                    ...this.emptyModel(),
                    ...doc,
                    nombre: doc.nombre ?? '',
                    concepto: doc.concepto ? normalizeSnomedConcept(doc.concepto) : undefined,
                    conceptosTurneables: doc.conceptosTurneables ?? [],
                    procedimientosEcl: doc.procedimientosEcl ?? undefined,
                    procedimientos: doc.procedimientos ?? []
                };
                this.actualizarTitulo(true);
                this.previewRows = [];
                this.previewNotice = null;
            },
            () => {
                this.plex.toast('danger', 'No se pudo cargar el servicio intermedio.');
                this.volver();
            }
        );
    }

    private actualizarTitulo(edita: boolean) {
        this.plex.updateTitle(
            edita ? 'Tablas maestras / Editar servicio intermedio' : 'Tablas maestras / Nuevo servicio intermedio'
        );
    }

    private emptyModel(): IServicioIntermedio {
        return {
            nombre: '',
            concepto: undefined,
            conceptosTurneables: [],
            procedimientosEcl: undefined,
            procedimientos: []
        };
    }

    /**
     * Normaliza con helpers de task 2; ECL vacía en edición → `null` para limpiar en API.
     */
    private buildPayload(): Partial<IServicioIntermedio> {
        const nombre = (this.model.nombre ?? '').trim();
        const concepto = normalizeSnomedConcept(this.model.concepto);
        const conceptosTurneables = mapConceptosTurneablesForApi(this.model.conceptosTurneables);

        const rawEcl = this.model.procedimientosEcl;
        const eclTrim = rawEcl == null ? '' : String(rawEcl).trim();

        const payload: Partial<IServicioIntermedio> = {
            nombre,
            conceptosTurneables
        };

        if (concepto) {
            payload.concepto = concepto;
        }

        if (eclTrim) {
            payload.procedimientosEcl = eclTrim;
        } else if (this.isEdit) {
            payload.procedimientosEcl = null;
        }

        return payload;
    }
}
