export type Animation =
  | 'idle'
  | 'run_forward_left'
  | 'run_forward_right'
  | 'run_backward_left'
  | 'run_backward_right'
  | 'run_forward'
  | 'run_backward'
  | 'run_left'
  | 'run_right'
  | 't_pose'
  | 'turn_left_180'
  | 'turn_left_90'
  | 'turn_right_180'
  | 'turn_right_90'
  | 'walk_forward_left'
  | 'walk_forward_right'
  | 'walk_backward_left'
  | 'walk_backward_right'
  | 'walk_forward'
  | 'walk_backward'
  | 'walk_left'
  | 'walk_right'

export interface KeysPressed {
  forward: boolean
  forwardLeft: boolean
  forwardRight: boolean
  backward: boolean
  backwardLeft: boolean
  backwardRight: boolean
  left: boolean
  right: boolean
  invalidDirection: boolean
}
