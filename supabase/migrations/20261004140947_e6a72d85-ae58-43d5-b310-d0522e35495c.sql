-- app_secrets is system-only: RLS is on with no granting policy.
-- service_role and the trigger helper bypass RLS; everyone else is denied.
CREATE POLICY "no direct access" ON public.app_secrets
FOR SELECT
TO authenticated
USING (false);

CREATE POLICY "no anonymous access" ON public.app_secrets
FOR SELECT
TO anon
USING (false);