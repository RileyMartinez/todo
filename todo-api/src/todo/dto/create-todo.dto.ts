export class CreateTodoDto {
    title: string;
    description?: string;
    completed?: boolean;
    dueDate?: Date;
    order?: number;
    todoListId: number;
}
