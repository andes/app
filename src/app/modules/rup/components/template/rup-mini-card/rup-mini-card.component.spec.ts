import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RupMiniCardComponent } from './rup-mini-card.component';

describe('RupMiniCardComponent', () => {
  let component: RupMiniCardComponent;
  let fixture: ComponentFixture<RupMiniCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RupMiniCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RupMiniCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


});
