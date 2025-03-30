/*
  # Insert default subscription plans
  
  1. Data
    - Insert three default subscription plans:
      - Monthly: R$19.90 for 30 days
      - Quarterly: R$29.90 for 90 days
      - Lifetime: R$49.90 (one-time payment)
*/

INSERT INTO subscription_plans (id, name, price, duration_days, is_lifetime)
VALUES
  ('monthly', 'Plano Mensal', 19.90, 30, false),
  ('quarterly', 'Plano Trimestral', 29.90, 90, false),
  ('lifetime', 'Plano Vitalício', 49.90, NULL, true)
ON CONFLICT (id) DO NOTHING;
