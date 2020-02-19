import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Novedad } from './../../novedades/mock-data/novedad';
import { NOVEDADES } from '../../novedades/mock-data/mock-novedades';


@Injectable({
  providedIn: 'root'
})
export class NovedadesService {

  constructor() { }

  getNovedades(): Observable<Novedad[]> {
    // TODO: send the message _after_ fetching the heroes
    return of(NOVEDADES);
  }

  getNovedad(id: number | string) {
    return this.getNovedades().pipe(
      // (+) before `id` turns the string into a number
      map((novedades: Novedad[]) => novedades.find(novedad => novedad.id === +id))
    );
  }
}


  // novedades = [
  //   {
  //     titulo: 'Lorem ipsum sonnet',
  //     bajada: 'Esta es la bajada de la nota, un texto que da una primera percepcion al lector',
  //     imagen: 'https://miro.medium.com/max/1600/1*6jHfGiyWLiks_i5iU1tOhw.jpeg',
  //     cuerpo: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.',
  //     categoria: 'aviso',
  //     fechaPublicacion: '',
  //     modulo: 'RUP',
  //     estado: true,
  //   },
  //   {
  //     titulo: 'Titulo de segunda noticia',
  //     bajada: 'Esta es la bajada de la nota, un texto que da una primera percepcion al lector',
  //     imagen: 'https://miro.medium.com/max/1600/1*6jHfGiyWLiks_i5iU1tOhw.jpeg',
  //     cuerpo: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.',
  //     categoria: 'notificacion',
  //     fechaPublicacion: '',
  //     modulo: 'TOP',
  //     estado: true,
  //   },
  //   {
  //     titulo: 'Titulo de primera noticia',
  //     bajada: 'Esta es la bajada de la nota, un texto que da una primera percepcion al lector',
  //     imagen: 'https://miro.medium.com/max/1600/1*6jHfGiyWLiks_i5iU1tOhw.jpeg',
  //     cuerpo: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.',
  //     categoria: 'novedad',
  //     fechaPublicacion: '',
  //     modulo: 'MPI',
  //     estado: true,
  //   },
  // ]

