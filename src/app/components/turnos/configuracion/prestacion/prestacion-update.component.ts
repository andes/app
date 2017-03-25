// import { Plex } from '@andes/plex';
// import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
// import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
// import { Observable } from 'rxjs/Rx';

// import { IPrestacion } from './../../../../interfaces/turnos/IPrestacion';
// import { PrestacionService } from './../../../../services/turnos/prestacion.service';

// @Component({
//     selector: 'prestacion-update',
//     templateUrl: 'prestacion-update.html',
// })

// export class PrestacionUpdateComponent implements OnInit {
//     @Input('selectedPrestacion') prestacionHijo: IPrestacion;

//     @Output()
//     data: EventEmitter<IPrestacion> = new EventEmitter<IPrestacion>();
//     public modelo: any = {};

//     constructor(public plex: Plex, public prestacionService: PrestacionService) { }

//     ngOnInit() {        
//         this.modelo = { nombre: this.prestacionHijo.nombre, descripcion: this.prestacionHijo.descripcion, activo: this.prestacionHijo.activo };
//     }

//     onClick(modelo: IPrestacion) {
//         let estOperation: Observable<IPrestacion>;
//         modelo.id = this.prestacionHijo.id;
//         estOperation = this.prestacionService.put(modelo);
//         estOperation.subscribe(resultado => this.data.emit(resultado));
//     }

//     onCancel() {
//         this.data.emit(null);
//         return false;
//     }
// }