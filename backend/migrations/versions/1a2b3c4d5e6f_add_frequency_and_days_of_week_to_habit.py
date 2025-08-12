"""add frequency and days_of_week to habit

Revision ID: 1a2b3c4d5e6f
Revises: f71cd428c220
Create Date: 2025-02-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '1a2b3c4d5e6f'
down_revision = 'f71cd428c220'
branch_labels = None
depends_on = None


def upgrade():
    habit_frequency = sa.Enum('DAILY', 'WEEKLY', name='habit_frequency')
    habit_frequency.create(op.get_bind(), checkfirst=True)
    with op.batch_alter_table('habit') as batch_op:
        batch_op.add_column(sa.Column('frequency', habit_frequency, nullable=False, server_default='DAILY'))
        batch_op.add_column(sa.Column('days_of_week', sa.ARRAY(sa.Integer()), nullable=True))
    op.execute("UPDATE habit SET frequency='DAILY', days_of_week=NULL")
    with op.batch_alter_table('habit') as batch_op:
        batch_op.alter_column('frequency', server_default=None)


def downgrade():
    with op.batch_alter_table('habit') as batch_op:
        batch_op.drop_column('days_of_week')
        batch_op.drop_column('frequency')
    habit_frequency = sa.Enum('DAILY', 'WEEKLY', name='habit_frequency')
    habit_frequency.drop(op.get_bind(), checkfirst=True)
