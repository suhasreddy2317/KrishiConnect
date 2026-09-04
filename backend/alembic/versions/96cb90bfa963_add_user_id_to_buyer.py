"""Add user_id to Buyer

Revision ID: 96cb90bfa963
Revises: 34b9b2f7290d
Create Date: 2026-09-04 22:39:33.122210

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '96cb90bfa963'
down_revision: Union[str, Sequence[str], None] = '34b9b2f7290d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('buyers') as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_buyers_user_id', ['user_id'], unique=False)
        batch_op.create_foreign_key('fk_buyers_users', 'users', ['user_id'], ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('buyers') as batch_op:
        batch_op.drop_constraint('fk_buyers_users', type_='foreignkey')
        batch_op.drop_index('ix_buyers_user_id')
        batch_op.drop_column('user_id')
