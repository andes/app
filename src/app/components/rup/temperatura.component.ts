// 000 - Leandro Lambertucci - LL - 20/02/2017
//---------------------------------------------------------------------------------------------------------------------------------------------------
import {
  IPaciente
} from '../../interfaces/IPaciente';
import {
  Component,
  Output,
  Input,
  EventEmitter,
  OnInit
} from '@angular/core';

@Component({
  selector: 'rup-temperatura',
  templateUrl: 'temperatura.html'
})

export class TemperaturaComponent implements OnInit {

  @Input('datosIngreso') datosIngreso: any;
  @Input('paciente') paciente: IPaciente;
  @Input('tipoPrestacion') tipoPrestacion: any;
  @Input('required') required: Boolean;
  @Output() evtData: EventEmitter < Number > = new EventEmitter < Number > ();

  temperatura: Number = null;
  mensaje: String = null;
  class: String = "";
  data: any = {
    valor: this.temperatura,
   mensaje: {
            class: "",
            texto: ""
        },
  };


  ngOnInit() {
    if (this.datosIngreso) {
      this.temperatura = this.datosIngreso;
    }
  }

  devolverValores() { // agregar validaciones
    this.class = 'outline-danger';
    if (this.temperatura > 38) {
      this.mensaje = 'Fiebre';
    } else {
      this.mensaje = 'Normal';
    }
    this.data.mensaje.class = this.class;
    this.data.mensaje.texto = this.mensaje;
    this.data.valor = this.temperatura;
    this.evtData.emit(this.data);
  }
}
