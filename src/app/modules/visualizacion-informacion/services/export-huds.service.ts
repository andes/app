import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, saveAs } from '@andes/shared';

@Injectable()
export class ExportHudsService {
    private exportHudsUrl = '/modules/huds/export';

    public pendiente$: Observable<any[]>;
    public hud$ = new Subject<any[]>();

    constructor(private server: Server) {
        this.pendiente$ = this.hud$;
    }

    pendientes(params) {
        return this.server.get(this.exportHudsUrl, { params });
    }

    peticionHuds(data): Observable<any> {
        return this.server.post(this.exportHudsUrl, data, { responseType: 'blob' } as any);
    }

    descargaHuds(params): Observable<any> {
        return this.server.post(this.exportHudsUrl + '/' + params.id, params, { responseType: 'blob' } as any).pipe(
            saveAs(params.name, 'zip')
        );
    }
}
