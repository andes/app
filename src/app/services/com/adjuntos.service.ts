import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class COMAdjuntosService {

    private url = '/modules/com/';

    constructor(private server: Server, public auth: Auth) { }

    get(params) {
        return this.server.get(this.url, { params });
    }

    delete(id) {
        return this.server.delete(this.url + '/' + id);
    }

    upload(file, metadata) {
        return this.server.post(this.url + '/store', { file, metadata });
    }

}
