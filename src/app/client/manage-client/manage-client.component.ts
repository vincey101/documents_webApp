import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client } from '@core/domain-classes/client';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { BaseComponent } from 'src/app/base.component';
import { ClientStore } from '../client-store';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-manage-client',
  standalone: true,
  imports: [FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    FeatherModule,
    MatIconModule,
    MatCardModule,
    SharedModule,
  ],
  templateUrl: './manage-client.component.html',
  styleUrl: './manage-client.component.scss'
})
export class ManageClientComponent extends BaseComponent implements OnInit {
  client: Client;
  clientForm: UntypedFormGroup;
  isEditMode = false;

  private fb = inject(UntypedFormBuilder);
  private router = inject(Router);
  private activeRoute = inject(ActivatedRoute);
  public clientStore = inject(ClientStore);

  constructor() {
    super();
    this.subscribeIsAddUpdate();
  }

  ngOnInit(): void {
    this.createUserForm();
    this.sub$.sink = this.activeRoute.data.subscribe(
      (data: { client: Client }) => {
        if (data.client) {
          this.isEditMode = true;
          this.clientForm.patchValue(data.client);
          this.client = data.client;
        }
      });
  }

  createUserForm() {
    this.clientForm = this.fb.group({
      id: [''],
      companyName: ['', [Validators.required]],
      contactPerson: [''],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      address: [''],
    });
  }

  private markFormGroupTouched(formGroup: UntypedFormGroup) {
    (<any>Object).values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  saveClient() {
    if (this.clientForm.valid) {
      const client = this.createBuildObject();
      if (this.isEditMode) {
        this.clientStore.addUpdateClient(client);
      } else {
        this.clientStore.addUpdateClient(client);
      }
    } else {
      this.markFormGroupTouched(this.clientForm);
    }
  }

  subscribeIsAddUpdate() {
    toObservable(this.clientStore.isAddUpdate).subscribe((flag) => {
      if (flag) {
        this.router.navigate(['/client']);
      }
      this.clientStore.resetFlag();
    });
  }

  createBuildObject(): Client {
    const client: Client = {
      id: this.clientForm.get('id').value,
      contactPerson: this.clientForm.get('contactPerson').value,
      email: this.clientForm.get('email').value,
      phoneNumber: this.clientForm.get('phoneNumber').value,
      address: this.clientForm.get('address').value,
      companyName: this.clientForm.get('companyName').value,
    }
    return client;
  }
}
