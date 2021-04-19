import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { flatMap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Auth } from '@andes/auth';
import { CategoriasService } from './categoria.service';

@Injectable({
    providedIn: 'root',
})

export class CertificadoService {
    private Url = '/modules/rup/prestaciones/huds/';
    public expresiones$ = new Observable<any[]>();
    public certificados$: Observable<any[]>;
    constructor(
        private server: Server,
        private auth: Auth,
        private categoriaService: CategoriasService

    ) { }

    getCertificados(id): Observable<any[]> {
        return this.categoriaService.get({}).pipe(
            switchMap((categorias: any) => {
                const categoria = categorias.find(c => c.titulo === 'Certificados');
                return this.server.get(this.Url + id + '?expresion=' + categoria.expresionSnomed);
            }));

    }

    getCertificado(id: number | string, idPaciente) {
        return this.getCertificados(idPaciente).pipe(
            map((certificados) => certificados.find(certificado => certificado.registro.id === id))
        );
    }

    descargar(certificado) {
        const elementoAdjuntos = this.getAdjunto(certificado);
        const url = environment.API + '/modules/rup/store/' +
            elementoAdjuntos.valor.documentos[0].id + '?token=' + this.auth.getToken();
        window.open(url);
    }

    private getAdjunto(certificado) {
        return certificado.registro.registros.find(x => x.nombre === 'documento adjunto');
    }

}
