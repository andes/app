import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-seccion',
  templateUrl: './seccion.component.html'
})
export class SeccionComponent implements OnInit {
  @Input() seccion
  @Output() onSave = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    console.log('seccion', this.seccion);
  }
  save() {
    this.onSave.emit('termino');
  }
}
