"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateTaskSheet } from "@/components/create-task-sheet";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { DeleteTaskDialog } from "@/components/delete-task-dialog";
import {
  Search,
  Filter,
  Calendar,
  Flag,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import LoadingComponent from "@/components/loader";

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  category: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

export default function TodosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const createTask = useMutation(api.tasks.createTask);
  const toggleTask = useMutation(api.tasks.toggleTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const user = useQuery(api.users.currentUser);

  const tasks =
    useQuery(api.tasks.getTasks, {
      userId: user?._id as Id<"users">,
    }) || [];

  const handleCreateTask = async (
    newTask: Omit<Task, "_id" | "completed" | "createdAt">
  ) => {
    const task: Task = {
      ...newTask,
      _id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await createTask({
        category: task.category,
        priority: task.priority,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        userId: user?._id as Id<"users">,
      });

      toast.success("New Tasks sucessfully created");
    } catch {
      toast.error("Creating new tasks failed");
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {};

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await deleteTask({
        id: taskId as Id<"tasks">,
      });
      toast.success("Task sucessfully deleted");
    } catch {
      toast.error("Cannot delete task");
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const response = await toggleTask({
        id: taskId as Id<"tasks">,
      });
      toast.success("Sucessfully updated the task");
    } catch {
      toast.error("Updates unsucessful");
    }
  };

  const filteredTasks =
    tasks &&
    tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "completed" && task.completed) ||
        (filterStatus === "pending" && !task.completed);

      return matchesSearch && matchesPriority && matchesStatus;
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const completedCount = tasks && tasks.filter((task) => task.completed).length;
  const totalCount = tasks && tasks.length;

  if (!user) {
    return <LoadingComponent />;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Todo List</h1>
            <p className="text-gray-400">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <CreateTaskSheet onCreateTask={handleCreateTask} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 border ">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Circle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalCount - completedCount}
                </p>
                <p className="text-gray-400 text-sm">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border ">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border ">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Flag className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {
                    tasks?.filter((t) => t.priority === "high" && !t.completed)
                      .length
                  }
                </p>
                <p className="text-gray-400 text-sm">High Priority</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border ">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tasks?.filter((t) => t.dueDate && !t.completed).length}
                </p>
                <p className="text-gray-400 text-sm">Due Soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl p-4 border mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10   placeholder:text-gray-500"
              />
            </div>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40 ">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="all" className=" ">
                  All Priorities
                </SelectItem>
                <SelectItem value="high" className=" ">
                  High
                </SelectItem>
                <SelectItem value="medium" className=" ">
                  Medium
                </SelectItem>
                <SelectItem value="low" className=" ">
                  Low
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40  ">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className=" ">
                <SelectItem value="all" className=" ">
                  All Tasks
                </SelectItem>
                <SelectItem value="pending" className=" ">
                  Pending
                </SelectItem>
                <SelectItem value="completed" className=" ">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks && filteredTasks.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border  text-center">
              <p className="text-gray-400">
                No tasks found. Create your first task to get started!
              </p>
            </div>
          ) : (
            filteredTasks?.map((task) => (
              <div
                key={task._id}
                className={`bg-card rounded-xl p-4 border  transition-all hover: ${
                  task.completed ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task._id)}
                    className="mt-1 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${task.completed ? "line-through text-gray-500" : ""}`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-400 text-sm mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 mt-3">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className=" text-gray-300">
                            {task.category}
                          </Badge>
                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Calendar className="w-3 h-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className=" ">
                          <DropdownMenuItem
                            onClick={() => setEditingTask(task)}
                            className=" "
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeletingTask(task)}
                            className="text-red-400 "
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Task Dialog */}
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onUpdateTask={handleUpdateTask}
        />

        {/* Delete Task Dialog */}
        <DeleteTaskDialog
          open={!!deletingTask}
          onOpenChange={(open) => !open && setDeletingTask(null)}
          onConfirm={() => {
            if (deletingTask) {
              handleDeleteTask(deletingTask._id);
              setDeletingTask(null);
            }
          }}
          taskTitle={deletingTask?.title || ""}
        />
      </div>
    </div>
  );
}
