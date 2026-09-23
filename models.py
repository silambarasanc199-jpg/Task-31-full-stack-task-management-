from datetime import datetime

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from database import Base


class Task(Base):

    __tablename__ = "tasks"


    id = Column(
        Integer,
        primary_key=True,
        index=True
    )


    title = Column(
        String(200),
        nullable=False
    )


    description = Column(
        Text,
        nullable=True
    )


    status = Column(
        String(30),
        nullable=False,
        default="todo"
    )


    priority = Column(
        String(30),
        nullable=False,
        default="medium"
    )


    due_date = Column(
        String(20),
        nullable=True
    )


    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )
