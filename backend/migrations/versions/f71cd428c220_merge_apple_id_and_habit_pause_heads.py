"""merge apple_id and habit_pause heads

Revision ID: f71cd428c220
Revises: d84bcff0b9e4, ea866b1fa0d9
Create Date: 2025-08-09 14:42:43.126671

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f71cd428c220'
down_revision = ('d84bcff0b9e4', 'ea866b1fa0d9')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
