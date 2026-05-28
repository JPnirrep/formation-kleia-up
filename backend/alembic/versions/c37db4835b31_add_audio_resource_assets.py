"""add_audio_resource_assets

Revision ID: c37db4835b31
Revises: 260a9c8bb9bc
Create Date: 2026-05-27 15:39:47.233975

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c37db4835b31'
down_revision: Union[str, None] = '260a9c8bb9bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('audio_assets',
    sa.Column('lesson_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('file_url', sa.String(length=1024), nullable=False),
    sa.Column('duration_seconds', sa.Integer(), nullable=False),
    sa.Column('transcript_text', sa.Text(), nullable=True),
    sa.Column('transcript_status', sa.String(length=20), nullable=False),
    sa.Column('language', sa.String(length=10), nullable=False),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audio_assets_lesson_id'), 'audio_assets', ['lesson_id'], unique=False)
    op.create_table('resource_assets',
    sa.Column('lesson_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('order', sa.Integer(), nullable=False),
    sa.Column('file_url', sa.String(length=1024), nullable=False),
    sa.Column('resource_type', sa.String(length=20), nullable=False),
    sa.Column('file_size_bytes', sa.Integer(), nullable=True),
    sa.Column('id', sa.Uuid(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
    sa.ForeignKeyConstraint(['lesson_id'], ['lessons.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_resource_assets_lesson_id'), 'resource_assets', ['lesson_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_resource_assets_lesson_id'), table_name='resource_assets')
    op.drop_table('resource_assets')
    op.drop_index(op.f('ix_audio_assets_lesson_id'), table_name='audio_assets')
    op.drop_table('audio_assets')
