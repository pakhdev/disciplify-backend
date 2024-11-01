import { TaskTypeStatistics } from "./task-type-statistics.interface";

export interface PeriodStatistics {
  mandatoryTasks: TaskTypeStatistics;
  optionalTasks: TaskTypeStatistics;
}
