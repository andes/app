import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-crear-nuevo',
  templateUrl: './crear-nuevo.component.html',
  styleUrls: ['./crear-nuevo.component.css']
})
export class CrearNuevoComponent implements OnInit {



public sistemas: any;

public opciones = [
    { id: 'respiratorio', nombre: 'Respiratorio' },
    { id: 'vacunas', nombre: 'Vacunas' },
    { id: 'gastrointestinal', nombre: 'Gastrointestinal' },
    { id: 'cardiovascular', nombre: 'Cardiovascular' },
    { id: 'genitourinario', nombre: 'Genitourinario' },
    { id: 'antineoplasicos-e-inmunosupresores', nombre: 'Antineoplásicos e inmunosupresores' },
    { id: 'endocrino', nombre: 'Endocrino' },
    { id: 'anticonceptivos', nombre: 'Anticonceptivos' },
    { id: 'anestesicos', nombre: 'Anestésicos' },
    { id: 'emergencias-toxicologicas', nombre: 'Emergencias toxicológicas' },
    { id: 'analgesicos-puros', nombre: 'Analgésicos puros' },
    { id: 'nervioso-central', nombre: 'Nervioso central' },
    { id: 'sanguineo', nombre: 'Sanguíneo' },
    { id: 'contraste-radiologicos', nombre: 'Contraste radiológicos' },
    { id: 'rayos', nombre: 'Rayos' },
    { id: 'antinflamatorios', nombre: 'Antiinflamatorios' },
    { id: 'bloqueantes-neuromusculares', nombre: 'Bloqueantes neuromusculares' },
    { id: 'oftalmologico', nombre: 'Oftalmológico' },
    { id: 'antiinfecciosos', nombre: 'Antiinfecciosos' },
    { id: 'metabolismo', nombre: 'Metabolismo' },
    { id: 'antisepticos-y-desinfectantes', nombre: 'Antisépticos y desinfectantes' }
];




  constructor() { }

  ngOnInit(): void {
  }

}
