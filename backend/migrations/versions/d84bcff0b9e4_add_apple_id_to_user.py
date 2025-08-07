"""Add apple_id to user

Revision ID: d84bcff0b9e4
Revises: 9a4e316643ec
Create Date: 2025-08-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'd84bcff0b9e4'
down_revision = '9a4e316643ec'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('apple_id', sa.String(length=255), nullable=True))
        batch_op.create_unique_constraint(batch_op.f('uq_user_apple_id'), ['apple_id'])


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('uq_user_apple_id'), type_='unique')
        batch_op.drop_column('apple_id')
