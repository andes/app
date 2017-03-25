// import { Plex } from '@andes/plex';
// import { Component, EventEmitter, Output, OnInit } from '@angular/core';
// import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
// import { Observable } from 'rxjs/Rx';

// import { IPrestacion } from './../../../../interfaces/turnos/IPrestacion';
// import { PrestacionService } from './../../../../services/turnos/prestacion.service';

// @Component({
//     selector: 'prestacion-create',
//     templateUrl: 'prestacion-create.html',
// })

// export class PrestacionCreateComponent implements OnInit {
//     @Output() data: EventEmitter<IPrestacion> = new EventEmitter<IPrestacion>();
//     public modelo: any = {};

//     constructor(public plex: Plex, public prestacionService: PrestacionService) { }

//     ngOnInit() {
//         this.modelo = { nombre: "", descripcion: "", activo: true };
//     }

//     onClick(modelo: IPrestacion) {
//         let estOperation: Observable<IPrestacion>;

//         estOperation = this.prestacionService.post(modelo);
//         estOperation.subscribe(resultado => this.data.emit(resultado));
//     }

//     onCancel() {
//         this.data.emit(null);
//         return false;
//     }

// }