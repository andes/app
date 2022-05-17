import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable()
export class QueriesMappingService extends ResourceBaseHttp {
    protected url = '/modules/queries-mapping';
    constructor(protected server: Server) {
        super(server);
    }
}
