import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CatalogItem {
  id: number;
  name: string;
  unit: string;
  price: number;
  category: string;
}

export const Route = createFileRoute('/catalog')({
  head: () => ({
    meta: [
      { title: 'Aaj ke Rate — Rehana Store' },
      { name: 'description', content: 'Rehana Store ki poori rate list — doodh, aata, tel aur sab kuch.' },
      { property: 'og:title', content: 'Aaj ke Rate — Rehana Store' },
      { property: 'og:description', content: 'Rehana Store ki poori rate list — doodh, aata, tel aur sab kuch.' },
    ],
  }),
  component: CatalogPage,
});

function rs(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function CatalogPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('catalog_items')
      .select('id, name, unit, price, category')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) {
          setError('Rate list load nahi ho paaya.');
        } else {
          setItems((data ?? []).map((r) => ({ ...r, price: Number(r.price) })));
        }
        setLoading(false);
      });
  }, []);

  // Group by category
  const grouped = new Map<string, CatalogItem[]>();
  for (const item of items) {
    const list = grouped.get(item.category) ?? [];
    list.push(item);
    grouped.set(item.category, list);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)', fontFamily: "'Montserrat', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 40 }}>

        {/* Header */}
        <div style={{ background: 'var(--color-primary)', padding: '20px 22px 18px', color: 'var(--color-primary-foreground)' }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>🛒 Aaj ke Rate</div>
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4, opacity: 0.85 }}>
            Rehana Store · Rate List
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: 17, color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
            Rate list load ho rahi hai...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: 17, color: 'var(--color-destructive)', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', fontSize: 17, color: 'var(--color-ink-subtle)', fontWeight: 600 }}>
            Rate list abhi khali hai.
          </div>
        )}

        {/* Grouped catalog */}
        {Array.from(grouped.entries()).map(([category, catItems]) => (
          <div key={category} style={{ margin: '20px 16px 0' }}>
            {/* Category header */}
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-ink-subtle)',
              padding: '0 4px 8px',
            }}>
              {category}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {catItems.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--color-card)',
                  border: '2px solid var(--color-warm-border)',
                  borderRadius: 14,
                  padding: '12px 16px',
                  boxShadow: '0 2px 8px rgba(72,55,32,.08)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-ink)' }}>{item.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-subtle)', marginTop: 2 }}>{item.unit}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-ink)', flexShrink: 0 }}>
                    {rs(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px 0', fontSize: 13, color: 'var(--color-ink-subtle)', fontWeight: 500 }}>
            {items.length} item · Order ke liye Telegram par message karein
          </div>
        )}
      </div>
    </div>
  );
}
