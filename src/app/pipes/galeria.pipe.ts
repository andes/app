import { Pipe, PipeTransform } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdjuntosService } from '../modules/rup/services/adjuntos.service';

@Pipe({ name: 'galeria' })
export class GaleriaPipe implements PipeTransform {
    constructor(
        private adjuntosService: AdjuntosService
    ) { }

    transform(archivos: any[]): Observable<any[]> {
        return combineLatest([
            of(archivos),
            this.adjuntosService.token$
        ]).pipe(
            map(([files, tokenResponse]) => {
                return files.map((doc) => {
                    return {
                        ...doc,
                        url: this.adjuntosService.createUrl('drive', doc, tokenResponse.token)
                    };
                });
            })
        );
    }
}
