import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PacientesConsentimientoService extends ResourceBaseHttp {
    protected url = '/core/tm/consentimiento';

    constructor(protected server: Server) {
        super(server);
    }

    getUltimoConsentimientoCuidar65(pacienteId: string): Observable<any> {
        return this.search({ pacienteId }).pipe(
            map((consentimientos: any) => {
                if (!consentimientos || consentimientos.encontrado === false) {
                    return null;
                }
                const listado = Array.isArray(consentimientos) ? consentimientos : [consentimientos];
                const cuidar65 = listado.filter((c: any) => c && c.programa === 'Cuidar65');
                cuidar65.sort((a, b) => {
                    const fechaA = a.fechaResp ? new Date(a.fechaResp).getTime() : 0;
                    const fechaB = b.fechaResp ? new Date(b.fechaResp).getTime() : 0;
                    return fechaB - fechaA;
                });
                return cuidar65[0] || null;
            })
        );
    }
}
