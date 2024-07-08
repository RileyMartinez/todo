import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoListsComponent } from './todo-lists.component';

describe('TodoListsComponent', () => {
  let component: TodoListsComponent;
  let fixture: ComponentFixture<TodoListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodoListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
