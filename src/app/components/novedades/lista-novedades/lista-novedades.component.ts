import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// Mock-data
import { NovedadesService } from '../mock-data/novedades.service';
import { Novedad } from '../mock-data/novedad';


@Component({
  selector: 'lista-novedades',
  templateUrl: './lista-novedades.component.html',
})
export class ListaNovedadesComponent implements OnInit {
  novedades$: Observable<Novedad[]>;
  selectedId: number;

  constructor(
    private novedadesService: NovedadesService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.novedades$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = +params.get('id');
        return this.novedadesService.getNovedades();
      })
    );

  }

  verDetalleNovedad() {
    this.router.navigate(['novedades']);
  }

}
