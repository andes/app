import { Server } from './server.service';
import { Observable } from 'rxjs';

export interface ShowErrorDetail {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
    get?: boolean;
    search?: boolean;
}

/**
 * Implementa las rutas básicas de ResourceBase
 */
export abstract class ResourceBaseHttp<T = any> {
    /**
     * Endpoint del recurso básico
     */
    protected abstract url: string;

    /**
     * Muestra un cartel en caso de error
     */

    protected showError = true;

    /**
     * Permite customizar por ruta el cartel de error;
     */
    protected showErrorDetail: ShowErrorDetail = {};

    constructor(protected server: Server) { }

    save(data): Observable<T> {
        if (!data.id) {
            return this.create(data);
        } else {
            return this.update(data.id, data);
        }
    }

    get(id: string): Observable<T> {
        return this.server.get(`${this.url}/${id}`, { showError: this.mustShowError('get') });
    }

    search(query = {}): Observable<T[]> {
        return this.server.get(this.url, { params: query, showError: this.mustShowError('search') });
    }

    create(body): Observable<T> {
        return this.server.post(this.url, body, { showError: this.mustShowError('create') });
    }

    update(id: string, body): Observable<T> {
        return this.server.patch(`${this.url}/${id}`, body, { showError: this.mustShowError('update') });
    }

    delete(id: string): Observable<T> {
        return this.server.delete(`${this.url}/${id}`, { showError: this.mustShowError('delete') });
    }

    private mustShowError(type: string) {
        if (this.showErrorDetail[type] !== undefined) {
            return this.showErrorDetail[type];
        }
        return this.showError;
    }

    public queryDateParams(desde: Date, hasta: Date, diaEntero: Boolean = true) {
        let desdeF;
        let hastaF;

        if (diaEntero) {
            desdeF = moment(desde).startOf('day').format('YYYY-MM-DD HH:mm:ss');
            hastaF = moment(hasta).endOf('day').format('YYYY-MM-DD HH:mm:ss');
        } else {
            desdeF = moment(desde).format('YYYY-MM-DD HH:mm:ss');
            hastaF = moment(hasta).format('YYYY-MM-DD HH:mm:ss');
        }
        if (desde) {
            if (hasta) {
                return `${desdeF}|${hastaF}`;
            } else {
                return `>${desdeF}`;
            }
        } else {
            if (hasta) {
                return `<${hastaF}`;
            }
        }
        return undefined;
    }

}
