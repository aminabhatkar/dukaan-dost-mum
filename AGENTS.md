<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Order-status notifications (accepted/delivered) are a DB trigger (`order_status_notify` via pg_net) calling the `/api/public/notify-order-status` TanStack server route — never a Supabase Edge Function. Why: this stack ships app-internal logic as server routes; Lovable Cloud's vault is empty, so the shared trigger secret lives in the RLS-locked `app_secrets` table (service_role/trigger read only), not env or vault.
