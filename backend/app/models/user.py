from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Profile fields
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)

    # Preferences
    timezone = Column(String(50), default="UTC")
    currency = Column(String(3), default="USD")
    language = Column(String(10), default="en")

    # Trading preferences
    risk_tolerance = Column(String(20), default="medium")  # low, medium, high
    investment_horizon = Column(String(20), default="medium")  # short, medium, long

    # Membership fields
    membership_type = Column(
        String(20), default="free"
    )  # free, premium, pro, enterprise
    membership_start_date = Column(DateTime(timezone=True), nullable=True)
    membership_end_date = Column(DateTime(timezone=True), nullable=True)
    subscription_id = Column(String(255), nullable=True)  # External subscription ID
    payment_method = Column(String(50), nullable=True)  # credit_card, paypal, etc.
    billing_cycle = Column(String(20), default="monthly")  # monthly, yearly, lifetime
    auto_renew = Column(Boolean, default=True)

    # Usage limits and features
    api_calls_limit = Column(Integer, default=100)  # Daily API calls limit
    portfolio_limit = Column(Integer, default=1)  # Number of portfolios allowed
    watchlist_limit = Column(Integer, default=3)  # Number of watchlists allowed
    prediction_limit = Column(Integer, default=10)  # Daily predictions limit

    # Feature flags
    has_advanced_charts = Column(Boolean, default=False)
    has_real_time_data = Column(Boolean, default=False)
    has_ai_predictions = Column(Boolean, default=False)
    has_portfolio_analytics = Column(Boolean, default=False)
    has_custom_alerts = Column(Boolean, default=False)

    # Relationships
    portfolios = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )
    watchlists = relationship(
        "Watchlist", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', username='{self.username}')>"
