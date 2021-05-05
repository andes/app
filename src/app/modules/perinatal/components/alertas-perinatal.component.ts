import { CarnetPerinatalService } from './../services/carnet-perinatal.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'alertas-perinatal',
  templateUrl: './alertas-perinatal.component.html'
})
export class AlertasPerinatalComponent implements OnInit {
  public listado$: Observable<any[]>;

  constructor(private carnetPerinatalService: CarnetPerinatalService) { }

  ngOnInit(): void {
    this.listado$ = this.carnetPerinatalService.carnetsFiltrados$.pipe(
      map(resp => {
        return resp.filter(item => moment().diff(moment(item.fechaProximoControl), 'days') >= 1);
      })
    );
  }

}
