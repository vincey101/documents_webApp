import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRequestListComponent } from './file-request-list.component';

describe('FileRequestListComponent', () => {
  let component: FileRequestListComponent;
  let fixture: ComponentFixture<FileRequestListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileRequestListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileRequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
