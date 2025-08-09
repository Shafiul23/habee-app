"""add habit pause table and unique name index

Revision ID: ea866b1fa0d9
Revises: c43a28efbed5
Create Date: 2025-07-10 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'ea866b1fa0d9'
down_revision = 'c43a28efbed5'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'habit_pauses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('habit_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['habit_id'], ['habit.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_habit_pauses_habit_id'), 'habit_pauses', ['habit_id'], unique=False)
    op.execute(
        "CREATE UNIQUE INDEX IF NOT EXISTS uniq_habit_name_per_user ON habit (user_id, lower(name))"
    )


def downgrade():
    op.execute("DROP INDEX IF EXISTS uniq_habit_name_per_user")
    op.drop_index(op.f('ix_habit_pauses_habit_id'), table_name='habit_pauses')
    op.drop_table('habit_pauses')
