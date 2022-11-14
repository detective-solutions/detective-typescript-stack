import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockModule, MockService } from 'ng-mocks';

import { Apollo } from 'apollo-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SubscriptionService } from '../../services';
import { SubscriptionsComponent } from './subscriptions.component';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';

const materialModules = [MatButtonModule, MatIconModule];

xdescribe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MockModule(TableModule), materialModules],
      declarations: [SubscriptionsComponent],
      providers: [MockService(SubscriptionService), Apollo],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
