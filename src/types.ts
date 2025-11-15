export type Todo = {
  id: string;
  name: string;
  isDone: boolean;
  priority: number;
  deadline: Date | null;
  x: number; // 位置 (X座標)
  y: number; // 位置 (Y座標)
  // ◀◀◀ width と height を削除
  rotate: number; // 角度
};