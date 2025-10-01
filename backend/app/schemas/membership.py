from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


class MembershipType(str, Enum):
    FREE = "free"
    PREMIUM = "premium"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    PAYPAL = "paypal"
    BANK_TRANSFER = "bank_transfer"
    CRYPTO = "crypto"


class MembershipBase(BaseModel):
    membership_type: MembershipType = MembershipType.FREE
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    auto_renew: bool = True


class MembershipCreate(MembershipBase):
    subscription_id: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None


class MembershipUpdate(BaseModel):
    membership_type: Optional[MembershipType] = None
    billing_cycle: Optional[BillingCycle] = None
    auto_renew: Optional[bool] = None
    subscription_id: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None


class MembershipResponse(MembershipBase):
    membership_start_date: Optional[datetime] = None
    membership_end_date: Optional[datetime] = None
    subscription_id: Optional[str] = None
    payment_method: Optional[PaymentMethod] = None

    # Usage limits
    api_calls_limit: int = 100
    portfolio_limit: int = 1
    watchlist_limit: int = 3
    prediction_limit: int = 10

    # Feature flags
    has_advanced_charts: bool = False
    has_real_time_data: bool = False
    has_ai_predictions: bool = False
    has_portfolio_analytics: bool = False
    has_custom_alerts: bool = False

    # Usage stats
    api_calls_used_today: int = 0
    portfolios_created: int = 0
    watchlists_created: int = 0
    predictions_used_today: int = 0

    class Config:
        from_attributes = True


class MembershipPlan(BaseModel):
    name: str
    membership_type: MembershipType
    price_monthly: float
    price_yearly: float
    features: Dict[str, Any]
    limits: Dict[str, int]
    description: str


class SubscriptionRequest(BaseModel):
    membership_type: MembershipType
    billing_cycle: BillingCycle
    payment_method: PaymentMethod
    promo_code: Optional[str] = None


class SubscriptionResponse(BaseModel):
    success: bool
    message: str
    subscription_id: Optional[str] = None
    membership_details: Optional[MembershipResponse] = None
    payment_url: Optional[str] = None  # For redirecting to payment gateway


class UsageStats(BaseModel):
    api_calls_used_today: int
    api_calls_limit: int
    portfolios_created: int
    portfolio_limit: int
    watchlists_created: int
    watchlist_limit: int
    predictions_used_today: int
    prediction_limit: int

    # Feature usage
    advanced_charts_used: int = 0
    real_time_data_requests: int = 0
    ai_predictions_used: int = 0
    portfolio_analytics_used: int = 0
    custom_alerts_created: int = 0


class MembershipUpgradeRequest(BaseModel):
    target_membership_type: MembershipType
    billing_cycle: BillingCycle
    payment_method: PaymentMethod
    promo_code: Optional[str] = None
