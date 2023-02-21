import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Apollo } from 'apollo-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MockModule } from 'ng-mocks';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';
import { UserGroupsComponent } from './user-groups.component';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('UserGroupsComponent', () => {
  let component: UserGroupsComponent;
  let fixture: ComponentFixture<UserGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [UserGroupsComponent],
      providers: [Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
