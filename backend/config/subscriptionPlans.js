export const subscriptionPlans = {
  Pro: {
    id: "Pro",
    name: "Pro",
    amount: 1200,
    currency: "INR",
    description: "Pro monthly subscription"
  },
  Enterprise: {
    id: "Enterprise",
    name: "Team",
    amount: 3900,
    currency: "INR",
    description: "Team monthly subscription"
  }
};

export const getSubscriptionPlan = (planId) => subscriptionPlans[planId] || null;
