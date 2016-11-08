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
    private form1: FormGroup;
    public modelo : any;
    public ejemplo : any;
    public bloqueActivo : Number = 0;
    public elementoActivo : any;
    constructor(private formBuilder: FormBuilder, public plex: PlexService, 
    public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
    public servicioConsultorio: ConsultorioService) { }
    
    ngOnInit() {
        // this.form1 = this.formBuilder.group({
        //     deldiaAccesoDirecto: false,
        //     deldiaReservado: false,
        //     deldiaAutocitado: false,
        //     programadosAccesoDirecto:false,
        //     programadosReservado: false,
        //     programadosAutocitado: false,
        //     prestacion: null
        // });

        this.form1 = this.formBuilder.group({
           prestaciones: [],
           profesionales: [],
           consultorio: {id: null, nombre: null },
           descripcion: [''],
           bloques: this.formBuilder.array(
               [
               this.formBuilder.group({
                   descripcion: [''],
               })
            ]
           )
        });

        this.ejemplo = {
            prestaciones: [{"id":"581792ad3d52685d1ecdaa05", "nombre" : "Cardiología adultos"}],
            profesionales: [{id:"1", nombre:"Juan Perez"}, {id:"2", nombre:"Sonia Martinez"}],
            consultorio: {id:"581785cfb1ce346ffc859382",nombre:"Consultorio 1"},
            descripcion: "una descripcion",
            bloques: [{
                    horaInicio: Date.now(),
                    horaFin: Date.now(),
                    cantidadTurnos: 10,
                    descripcion: "lalala",
                    prestacion: {id:"2", nombre:"Nefrología"},
                    
                    deldiaAccesoDirecto: 2,
                    deldiaReservado: 4,
                    programadosAccesoDirecto: 4,
                    programadosReservado: 0,
                    programadosAutocitado: 0,

                    pacienteSimultaneos: false,
                    cantidadSimultaneos: 0,
                    citarPorBloque: false
                },
                {
                    horaInicio: Date.now(),
                    horaFin: Date.now(),
                    cantidadTurnos: 20,
                    descripcion: "prueba 2",
                    prestacion: {id:"2", nombre:"Nefrología"},
                    
                    deldiaAccesoDirecto: 2,
                    deldiaReservado: 4,
                    programadosAccesoDirecto: 4,
                    programadosReservado: 0,
                    programadosAutocitado: 0,

                    pacienteSimultaneos: false,
                    cantidadSimultaneos: 0,
                    citarPorBloque: false
                }
            ]
        }

        this.form1.patchValue(this.ejemplo, false);
        this.form1.valueChanges.subscribe((value) => {
            this.modelo = value;
            //alert(this.modelo.prestaciones[0].nombre);            
            // this.servicioConfig.get(this.modelo2.id)
            // .subscribe(
            // configuraciones => this.configuraciones = configuraciones, //Bind to view
            // err => {
            //     if (err) {
            //         console.log(err);
            //     }
            // });
        });
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
        this.elementoActivo = this.ejemplo.bloques[indice];
    }
}