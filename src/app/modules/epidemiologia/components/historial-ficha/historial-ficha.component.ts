import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { FormsHistoryService } from '../../services/forms-history.service';

@Component({
  selector: 'app-historial-ficha',
  templateUrl: './historial-ficha.component.html'
})
export class HistorialFichaComponent implements OnChanges {
  @Input() ficha: any;
  @Output() fichaHistorial = new EventEmitter<any>();

  public historial$: Observable<any>;
  public columns = [
    {
      key: 'fecha',
      label: 'Actualización',
      sorteable: true,
      sort: (a: any, b: any) => a.createdAt.getTime() - b.createdAt.getTime()
    },
    {
      key: 'usuario',
      label: 'Usuario',
      sorteable: false
    },
    {
      key: 'acciones',
      label: 'Acciones',
      sorteable: false
    }
  ];

  constructor(
    private historyService: FormsHistoryService

  ) { }

  ngOnChanges(): void {
    this.historial$ = this.historyService.search({ idFicha: this.ficha.id });
  }

  verFicha(ficha) {
    this.fichaHistorial.emit(ficha);
  }

}
