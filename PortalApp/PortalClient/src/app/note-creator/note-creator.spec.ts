import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteCreator } from './note-creator';

describe('NoteCreator', () => {
  let component: NoteCreator;
  let fixture: ComponentFixture<NoteCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteCreator],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteCreator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
