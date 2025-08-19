"""add google_id to user

Revision ID: b2e6264f1423
Revises: cee29215994b
Create Date: 2025-08-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b2e6264f1423'
down_revision = 'cee29215994b'
branch_labels = None
depends_on = None

def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('google_id', sa.String(length=255), nullable=True))
        batch_op.create_unique_constraint(batch_op.f('uq_user_google_id'), ['google_id'])


def downgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('uq_user_google_id'), type_='unique')
        batch_op.drop_column('google_id')
