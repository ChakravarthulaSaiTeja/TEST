from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import logging

from app.core.database import get_db
from app.models.user import User
from app.schemas.membership import (
    MembershipResponse,
    MembershipUpdate,
    MembershipPlan,
    SubscriptionRequest,
    SubscriptionResponse,
    UsageStats,
    MembershipUpgradeRequest,
    MembershipType,
    BillingCycle,
)
from app.api.v1.endpoints.auth import get_current_active_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Define membership plans
MEMBERSHIP_PLANS = {
    MembershipType.FREE: MembershipPlan(
        name="Free",
        membership_type=MembershipType.FREE,
        price_monthly=0.0,
        price_yearly=0.0,
        features={
            "basic_charts": True,
            "limited_predictions": True,
            "community_access": True,
            "email_support": True,
        },
        limits={
            "api_calls_limit": 100,
            "portfolio_limit": 1,
            "watchlist_limit": 3,
            "prediction_limit": 10,
        },
        description="Perfect for getting started with basic trading insights",
    ),
    MembershipType.PREMIUM: MembershipPlan(
        name="Premium",
        membership_type=MembershipType.PREMIUM,
        price_monthly=29.99,
        price_yearly=299.99,
        features={
            "advanced_charts": True,
            "real_time_data": True,
            "ai_predictions": True,
            "portfolio_analytics": True,
            "priority_support": True,
            "custom_alerts": True,
        },
        limits={
            "api_calls_limit": 1000,
            "portfolio_limit": 5,
            "watchlist_limit": 10,
            "prediction_limit": 100,
        },
        description="Advanced features for serious traders",
    ),
    MembershipType.PRO: MembershipPlan(
        name="Pro",
        membership_type=MembershipType.PRO,
        price_monthly=99.99,
        price_yearly=999.99,
        features={
            "advanced_charts": True,
            "real_time_data": True,
            "ai_predictions": True,
            "portfolio_analytics": True,
            "priority_support": True,
            "custom_alerts": True,
            "api_access": True,
            "white_label": True,
        },
        limits={
            "api_calls_limit": 10000,
            "portfolio_limit": 20,
            "watchlist_limit": 50,
            "prediction_limit": 1000,
        },
        description="Professional features for advanced traders and developers",
    ),
    MembershipType.ENTERPRISE: MembershipPlan(
        name="Enterprise",
        membership_type=MembershipType.ENTERPRISE,
        price_monthly=499.99,
        price_yearly=4999.99,
        features={
            "advanced_charts": True,
            "real_time_data": True,
            "ai_predictions": True,
            "portfolio_analytics": True,
            "priority_support": True,
            "custom_alerts": True,
            "api_access": True,
            "white_label": True,
            "dedicated_support": True,
            "custom_integrations": True,
        },
        limits={
            "api_calls_limit": 100000,
            "portfolio_limit": 100,
            "watchlist_limit": 200,
            "prediction_limit": 10000,
        },
        description="Enterprise solution with unlimited access and dedicated support",
    ),
}


def update_user_membership_features(user: User, membership_type: MembershipType):
    """Update user features based on membership type"""
    plan = MEMBERSHIP_PLANS[membership_type]

    # Update limits
    user.api_calls_limit = plan.limits["api_calls_limit"]
    user.portfolio_limit = plan.limits["portfolio_limit"]
    user.watchlist_limit = plan.limits["watchlist_limit"]
    user.prediction_limit = plan.limits["prediction_limit"]

    # Update feature flags
    user.has_advanced_charts = plan.features.get("advanced_charts", False)
    user.has_real_time_data = plan.features.get("real_time_data", False)
    user.has_ai_predictions = plan.features.get("ai_predictions", False)
    user.has_portfolio_analytics = plan.features.get("portfolio_analytics", False)
    user.has_custom_alerts = plan.features.get("custom_alerts", False)


@router.get("/plans", response_model=List[MembershipPlan])
async def get_membership_plans():
    """Get all available membership plans"""
    return list(MEMBERSHIP_PLANS.values())


@router.get("/current", response_model=MembershipResponse)
async def get_current_membership(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's membership details"""
    # Calculate usage stats (simplified - in production, you'd track this separately)
    usage_stats = UsageStats(
        api_calls_used_today=0,  # Would be calculated from usage logs
        api_calls_limit=current_user.api_calls_limit,
        portfolios_created=len(current_user.portfolios),
        portfolio_limit=current_user.portfolio_limit,
        watchlists_created=len(current_user.watchlists),
        watchlist_limit=current_user.watchlist_limit,
        predictions_used_today=0,  # Would be calculated from usage logs
        prediction_limit=current_user.prediction_limit,
    )

    return MembershipResponse(
        membership_type=current_user.membership_type,
        membership_start_date=current_user.membership_start_date,
        membership_end_date=current_user.membership_end_date,
        subscription_id=current_user.subscription_id,
        payment_method=current_user.payment_method,
        billing_cycle=current_user.billing_cycle,
        auto_renew=current_user.auto_renew,
        api_calls_limit=current_user.api_calls_limit,
        portfolio_limit=current_user.portfolio_limit,
        watchlist_limit=current_user.watchlist_limit,
        prediction_limit=current_user.prediction_limit,
        has_advanced_charts=current_user.has_advanced_charts,
        has_real_time_data=current_user.has_real_time_data,
        has_ai_predictions=current_user.has_ai_predictions,
        has_portfolio_analytics=current_user.has_portfolio_analytics,
        has_custom_alerts=current_user.has_custom_alerts,
        api_calls_used_today=usage_stats.api_calls_used_today,
        portfolios_created=usage_stats.portfolios_created,
        watchlists_created=usage_stats.watchlists_created,
        predictions_used_today=usage_stats.predictions_used_today,
    )


@router.post("/subscribe", response_model=SubscriptionResponse)
async def subscribe_to_plan(
    subscription_request: SubscriptionRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Subscribe to a membership plan"""
    try:
        # Check if user already has an active subscription
        if (
            current_user.membership_type != MembershipType.FREE
            and current_user.membership_end_date
        ):
            if current_user.membership_end_date > datetime.utcnow():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User already has an active subscription",
                )

        # Update user membership
        current_user.membership_type = subscription_request.membership_type
        current_user.billing_cycle = subscription_request.billing_cycle
        current_user.payment_method = subscription_request.payment_method
        current_user.membership_start_date = datetime.utcnow()

        # Set membership end date based on billing cycle
        if subscription_request.billing_cycle == BillingCycle.MONTHLY:
            current_user.membership_end_date = datetime.utcnow() + timedelta(days=30)
        elif subscription_request.billing_cycle == BillingCycle.YEARLY:
            current_user.membership_end_date = datetime.utcnow() + timedelta(days=365)
        else:  # LIFETIME
            current_user.membership_end_date = datetime.utcnow() + timedelta(
                days=365 * 10
            )  # 10 years

        # Generate subscription ID (in production, this would come from payment provider)
        current_user.subscription_id = (
            f"sub_{current_user.id}_{int(datetime.utcnow().timestamp())}"
        )

        # Update user features based on membership type
        update_user_membership_features(
            current_user, subscription_request.membership_type
        )

        db.commit()
        db.refresh(current_user)

        logger.info(
            f"User {current_user.email} subscribed to {subscription_request.membership_type}"
        )

        return SubscriptionResponse(
            success=True,
            message=f"Successfully subscribed to {subscription_request.membership_type} plan",
            subscription_id=current_user.subscription_id,
            membership_details=await get_current_membership(current_user, db),
        )

    except Exception as e:
        logger.error(f"Subscription error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process subscription",
        )


@router.post("/upgrade", response_model=SubscriptionResponse)
async def upgrade_membership(
    upgrade_request: MembershipUpgradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upgrade user's membership plan"""
    try:
        # Check if upgrade is valid
        current_plan_value = list(MEMBERSHIP_PLANS.keys()).index(
            current_user.membership_type
        )
        target_plan_value = list(MEMBERSHIP_PLANS.keys()).index(
            upgrade_request.target_membership_type
        )

        if target_plan_value <= current_plan_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target plan must be higher than current plan",
            )

        # Update membership
        current_user.membership_type = upgrade_request.target_membership_type
        current_user.billing_cycle = upgrade_request.billing_cycle
        current_user.payment_method = upgrade_request.payment_method

        # Update features
        update_user_membership_features(
            current_user, upgrade_request.target_membership_type
        )

        db.commit()
        db.refresh(current_user)

        logger.info(
            f"User {current_user.email} upgraded to {upgrade_request.target_membership_type}"
        )

        return SubscriptionResponse(
            success=True,
            message=f"Successfully upgraded to {upgrade_request.target_membership_type} plan",
            subscription_id=current_user.subscription_id,
            membership_details=await get_current_membership(current_user, db),
        )

    except Exception as e:
        logger.error(f"Upgrade error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process upgrade",
        )


@router.post("/cancel")
async def cancel_membership(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Cancel user's membership (downgrade to free)"""
    try:
        # Downgrade to free plan
        current_user.membership_type = MembershipType.FREE
        current_user.membership_end_date = datetime.utcnow()
        current_user.subscription_id = None
        current_user.payment_method = None
        current_user.auto_renew = False

        # Reset to free plan features
        update_user_membership_features(current_user, MembershipType.FREE)

        db.commit()

        logger.info(f"User {current_user.email} cancelled membership")

        return {"message": "Membership cancelled successfully"}

    except Exception as e:
        logger.error(f"Cancellation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel membership",
        )


@router.get("/usage", response_model=UsageStats)
async def get_usage_stats(
    current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)
):
    """Get current user's usage statistics"""
    return UsageStats(
        api_calls_used_today=0,  # Would be calculated from usage logs
        api_calls_limit=current_user.api_calls_limit,
        portfolios_created=len(current_user.portfolios),
        portfolio_limit=current_user.portfolio_limit,
        watchlists_created=len(current_user.watchlists),
        watchlist_limit=current_user.watchlist_limit,
        predictions_used_today=0,  # Would be calculated from usage logs
        prediction_limit=current_user.prediction_limit,
    )


@router.get("/")
async def membership_root():
    return {"message": "Membership management endpoints available"}
