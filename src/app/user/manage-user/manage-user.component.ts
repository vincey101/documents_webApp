import { Component, OnInit, inject } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '@core/domain-classes/role';
import { User } from '@core/domain-classes/user';
import { CommonService } from '@core/services/common.service';
import { TranslationService } from '@core/services/translation.service';
import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from 'src/app/base.component';
import { UserService } from '../user.service';
import { CategoryStore } from 'src/app/category/store/category-store';
import { PositionStore } from 'src/app/position/store/position-store';
import { Direction } from '@angular/cdk/bidi';

@Component({
  selector: 'app-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss'],
})
export class ManageUserComponent extends BaseComponent implements OnInit {
  user: User;
  userForm: UntypedFormGroup;
  roleList: Role[];
  isEditMode = false;
  direction: Direction;
  categoryStore = inject(CategoryStore);
  positionStore = inject(PositionStore);

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private userService: UserService,
    private toastrService: ToastrService,
    private commonService: CommonService,
    private translationService: TranslationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.createUserForm();
    this.sub$.sink = this.activeRoute.data.subscribe((data: { user: User }) => {
      if (data.user) {
        this.isEditMode = true;
        const userFormData = {
          ...data.user,
          department: data.user.categoryId, 
          position: data.user.positionId
        };
        this.userForm.patchValue(userFormData);
        this.user = data.user;
        this.userForm.get('email').disable();
      } else {
        this.userForm
          .get('password')
          .setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm
          .get('confirmPassword')
          .setValidators([Validators.required]);
      }
    });
    this.getRoles();
    this.categoryStore.loadByCategory();
    this.positionStore.loadByPosition();
  }

  createUserForm() {
    this.userForm = this.fb.group(
      {
        id: [''],
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        department: ['', [Validators.required]],
        position: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: ['', [Validators.required]],
        password: [''],
        confirmPassword: [''],
        selectedRoles: [],
      },
      {
        validator: this.checkPasswords,
      }
    );
  }

  checkPasswords(group: UntypedFormGroup) {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notSame: true };
  }

  saveUser() {
    if (this.userForm.valid) {
      const user = this.createBuildObject();
      if (this.isEditMode) {
        this.sub$.sink = this.userService.updateUser(user).subscribe(() => {
          this.toastrService.success(
            this.translationService.getValue('USER_UPDATED_SUCCESSFULLY')
          );
          this.router.navigate(['/users']);
        });
      } else {
        this.sub$.sink = this.userService.addUser(user).subscribe(() => {
          this.toastrService.success(
            this.translationService.getValue('USER_CREATED_SUCCESSFULLY')
          );
          this.router.navigate(['/users']);
        });
      }
    } else {
      this.toastrService.error(
        this.translationService.getValue('PLEASE_ENTER_PROPER_DATA')
      );
    }
  }

  createBuildObject(): User {
    const user: User = {
      id: this.userForm.get('id').value,
      firstName: this.userForm.get('firstName').value,
      lastName: this.userForm.get('lastName').value,
      categoryId: this.userForm.get('department').value,
      positionId: this.userForm.get('position').value,
      email: this.userForm.get('email').value,
      phoneNumber: this.userForm.get('phoneNumber').value,
      password: this.userForm.get('password').value,
      userName: this.userForm.get('email').value,
      roleIds: this.getSelectedRoles(),
    };
    return user;
  }

  getSelectedRoles() {
    const roles = this.userForm.get('selectedRoles').value ?? [];
    return roles.map((role) => {
      return role.id;
    });
  }

  getRoles() {
    this.sub$.sink = this.commonService
      .getRolesForDropdown()
      .subscribe((roles: Role[]) => {
        this.roleList = roles;
        if (this.isEditMode) {
          const selectedRoleIds = this.user.userRoles.map((c) => c.roleId);
          const selectedRoles = this.roleList.filter(
            (c) => selectedRoleIds.indexOf(c.id) > -1
          );

          this.userForm.get('selectedRoles').setValue(selectedRoles);
        }
      });
  }
}
