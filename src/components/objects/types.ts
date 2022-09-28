export type AnimationName =
  | 'idle'
  | 'run_forward'
  | 'run_backward'
  | 'run_left'
  | 'run_right'
  | 't_pose'
  | 'turn_left_180'
  | 'turn_left_90'
  | 'turn_right_180'
  | 'turn_right_90'
  | 'walk_forward'
  | 'walk_backward'
  | 'walk_left'
  | 'walk_right'

export interface Animation {
  name: AnimationName,
  moveSpeed: number,
}
