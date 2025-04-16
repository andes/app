import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class ECLQueriesService extends ResourceBaseHttp {
    protected url = '/core/tm/ECLQueries';

    constructor(protected server: Server) {
        super(server);
    }
}
