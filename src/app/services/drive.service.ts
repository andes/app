import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class DriveService {

    private driveUrl = '/drive';

    constructor(private server: Server) {
    }

    // Elimina el archivo correspondiente del drive
    deleteFile(id): Observable<any> {
        return this.server.delete(`${this.driveUrl}/${id}`);
    }
}
