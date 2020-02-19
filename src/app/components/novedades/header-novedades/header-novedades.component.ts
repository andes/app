import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// Mock-data
import { NovedadesService } from '../mock-data/novedades.service';
import { Novedad } from '../mock-data/novedad';

@Component({
  selector: 'header-novedades',
  templateUrl: './header-novedades.component.html'
})

export class HeaderNovedadesComponent implements OnInit {

  novedades$: Observable<Novedad[]>;
  selectedId: number;

  constructor(
    private novedadesService: NovedadesService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.novedades$ = this.route.paramMap.pipe(
      switchMap(params => {
        this.selectedId = +params.get('id');
        return this.novedadesService.getNovedades();
      })
    );

  }
}
