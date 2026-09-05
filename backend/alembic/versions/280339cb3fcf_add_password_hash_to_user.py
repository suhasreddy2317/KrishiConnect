"""Add password_hash to User

Revision ID: 280339cb3fcf
Revises: 96cb90bfa963
Create Date: 2026-09-05 10:43:38.856281

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '280339cb3fcf'
down_revision: Union[str, Sequence[str], None] = '96cb90bfa963'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('password_hash', sa.String(length=255), nullable=False, server_default=''))
    
    conn = op.get_bind()
    conn.execute(sa.text("UPDATE users SET password_hash = '' WHERE password_hash = ''"))


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('password_hash')
