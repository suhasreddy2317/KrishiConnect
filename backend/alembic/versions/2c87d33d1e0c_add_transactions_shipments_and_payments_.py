"""add transactions shipments and payments tables

Revision ID: 2c87d33d1e0c
Revises: fc1c3eb271cd
Create Date: 2026-09-05 20:37:40.240019

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c87d33d1e0c'
down_revision: Union[str, Sequence[str], None] = 'fc1c3eb271cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'transactions' not in existing_tables:
        op.create_table(
            'transactions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('offer_id', sa.Integer(), nullable=False),
            sa.Column('lot_id', sa.Integer(), nullable=False),
            sa.Column('buyer_id', sa.Integer(), nullable=False),
            sa.Column('farmer_id', sa.Integer(), nullable=False),
            sa.Column('quantity', sa.Float(), nullable=False),
            sa.Column('agreed_price', sa.Float(), nullable=False),
            sa.Column('total_amount', sa.Float(), nullable=False),
            sa.Column('status', sa.Enum('pending', 'accepted', 'confirmed', 'dispatched', 'in_transit', 'delivered', 'payment_pending', 'completed', 'disputed', name='transactionstatus'), nullable=False),
            sa.Column('confirmed_at', sa.DateTime(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['buyer_id'], ['buyers.id'], ),
            sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
            sa.ForeignKeyConstraint(['lot_id'], ['produce_lots.id'], ),
            sa.ForeignKeyConstraint(['offer_id'], ['offers.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('offer_id', name='uq_transactions_offer_id')
        )
        op.create_index(op.f('ix_transactions_buyer_id'), 'transactions', ['buyer_id'], unique=False)
        op.create_index(op.f('ix_transactions_farmer_id'), 'transactions', ['farmer_id'], unique=False)
        op.create_index(op.f('ix_transactions_id'), 'transactions', ['id'], unique=False)
        op.create_index(op.f('ix_transactions_lot_id'), 'transactions', ['lot_id'], unique=False)
        op.create_index(op.f('ix_transactions_offer_id'), 'transactions', ['offer_id'], unique=False)

    if 'shipments' not in existing_tables:
        op.create_table(
            'shipments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('transaction_id', sa.Integer(), nullable=False),
            sa.Column('pickup_location', sa.String(length=200), nullable=False),
            sa.Column('delivery_location', sa.String(length=200), nullable=False),
            sa.Column('transporter_name', sa.String(length=120), nullable=True),
            sa.Column('vehicle_number', sa.String(length=40), nullable=True),
            sa.Column('estimated_pickup', sa.DateTime(), nullable=True),
            sa.Column('estimated_delivery', sa.DateTime(), nullable=True),
            sa.Column('actual_pickup', sa.DateTime(), nullable=True),
            sa.Column('actual_delivery', sa.DateTime(), nullable=True),
            sa.Column('status', sa.String(length=30), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('transaction_id', name='uq_shipments_transaction_id')
        )
        op.create_index(op.f('ix_shipments_id'), 'shipments', ['id'], unique=False)
        op.create_index(op.f('ix_shipments_transaction_id'), 'shipments', ['transaction_id'], unique=False)

    if 'payments' not in existing_tables:
        op.create_table(
            'payments',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('transaction_id', sa.Integer(), nullable=False),
            sa.Column('amount', sa.Float(), nullable=False),
            sa.Column('payment_method', sa.String(length=80), nullable=True),
            sa.Column('status', sa.String(length=30), nullable=False),
            sa.Column('reference', sa.String(length=120), nullable=True),
            sa.Column('initiated_at', sa.DateTime(), nullable=True),
            sa.Column('confirmed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('transaction_id', name='uq_payments_transaction_id')
        )
        op.create_index(op.f('ix_payments_id'), 'payments', ['id'], unique=False)
        op.create_index(op.f('ix_payments_transaction_id'), 'payments', ['transaction_id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = inspector.get_table_names()

    if 'payments' in existing_tables:
        op.drop_constraint('uq_payments_transaction_id', 'payments', type_='unique')
        op.drop_index(op.f('ix_payments_transaction_id'), table_name='payments')
        op.drop_index(op.f('ix_payments_id'), table_name='payments')
        op.drop_table('payments')

    if 'shipments' in existing_tables:
        op.drop_constraint('uq_shipments_transaction_id', 'shipments', type_='unique')
        op.drop_index(op.f('ix_shipments_transaction_id'), table_name='shipments')
        op.drop_index(op.f('ix_shipments_id'), table_name='shipments')
        op.drop_table('shipments')

    if 'transactions' in existing_tables:
        op.drop_constraint('uq_transactions_offer_id', 'transactions', type_='unique')
        op.drop_index(op.f('ix_transactions_offer_id'), table_name='transactions')
        op.drop_index(op.f('ix_transactions_lot_id'), table_name='transactions')
        op.drop_index(op.f('ix_transactions_id'), table_name='transactions')
        op.drop_index(op.f('ix_transactions_farmer_id'), table_name='transactions')
        op.drop_index(op.f('ix_transactions_buyer_id'), table_name='transactions')
        op.drop_table('transactions')
    # ### end Alembic commands ###
