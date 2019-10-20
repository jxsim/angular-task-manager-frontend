import {Component, OnInit, ViewChild} from '@angular/core';
import Task from '../models/task';
import TaskService from "../services/task.service";
import {FormBuilder, Validators} from "@angular/forms";
import {merge, Observable, pipe, Subject} from "rxjs";
import {faCalendarAlt} from "@fortawesome/free-regular-svg-icons";
import {NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {debounceTime, distinctUntilChanged, filter, map} from "rxjs/operators";

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  faCalendar = faCalendarAlt;
  @ViewChild('instance', {static: true}) instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  tasks: Task[];
  searchTaskForm = this.fb.group({
    taskDescription: [''],
    parentTask: [''],
    priorityFrom: [''],
    priorityTo: [''],
    startDate: [''],
    endDate: [''],
  });

  constructor(private taskService: TaskService,
              private fb: FormBuilder) { }

  ngOnInit() {
    this.getTasks();
  }

  getTasks(): void {
    console.log('getTasks');
    this.taskService.getTasks().subscribe(data => {
      if (data) {
        this.tasks = data["data"].map(t => {
          const id = t.id;
          const {taskDescription, priority, startDate, endDate, parentTask, isEnded} = t.attributes;
          return {id, taskDescription, priority, startDate, endDate, parentTask, isEnded};
        });
      }
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

  endTask(id: string): void {
    console.log('what is id', id);
    this.taskService.endTask(id).subscribe(res => {
      if (res) {
        this.getTasks();
      }
    });
  }
}
