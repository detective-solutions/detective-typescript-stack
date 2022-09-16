import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockModule } from 'ng-mocks';
import { SubscriptionsComponent } from './subscriptions.component';
import { TableModule } from '@detective.solutions/frontend/detective-client/ui';

xdescribe('SubscriptionsComponent', () => {
  let component: SubscriptionsComponent;
  let fixture: ComponentFixture<SubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockModule(TableModule), SubscriptionsComponent],
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
