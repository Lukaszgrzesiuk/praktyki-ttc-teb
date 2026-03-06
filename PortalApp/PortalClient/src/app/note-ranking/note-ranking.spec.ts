import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteRanking } from './note-ranking';

describe('NoteRanking', () => {
  let component: NoteRanking;
  let fixture: ComponentFixture<NoteRanking>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoteRanking],
    }).compileComponents();

    fixture = TestBed.createComponent(NoteRanking);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
