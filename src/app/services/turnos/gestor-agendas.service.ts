import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { IAgenda } from './../../interfaces/turnos/IAgenda';

@Injectable()
export class GestorAgendasService {

    // Observable string sources
    //   private missionAnnouncedSource = new Subject<string>();
    private agendas = new Subject<IAgenda>();

    // Observable string streams
    //   missionAnnounced$ = this.missionAnnouncedSource.asObservable();
    agendas$ = this.agendas.asObservable();

    // Service message commands
    announceMission(agenda: IAgenda) {
        debugger;
        this.agendas.next(agenda);
    }

}