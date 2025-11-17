import React, { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFaceGrinWide,
  faTrash,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { initTodos } from "./initTodos";
import { v4 as uuid } from "uuid";
import Draggable, { type DraggableEvent, type DraggableData } from "react-draggable";
import type { Todo } from "./types";

const getPriorityColor = (priority: number): string => {
  switch (priority) {
    case 1:
      return "bg-red-300";
    case 2:
      return "bg-yellow-200";
    case 3:
      return "bg-green-200";
    case 4:
      return "bg-blue-200";
    default:
      return "bg-gray-200";
  }
};

type DraggableTodoItemProps = {
  todo: Todo;
  onDragStart: (id: string) => void;
  onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
  onToggleDone: (id: string) => void;
  zIndex: number;
};

const DraggableTodoItem = ({
  todo,
  onDragStart,
  onDragStop,
  onToggleDone,
  zIndex,
}: DraggableTodoItemProps) => {
  const nodeRef = useRef(null);

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    onDragStop(todo.id, e, data);
  };

  const now = new Date();
  const isOverdue = todo.deadline && todo.deadline < now && !todo.isDone;

  return (
    <Draggable
      bounds="parent"
      nodeRef={nodeRef}
      position={{ x: todo.x, y: todo.y }}
      onStart={() => onDragStart(todo.id)}
      onStop={handleDragStop}
    >
      {/*1. 位置制御用の外枠*/}
      <div
        ref={nodeRef}
        className="absolute cursor-move w-64 h-48"
        style={{
          zIndex: zIndex,
        }}
      >
        {/*2. 見た目と回転用の内枠*/}
        <div
          className={twMerge(
            "relative w-full h-full rounded-md border border-gray-400 shadow-lg box-border",
            "flex flex-col",
            getPriorityColor(todo.priority),
            todo.isDone && "bg-gray-300 opacity-70 line-through grayscale",
            isOverdue && "border-2 border-orange-600"
          )}
          style={{
            transform: `rotate(${todo.rotate}deg)`,
          }}
        >
          {/*3. 実際にスクロールするコンテンツエリア */}
          <div className="flex-1 overflow-auto p-3">
            {/*コンテンツ*/}
            {todo.isDone && (
              <div className="mb-2 rounded bg-gray-500 px-2 py-0.5 text-center text-xs text-white">
                <FontAwesomeIcon icon={faFaceGrinWide} className="mr-1.5" />
                完了済み
              </div>
            )}

            {isOverdue && (
              <div className="mb-2 rounded bg-orange-500 px-2 py-0.5 text-center text-xs text-white">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1.5" />
                期限切れ
              </div>
            )}

            <div className="flex flex-row items-center text-slate-800">
              <input
                type="checkbox"
                checked={todo.isDone}
                onChange={() => onToggleDone(todo.id)}
                onMouseDown={(e) => e.stopPropagation()}
                className="mr-2 h-5 w-5 flex-shrink-0"
              />
              <div
                className={twMerge(
                  "text-lg font-bold",
                  todo.isDone && "line-through decoration-2"
                )}
              >
                {todo.name}
              </div>
              <div className="ml-auto font-mono text-lg text-orange-600">
                {num2star(todo.priority)}
              </div>
            </div>

            {todo.deadline && (
              <div className="mt-2 flex items-center text-sm text-slate-600">
                <FontAwesomeIcon
                  icon={faClock}
                  flip="horizontal"
                  className="mr-1.5"
                />
                <div className={twMerge(todo.isDone && "line-through")}>
                  期限: {dayjs(todo.deadline).format("YYYY年M月D日 H時m分")}
                </div>
              </div>
            )}

            {/*説明表示 */}
            {todo.description && (
              <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap break-words">
                {todo.description}
              </div>
            )}
            {/*コンテンツ終*/}
          </div>
        </div>
      </div>
    </Draggable>
  );
};

type TodoListProps = {
  todos: Todo[];
  zIndices: Record<string, number>;
  onDragStart: (id: string) => void;
  onDragStop: (id: string, e: DraggableEvent, data: DraggableData) => void;
  onToggleDone: (id: string) => void;
};

const TodoList = (props: TodoListProps) => {
  const { todos, zIndices, onDragStart, onDragStop, onToggleDone } = props;

  return (
    <div className="relative h-full w-full"> 
      {todos.length === 0 && (
        <div className="text-center text-gray-500 pt-10">
          登録されているタスクはありません。
        </div>
      )}
      {todos.map((todo) => {
        const zIndex = zIndices[todo.id] || 1;

        return (
          <DraggableTodoItem
            key={todo.id}
            todo={todo}
            onDragStart={onDragStart}
            onDragStop={onDragStop}
            onToggleDone={onToggleDone}
            zIndex={zIndex}
          />
        );
      })}
    </div>
  );
};

const num2star = (n: number): string => "★".repeat(4 - n);

const App = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      const parsed = JSON.parse(savedTodos) as Todo[];
      return parsed.map((todo) => ({
        ...todo,
        deadline: todo.deadline ? new Date(todo.deadline) : null,
        description: todo.description || "",
      }));
    } else {
      return initTodos.map((todo, index) => ({
        ...todo,
        x: (index * 60) % 500 + 30,
        y: Math.floor(index / 8) * 70 + 30,
        rotate: Math.random() * 10 - 5,
        description: todo.description || "",
      }));
    }
  });

  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState(2);
  const [deadlineInput, setDeadlineInput] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const trashAreaRef = useRef<HTMLDivElement>(null);

  const [zIndices, setZIndices] = useState<Record<string, number>>({});
  const [zCounter, setZCounter] = useState(1);

  useEffect(() => {
    setZIndices(prev => {
      const newZIndices: Record<string, number> = {};
      let maxZ = 0;
      todos.forEach((todo, index) => {
        const z = prev[todo.id] || index + 1;
        newZIndices[todo.id] = z;
        maxZ = Math.max(maxZ, z);
      });
      setZCounter(maxZ + 1);
      return newZIndices;
    });
  }, [todos]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName === "") return;
    const newRotate = Math.random() * 10 - 5;
    const newX = Math.random() * 300 + 50;
    const newY = Math.random() * 200 + 50;
    const newDeadline = deadlineInput === "" ? null : new Date(deadlineInput);

    const newTask: Todo = {
      id: uuid(),
      name: taskName,
      isDone: false,
      priority: priority,
      deadline: newDeadline,
      description: description,
      x: newX,
      y: newY,
      rotate: newRotate,
    };
    setTodos([...todos, newTask]);
    setTaskName("");
    setPriority(2);
    setDeadlineInput("");
    setDescription("");
  };

  const handleDragStart = (id: string) => {
    let newZ = zCounter + 1;
    
    if (newZ > 19) {
      const sortedIds = Object.keys(zIndices).sort((a, b) => (zIndices[a] || 0) - (zIndices[b] || 0));
      const newZIndices: Record<string, number> = {};
      sortedIds.forEach((key, index) => {
        newZIndices[key] = index + 1;
      });
      newZ = sortedIds.length + 1;
      newZIndices[id] = newZ;
      setZIndices(newZIndices);
      setZCounter(newZ);
    } else {
      setZIndices(prev => ({ ...prev, [id]: newZ }));
      setZCounter(newZ);
    }
    
    setIsDragging(true);
  };

  const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);

    if (!trashAreaRef.current) return;
    const trashRect = trashAreaRef.current.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ((e as TouchEvent).changedTouches) {
      clientX = (e as TouchEvent).changedTouches[0].clientX;
      clientY = (e as TouchEvent).changedTouches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    const isOverTrash =
      clientX >= trashRect.left &&
      clientX <= trashRect.right &&
      clientY >= trashRect.top &&
      clientY <= trashRect.bottom;

    if (isOverTrash) {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } else {
      const newRotate = Math.random() * 20 - 10;

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id
            ? { ...todo, x: data.x, y: data.y, rotate: newRotate }
            : todo
        )
      );
    }
  };

  const handleToggleDone = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      )
    );
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-fixed bg-center overflow-hidden flex flex-col"
    >
      <h1 className="mb-4 text-center text-3xl font-bold text-gray-700 pt-4 relative z-10">
        Todoリスト
      </h1>

      {/*フォーム*/}
      <form
        onSubmit={handleSubmit}
        className="fixed top-20 left-4 z-20 max-w-sm rounded-lg border border-gray-400 bg-amber-100 p-4 shadow-lg"
      >
        {/*フォーム内部は変更なし*/}
        <div className="flex flex-col gap-4">
          
          {/*タスク名*/}
          <div>
            <label
              htmlFor="taskName"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              タスク名:
            </label>
            <input
              id="taskName"
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
              placeholder="例: 解析2の宿題"
            />
          </div>

          {/*優先度*/}
          <div>
            <label
              htmlFor="priority"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              優先度:
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full appearance-none rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
            >
              <option value={1}>3 (最高)</option>
              <option value={2}>2 (高)</option>
              <option value={3}>1 (中)</option>
              <option value={4}>0 (低)</option>
            </select>
          </div>

          {/*期限*/}
          <div>
            <label
              htmlFor="deadline"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              期限 (任意):
            </label>
            <input
              id="deadline"
              type="datetime-local"
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              className="w-full rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
            />
          </div>

          {/*説明*/}
          <div>
            <label
              htmlFor="description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              説明 (任意):
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border-b-2 border-dashed border-gray-400 bg-transparent px-3 py-2 text-gray-800 focus:outline-none focus:border-yellow-500"
              placeholder="詳細な説明..."
            />
          </div>

          {/*追加ボタン*/}
          <div>
            <button
              type="submit"
              className="h-10 w-full rounded-full border border-yellow-700 bg-yellow-400 px-6 py-2 font-bold text-white shadow-md transition-colors hover:bg-yellow-500"
            >
              追加
            </button>
          </div>

        </div>
      </form>

      {/*付箋エリア*/}
      <div className="flex-grow relative overflow-hidden p-8">
        <TodoList
          todos={todos}
          zIndices={zIndices}
          onDragStart={handleDragStart}
          onDragStop={handleDragStop}
          onToggleDone={handleToggleDone}
        />
      </div>

      {/*ゴミ箱*/}
      <div
        ref={trashAreaRef}
        className={twMerge(
          "fixed bottom-8 right-8 flex h-32 w-32 items-center justify-center rounded-full bg-gray-400 text-white shadow-lg transition-all duration-300",
          "z-30",
          isDragging && "scale-125 bg-red-500 z-40"
        )}
      >
        <FontAwesomeIcon icon={faTrash} size="3x" />
      </div>
    </div>
  );
};

export default App;