from fastapi import Depends
from fastapi import FastAPI
from fastapi import HTTPException

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import Base
from database import engine
from database import get_db

from models import Task

from schemas import TaskCreate
from schemas import TaskResponse
from schemas import TaskUpdate
from schemas import VALID_PRIORITIES
from schemas import VALID_STATUSES


# ==================================================
# DATABASE INITIALIZATION
# ==================================================

Base.metadata.create_all(
    bind=engine
)


# ==================================================
# FASTAPI APP
# ==================================================

app = FastAPI(

    title="TaskFlow API",

    description=(
        "REST API for the TaskFlow "
        "Full-Stack Task Management Application."
    ),

    version="1.0.0"
)


# ==================================================
# CORS
# ==================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/")
def root():

    return {
        "application": "TaskFlow",
        "message": "Task Management API is running",
        "status": "success",
        "version": "1.0.0"
    }


# ==================================================
# GET ALL TASKS
# ==================================================

@app.get(
    "/tasks",
    response_model=list[TaskResponse]
)
def get_tasks(
    db: Session = Depends(get_db)
):

    return (
        db.query(Task)
        .order_by(Task.id.desc())
        .all()
    )


# ==================================================
# GET SINGLE TASK
# ==================================================

@app.get(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def get_task(
    task_id: int,
    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    return task


# ==================================================
# CREATE TASK
# ==================================================

@app.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=201
)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):

    if task_data.status not in VALID_STATUSES:

        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )


    if task_data.priority not in VALID_PRIORITIES:

        raise HTTPException(
            status_code=400,
            detail="Invalid task priority"
        )


    task = Task(

        title=task_data.title.strip(),

        description=(
            task_data.description or ""
        ).strip(),

        status=task_data.status,

        priority=task_data.priority,

        due_date=task_data.due_date
    )


    db.add(task)

    db.commit()

    db.refresh(task)


    return task


# ==================================================
# UPDATE TASK
# ==================================================

@app.put(
    "/tasks/{task_id}",
    response_model=TaskResponse
)
def update_task(

    task_id: int,

    task_data: TaskUpdate,

    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    if task_data.status not in VALID_STATUSES:

        raise HTTPException(
            status_code=400,
            detail="Invalid task status"
        )


    if task_data.priority not in VALID_PRIORITIES:

        raise HTTPException(
            status_code=400,
            detail="Invalid task priority"
        )


    task.title =
        task_data.title.strip()


    task.description = (
        task_data.description or ""
    ).strip()


    task.status =
        task_data.status


    task.priority =
        task_data.priority


    task.due_date =
        task_data.due_date


    db.commit()

    db.refresh(task)


    return task


# ==================================================
# DELETE TASK
# ==================================================

@app.delete(
    "/tasks/{task_id}"
)
def delete_task(

    task_id: int,

    db: Session = Depends(get_db)
):

    task = (
        db.query(Task)
        .filter(Task.id == task_id)
        .first()
    )


    if task is None:

        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )


    db.delete(task)

    db.commit()


    return {

        "message":
            "Task deleted successfully",

        "id":
            task_id

    }
