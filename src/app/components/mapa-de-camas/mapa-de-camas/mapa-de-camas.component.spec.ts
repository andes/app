import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaDeCamasComponent } from './mapa-de-camas.component';

describe('MapaDeCamasComponent', () => {
  let component: MapaDeCamasComponent;
  let fixture: ComponentFixture<MapaDeCamasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapaDeCamasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapaDeCamasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
