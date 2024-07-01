import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfesionalService } from 'src/app/services/profesional.service';

@Component({
    selector: 'prestaciones-habilitadas',
    templateUrl: 'prestaciones-habilitadas.html',
    styleUrls:['prestaciones-habilitadas.scss']
})

export class PrestacionesHabilitadasComponent implements OnInit {

    constructor(
        private router: Router,
        public servicioProfesional: ProfesionalService) { }

    ngOnInit(): void {
        this.nuevoAcceso = {};
    }

    public crearNuevoAcceso = false;
    public nuevoAcceso = {};
    public diasSemana = [
        { id: 'lunes', label: 'Lunes' },
        { id: 'martes', label: 'Martes' },
        { id: 'miercoles', label: 'Miércoles' },
        { id: 'jueves', label: 'Jueves' },
        { id: 'viernes', label: 'Viernes' }
    ];

    public diasSelected = [];

    public volver() {
        this.router.navigate(['punto-inicio']);
    }

    public cancelar() {
        this.verNuevoAcceso(false);
    }

    public verNuevoAcceso(value = false) {
        this.crearNuevoAcceso = value;
    }

    public guardarAcceso() {

    }

    public loadProfesionales(event) {
        let listaProfesionales = [];

        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback([]);
        }
    }
}
