import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposeBox } from './compose-box';

describe('ComposeBox', () => {
  let component: ComposeBox;
  let fixture: ComponentFixture<ComposeBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComposeBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComposeBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
