import {Component, OnInit, ViewChild} from '@angular/core';
import Task from '../../models/task';
import TaskService from "../../services/task.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgbDate, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {faCalendarAlt} from "@fortawesome/free-regular-svg-icons";
import {merge, Observable, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, map, tap} from "rxjs/operators";
import {FormBuilder, Validators} from "@angular/forms";
import {formatStartDate, parseDate} from "../../util/date-helper";
import {parentTaskValidator} from "../../validators/parent-task.directive";
import {fetchErrorMessage, getError} from "../../util/error-messages";

@Component({
  selector: 'app-update-task',
  templateUrl: './update-task.component.html',
  styleUrls: ['./update-task.component.css']
})
export class UpdateTaskComponent implements OnInit {
  faCalendar = faCalendarAlt;
  task: Task;
  tasks: Task[];
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  editTaskForm = this.fb.group({
    id: [''],
    taskDescription: ['', Validators.required],
    priority: ['0', Validators.required],
    parentTask: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
  });

  constructor(private route: ActivatedRoute,
              private router: Router,
              private taskService: TaskService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      this.getTask(routeParams.id);
    });
  }

  getTask(taskId: string): void {
    this.taskService.getTask(taskId).subscribe(res => {
      if (res) {
        const { id, attributes } = res["data"];
        const { taskDescription, priority, parentTask, startDate, endDate } = attributes;
        this.editTaskForm.setValue({ id, taskDescription, priority, parentTask: parentTask || {},
          startDate: parseDate(startDate), endDate: parseDate(endDate) });
        this.getTasks();
      }
    });
  }

  getTasks(): void {
    this.taskService.getTasks().subscribe(data => {
      if (data) {
        this.tasks = data["data"].filter(t => {
          return t.id !== this.editTaskForm.value.id
        }).map(t => {
          const id = t.id;
          const {taskDescription, priority, startDate, endDate, parentTask} = t.attributes;
          return {id, taskDescription, priority, startDate, endDate, parentTask};
        });
        this.editTaskForm.get('parentTask').setValidators(parentTaskValidator(this.tasks));
      }
    });
  }

  errors(formName: string) {
    const field = this.editTaskForm.get(formName);

    if ((field.touched || field.dirty) && field.invalid) {
      return fetchErrorMessage(field.errors);
    }

    return null;
  }

  onSubmit() {
    const { id, taskDescription, priority, parentTask, startDate, endDate } = this.editTaskForm.value;
    let startingDate = formatStartDate(startDate);
    let endingDate = formatStartDate(endDate);
    const parentTaskId = parentTask ? parentTask.id : null;
    this.taskService.updateTask({ id, taskDescription, priority, parentTask: parentTaskId, startDate: startingDate, endDate: endingDate } as Task)
      .subscribe(response => {
        this.router.navigate(['/tasks']);
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
