import {Component, OnInit, ViewChild} from '@angular/core';
import TaskService from "../../services/task.service";
import {FormBuilder, Validators} from "@angular/forms";
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import {NgbTypeahead, NgbDateStruct} from "@ng-bootstrap/ng-bootstrap";
import * as moment from 'moment';
import Task from '../../models/task';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {merge, Observable, Subject} from "rxjs";
import {Router} from "@angular/router";
import {formatStartDate} from "../../util/date-helper";
import {fetchErrorMessage, getError} from "../../util/error-messages";
import {parentTaskValidator} from "../../validators/parent-task.directive";

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent implements OnInit {
  faCalendar = faCalendarAlt;
  tasks: Task[];
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  addTaskForm = this.fb.group({
    taskDescription: ['', Validators.required],
    priority: ['0', Validators.required],
    parentTask: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  constructor(private taskService: TaskService,
              private router: Router,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.getTasks();
  }

  getTasks(): void {
    this.taskService.getTasks().subscribe(data => {
      if (data) {
        this.tasks = data["data"].map(t => {
          const id = t.id;
          const {taskDescription, priority, startDate, endDate, parentTask} = t.attributes;
          return {id, taskDescription, priority, startDate, endDate, parentTask};
        });
        this.addTaskForm.get('parentTask').setValidators(parentTaskValidator(this.tasks));
      }
    });
  }

  errors(formName: string) {
    const field = this.addTaskForm.get(formName);

    if ((field.touched || field.dirty) && field.invalid) {
      return fetchErrorMessage(field.errors);
    }

    return null;
  }

  onSubmit() {
    const { taskDescription, priority, parentTask, startDate, endDate } = this.addTaskForm.value;
    let startingDate = formatStartDate(startDate);
    let endingDate = formatStartDate(endDate);
    const parentTaskId = parentTask ? parentTask.id : null;
    this.taskService.addTask({ taskDescription, priority, parentTask: parentTaskId, startDate: startingDate, endDate: endingDate  } as Task)
      .subscribe(response => {
        console.log('what is response', response);
        this.router.navigate(['/tasks']);
    });
  }

  onReset() {
    this.addTaskForm.patchValue({
      taskDescription: '',
      priority: 0,
      parentTask: '',
      startDate: '',
      endDate: ''
    });
  }

  searchTask = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.tasks
        : this.tasks.filter(task => ~task.taskDescription.indexOf(term))
      )));
  };

  searchTaskFormatter = (result: Task) => result.taskDescription;
}
