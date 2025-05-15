import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Action } from '@core/domain-classes/action';
import { Page } from '@core/domain-classes/page';
import { Role } from '@core/domain-classes/role';
import { BaseComponent } from 'src/app/base.component';
import { TranslationService } from '@core/services/translation.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-manage-role-presentation',
  templateUrl: './manage-role-presentation.component.html',
  styleUrls: ['./manage-role-presentation.component.css'],
})
export class ManageRolePresentationComponent extends BaseComponent {
  @Input() pages: Page[];
  @Input() role: Role;
  @Output() onManageRoleAction: EventEmitter<Role> = new EventEmitter<Role>();
  step = 0;
  constructor(public translationService: TranslationService) {
    super();
  }

  onPageSelect(event: MatCheckboxChange, page: Page) {
    if (event.checked) {
      page.pageActions.forEach((action) => {
        if (!this.checkPermission(action.id)) {
          this.role.roleClaims.push({
            roleId: this.role.id,
            claimType: action.code,
            claimValue: '',
            actionId: action.id,
          });
        }
      });
    } else {
      const actions = page.pageActions?.map((c) => c.id);
      this.role.roleClaims = this.role.roleClaims.filter(
        (c) => actions.indexOf(c.actionId) < 0
      );
    }
  }

  selecetAll(event: MatCheckboxChange) {
    if (event.checked) {
      this.pages.forEach((page) => {
        page.pageActions.forEach((action) => {
          if (!this.checkPermission(action.id)) {
            this.role.roleClaims.push({
              roleId: this.role.id,
              claimType: action.code,
              claimValue: '',
              actionId: action.id,
            });
          }
        });
      });
    } else {
      this.role.roleClaims = [];
    }
  }

  checkPermission(actionId: string): boolean {
    const pageAction = this.role.roleClaims.find(
      (c) => c.actionId === actionId
    );
    if (pageAction) {
      return true;
    } else {
      return false;
    }
  }

  onPermissionChange(flag: MatSlideToggleChange, page: Page, action: Action) {
    if (flag.checked) {
      this.role.roleClaims.push({
        roleId: this.role.id,
        claimType: action.code,
        claimValue: '',
        actionId: action.id,
      });
    } else {
      const roleClaimToRemove = this.role.roleClaims.find(
        (c) => c.actionId === action.id
      );
      const index = this.role.roleClaims.indexOf(roleClaimToRemove, 0);
      if (index > -1) {
        this.role.roleClaims.splice(index, 1);
      }
    }
  }

  saveRole(): void {
    this.onManageRoleAction.emit(this.role);
  }
}
