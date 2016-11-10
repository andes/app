import { ConsultorioService } from './../../services/turnos/consultorio.service';
import { ProfesionalService } from './../../services/profesional.service';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
    templateUrl: 'plantilla.html',
})
export class PlantillaComponent {
    @Output() data: EventEmitter<IPlantilla> = new EventEmitter<IPlantilla>();
    //private form1: FormGroup;
    public modelo : any = {};
    public prueba : any = {};
    public prestaciones : any = [];
    public consultorios : any = [];
    public bloqueActivo : Number = 0;
    public elementoActivo : any = { descripcion: null };
    constructor(private formBuilder: FormBuilder, public plex: PlexService, 
    public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
    public servicioConsultorio: ConsultorioService) { }
    
    ngOnInit() {
        //this.loadConsultorios();
        //console.log(this.consultorios);
        //this.consultorios = [ {_id: "581785cfb1ce346ffc859382", descripcion:"Descripción Consultorio 1",id:"581785cfb1ce346ffc859382",nombre:"Consultorio 1"},{id:"581785cfb1ce346ffc859383",nombre:"Consultorio21"}]
        this.modelo = {
            prestaciones: [{"id":"581792ad3d52685d1ecdaa05", "nombre" : "Cardiología adultos"}],
            profesionales: [{id:"1", nombre:"Juan Perez"}, {id:"2", nombre:"Sonia Martinez"}],
            consultorio: {_id: "581785cfb1ce346ffc859382", descripcion:"Descripción Consultorio 1",id:"581785cfb1ce346ffc859382",nombre:"Consultorio 1"},
            descripcion: "una descripcion",
            horaInicio: Date.now(),
            horaFin: Date.now(),
            bloques: [{
                    horaInicio: Date.now(),
                    horaFin: Date.now(),
                    cantidadTurnos: 10,
                    descripcion: "Bloque 1",
                    prestacion: {id:"2", nombre:"Nefrología"},
                    
                    deldiaAccesoDirecto: 2,
                    programadosAccesoDirecto: 4,
                    
                    deldiaReservado: 4,
                    programadosReservado: 20,
                    
                    programadosAutocitado: 0,

                    pacienteSimultaneos: false,
                    cantidadSimultaneos: 0,
                    citarPorBloque: false
                },
                {
                    horaInicio: Date.now(),
                    horaFin: Date.now(),
                    cantidadTurnos: 20,
                    descripcion: "Bloque 2",
                    prestacion: {id:"2", nombre:"Nefrología"},
                    
                    deldiaAccesoDirecto: 6,
                    programadosAccesoDirecto: 7,
                    
                    deldiaReservado: 15,
                    programadosReservado: 5,
                    
                    programadosAutocitado: 0,

                    pacienteSimultaneos: false,
                    cantidadSimultaneos: 0,
                    citarPorBloque: false
                }
            ]
        }
        this.elementoActivo = this.modelo.bloques[0];
        // for (let i = 0; i < this.modelo.bloques.length; i++){
        //     (<FormArray>this.form1.controls['bloques']).push(this.initBloque());
        // }

        //this.form1.patchValue(this.modelo);
        
        // this.form1.valueChanges.subscribe((value) => {
        //     this.modelo = value;
            
        // });
        
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);       
    }

    loadProfesionales(event) {
        this.servicioProfesional.get().subscribe(event.callback);       
    }

    loadConsultorios(event) {
        this.servicioConsultorio.get().subscribe(event.callback);       
    }

    addBloque() {
    }
    
    activarBloque(indice: number){
        this.bloqueActivo = indice; 
        this.elementoActivo = this.modelo.bloques[indice];
    }

    verificarCantidad(event:any){
        alert(this.elementoActivo.descripcion);
    }
}