"""

Revision ID: b83918753603
Revises:
Create Date: 2024-01-31 14:41:20.140228

"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = "b83918753603"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "user",
        sa.Column("join_date", sa.DateTime(), nullable=False),
        sa.Column("profile_picture", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("username", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("fullname", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("disabled", sa.Boolean(), nullable=True),
        sa.Column("profile_view", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("is_sidebar_open", sa.Boolean(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("provider", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("hashed_password", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("refresh_token", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column("recovery_code", sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_email"), "user", ["email"], unique=False)
    op.create_index(op.f("ix_user_provider"), "user", ["provider"], unique=False)
    op.create_index(op.f("ix_user_username"), "user", ["username"], unique=False)
    op.create_table(
        "verificationcode",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("code", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("request_date", sa.DateTime(), nullable=False),
        sa.Column("expire_date", sa.DateTime(), nullable=False),
        sa.Column("verify_date", sa.DateTime(), nullable=True),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_verificationcode_email"), "verificationcode", ["email"], unique=False)
    op.create_index(op.f("ix_verificationcode_status"), "verificationcode", ["status"], unique=False)
    op.create_table(
        "friend",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_uid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("friend_uid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("friendship_date", sa.DateTime(), nullable=False),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(
            ["friend_uid"],
            ["user.uid"],
        ),
        sa.ForeignKeyConstraint(
            ["user_uid"],
            ["user.uid"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "friendrequest",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_uid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("friend_uid", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column("request_date", sa.DateTime(), nullable=False),
        sa.Column("status", sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(
            ["friend_uid"],
            ["user.uid"],
        ),
        sa.ForeignKeyConstraint(
            ["user_uid"],
            ["user.uid"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table("friendrequest")
    op.drop_table("friend")
    op.drop_index(op.f("ix_verificationcode_status"), table_name="verificationcode")
    op.drop_index(op.f("ix_verificationcode_email"), table_name="verificationcode")
    op.drop_table("verificationcode")
    op.drop_index(op.f("ix_user_username"), table_name="user")
    op.drop_index(op.f("ix_user_provider"), table_name="user")
    op.drop_index(op.f("ix_user_email"), table_name="user")
    op.drop_table("user")
    # ### end Alembic commands ###
