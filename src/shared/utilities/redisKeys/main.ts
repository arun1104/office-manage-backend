
import { REDIS_KEYS } from "@constants";
export class FormatRedisKeys {
  static activeTaskList({ branchId }): string {
    return `${branchId}-${REDIS_KEYS.REDIS_TASK_CONFIG_KEYS.activeTaskList}`;
  }

  static taskPeriods({ branchId, taskId }): string {
    return `${branchId}-${taskId}-${REDIS_KEYS.REDIS_TASK_CONFIG_KEYS.taskPeriodicityList}`;
  }
}