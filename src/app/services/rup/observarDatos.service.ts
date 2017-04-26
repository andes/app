import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class ObservarDatosService {
  private valores = new Map<string, Subject<string>>();

  public getDato$(key: string) {
    let dataSource = new Subject<string>();
    if (this.valores.has(key)) {
      dataSource = this.valores.get(key);
    } else {
      this.valores.set(key, dataSource);
    }
    return dataSource.asObservable();
  }

  public actualizarDatos(datos, key) {
    let dataSource = new Subject<string>();
    if (this.valores.has(key)) {
      dataSource = this.valores.get(key);
    }
    dataSource.next(datos);
    this.valores.set(key, dataSource);
  }

};
