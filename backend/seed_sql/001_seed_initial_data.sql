-- seed initial roles and subscription plans

INSERT INTO subscription_plans (id, name, tier, monthly_price_inr, yearly_price_inr, max_users, max_students, max_certificates_per_month, features, is_active)
VALUES 
  (gen_random_uuid(), 'Starter', 'STARTER', 9999, 99990, 50, 1000, 500, '{"basic":true}', true),
  (gen_random_uuid(), 'Professional', 'PROFESSIONAL', 29999, 299990, 500, 10000, 5000, '{"analytics":true}', true);

-- roles might be stored in another system or enumerated, so no seed needed here.
