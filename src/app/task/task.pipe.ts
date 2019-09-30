import { Pipe, PipeTransform } from '@angular/core';

import Task from '../models/task';
import {parseDate} from "../util/date-helper";

@Pipe({ name: 'filteredTasks' })
export class TasksPipe implements PipeTransform {
  transform(allTask: Task[], data) {
    if (allTask === undefined || allTask === null) {
      return allTask;
    }
    console.log('what is data', data);
    console.log('what is allTask', allTask);
    const { taskDescription, priorityFrom, priorityTo, startDate, endDate, parentTask } = data;
    return allTask.filter(task => {
      return TasksPipe.filterByTaskDescription(task, taskDescription) &&
        TasksPipe.filterByPriorityFrom(task, priorityFrom) && TasksPipe.filterByPriorityTo(task, priorityTo) &&
        TasksPipe.filterByStartDate(task, startDate) && TasksPipe.filterByEndDate(task, endDate) &&
        TasksPipe.filterByParentTask(task, parentTask);
    });
  }

  static filterByStartDate(task, startDate) {
    if (!startDate || typeof startDate !== 'object') {
      return true;
    }
    return parseDate(task.startDate).equals(startDate) || parseDate(task.startDate).after(startDate);
  }

  static filterByEndDate(task, endDate) {
    if (!endDate || typeof endDate !== 'object') {
      return true;
    }
    return parseDate(task.endDate).equals(endDate) || parseDate(task.endDate).before(endDate);
  }

  static filterByTaskDescription(task, desc) {
    if (!desc) {
      return true;
    }
    return ~task.taskDescription.indexOf(desc);
  }

  static filterByPriorityFrom(task, priorityFrom) {
    if (priorityFrom === undefined || priorityFrom === null || priorityFrom === '') {
      return true;
    }
    return priorityFrom <= task.priority;
  }

  static filterByPriorityTo(task, priorityTo) {
    if (priorityTo === undefined || priorityTo === null || priorityTo === '') {
      return true;
    }
    return task.priority <= priorityTo;
  }

  static filterByParentTask(task, parentTask) {
    if (!parentTask || typeof parentTask !== 'object') {
      return true;
    }

    return (task.parentTask && task.parentTask._id) === parentTask.id;
  }
}
