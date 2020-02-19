import { Component, OnInit } from '@angular/core';
import { NovedadesService } from './mock-data/novedades.service';

@Component({
  selector: 'novedades',
  templateUrl: './novedades.component.html',
})
export class NovedadesComponent implements OnInit {

  constructor(private novedadesService: NovedadesService) { }


  ngOnInit() {
  }

}
