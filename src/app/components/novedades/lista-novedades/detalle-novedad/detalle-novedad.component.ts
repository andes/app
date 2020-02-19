import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { NovedadesService } from '../../mock-data/novedades.service';
import { Novedad } from '../../mock-data/novedad';

@Component({
  selector: 'detalle-novedad',
  templateUrl: './detalle-novedad.component.html',
})
export class DetalleNovedadComponent implements OnInit {
  novedad$: Observable<Novedad>;

  constructor(
    private novedadesService: NovedadesService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.novedad$ = this.route.paramMap.pipe(
      switchMap((params: ParamMap) =>
        this.novedadesService.getNovedad(params.get('id')))
    );
  }

  gotoHeroes(novedad: Novedad) {
    let novedadId = novedad ? novedad.id : null;
    this.router.navigate(['/novedades', { id: novedadId }]);
  }
}
