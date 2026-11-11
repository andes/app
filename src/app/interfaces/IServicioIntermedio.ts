import { ISnomedConcept } from '../modules/rup/interfaces/snomed-concept.interface';

/**
 * Tabla maestra Servicio intermedio (`GET|POST|PATCH|DELETE /core/tm/servicios-intermedio`).
 * Alineado con `api/core/tm/schemas/servicio-intermedio.schema.ts` y respuestas JSON del API
 * (Mongoose + subdocumentos Snomed sin `_id` en conceptos).
 */
export interface IServicioIntermedio {
    /** ObjectId Mongo cuando el cuerpo lo incluye (p. ej. documento crudo). */
    _id?: string;
    /**
     * Identificador expuesto por el cliente HTTP / convenciones TM (virtual `id` o alias de `_id`).
     * Varios consumidores usan `s.id` (p. ej. pipes); mantener ambos opcionales por compatibilidad.
     */
    id?: string;
    nombre: string;
    concepto?: ISnomedConcept;
    /** Prestaciones TM; incluir `id` (conceptoTurneable) además de datos SNOMED para selects `tmPrestaciones`. */
    conceptosTurneables?: ISnomedConcept[];
    /** Materializado en servidor a partir de `procedimientosEcl` o persistido; puede mostrarse read-only en formularios. */
    procedimientos?: ISnomedConcept[];
    /** Expresión ECL para poblar `procedimientos` en el servidor (PATCH con vacío/`null` limpia ECL). */
    procedimientosEcl?: string | null;
}

/**
 * Parámetros soportados por `GET /core/tm/servicios-intermedio` (`ResourceBase` / MongoQuery).
 */
export interface IServicioIntermedioSearchParams {
    ids?: string[];
    /** Búsqueda por coincidencia exacta en `nombre`. */
    nombre?: string;
    /** Búsqueda de texto en campos configurados en el recurso (p. ej. `nombre`). */
    search?: string;
    limit?: number;
    skip?: number;
}
