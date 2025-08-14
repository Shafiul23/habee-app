"""merge heads frequency/days_of_week + habit_log_unique_constraint

Revision ID: cee29215994b
Revises: 1a2b3c4d5e6f, 3ee2e3a2a7de
Create Date: 2025-08-12 21:33:11.740087

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cee29215994b'
down_revision = ('1a2b3c4d5e6f', '3ee2e3a2a7de')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
