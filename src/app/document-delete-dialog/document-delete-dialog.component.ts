import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherIconsModule } from '@shared/feather-icons.module';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    TranslateModule,
    MatButtonModule,
    FeatherIconsModule,
  ],
  selector: 'app-document-delete-dialog',
  templateUrl: './document-delete-dialog.component.html',
  styleUrls: ['./document-delete-dialog.component.scss'],
})
export class DocumentDeleteDialogComponent {
  constructor(public dialogRef: MatDialogRef<DocumentDeleteDialogComponent>) {}

  clickHandler(data): void {
    this.dialogRef.close(data);
  }
}
