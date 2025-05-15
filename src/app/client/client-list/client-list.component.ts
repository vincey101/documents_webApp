import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { TranslationService } from '@core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { BaseComponent } from 'src/app/base.component';
import { ClientStore } from '../client-store';
import { Client } from '@core/domain-classes/client';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [FormsModule,
      TranslateModule,
      CommonModule,
      RouterModule,
      MatButtonModule,
      ReactiveFormsModule,
      FeatherModule,
      MatIconModule,
      MatCardModule,
      SharedModule,
      MatFormFieldModule,
      MatTableModule,
      MatInputModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss'
})
export class ClientListComponent extends BaseComponent implements OnInit {

  clients: Client[] = [];
  displayedColumns: string[] = ['action', 'companyName','contactPerson', 'email','phoneNumber'];

  public clientStore = inject(ClientStore);
  private commonDialogService = inject(CommonDialogService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
  }

  deleteClient(client: Client) {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(`${this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} ${client.companyName}`)
      .subscribe((isTrue: boolean) => {
        if (isTrue) {
          this.clientStore.deleteClientById(client.id);
        }
      });
  }

  refresh() {
    this.clientStore.loadClients();
  }
}
