"""add_gamification_points

Revision ID: 499779af7e6b
Revises: c37db4835b31
Create Date: 2026-05-28 07:43:55.387123

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '499779af7e6b'
down_revision: Union[str, None] = 'c37db4835b31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('gamification_points',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('level', sa.String(length=50), nullable=False, server_default=sa.text("'apprenti'")),
        sa.Column('level_number', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('streak_days', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('last_activity_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('total_points_earned', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gamification_points_user_id'), 'gamification_points', ['user_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_gamification_points_user_id'), table_name='gamification_points')
    op.drop_table('gamification_points')
