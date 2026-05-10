import { createFileRoute } from '@tanstack/react-router';
import { Badge } from '~/components/primitives';
import { useOrderDetail } from '~/features/orders';

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailComponent,
});

function OrderDetailComponent() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading, error } = useOrderDetail(orderId);

  if (isLoading) {
    return <div className="p-4 text-[var(--color-text-secondary)]">Loading order...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div role="alert" className="bg-[var(--color-status-error)]/10 text-[var(--color-status-error)] p-3 rounded-md">
          {error.message}
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="p-4 text-[var(--color-text-secondary)]">Order not found</div>;
  }

  const badgeVariant = order.status === 'confirmed' ? 'success' 
    : order.status === 'pending' ? 'warning' 
    : order.status === 'assigned' || order.status === 'picked_up' || order.status === 'in_transit' ? 'info'
    : order.status === 'delivered' ? 'default'
    : 'error';

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-4">
        <Badge variant={badgeVariant}>{order.status}</Badge>
      </div>

      <div className="space-y-4">
        <section className="border border-[var(--color-border-default)] rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Pickup</h3>
          <div className="text-lg text-[var(--color-text-primary)]">{order.pickup.label}</div>
          <div className="text-[var(--color-text-secondary)]">{order.pickup.city}, {order.pickup.country}</div>
          {order.pickup.landmark && (
            <div className="text-sm text-[var(--color-text-secondary)]">Landmark: {order.pickup.landmark}</div>
          )}
          {order.pickup.streetAddress && (
            <div className="text-sm text-[var(--color-text-secondary)]">{order.pickup.streetAddress}</div>
          )}
        </section>

        <section className="border border-[var(--color-border-default)] rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Dropoff</h3>
          <div className="text-lg text-[var(--color-text-primary)]">{order.dropoff.label}</div>
          <div className="text-[var(--color-text-secondary)]">{order.dropoff.city}, {order.dropoff.country}</div>
          {order.dropoff.landmark && (
            <div className="text-sm text-[var(--color-text-secondary)]">Landmark: {order.dropoff.landmark}</div>
          )}
          {order.dropoff.streetAddress && (
            <div className="text-sm text-[var(--color-text-secondary)]">{order.dropoff.streetAddress}</div>
          )}
        </section>

        <section className="border border-[var(--color-border-default)] rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Package</h3>
          <div className="text-[var(--color-text-primary)]">{order.packageDescription}</div>
          {order.estimatedFee && (
            <div className="mt-2 font-semibold text-[var(--color-text-primary)]">{order.estimatedFee}</div>
          )}
        </section>

        {order.riderId && (
          <section className="border border-[var(--color-border-default)] rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Rider</h3>
            <div className="text-[var(--color-text-primary)]">{order.riderName}</div>
            {order.riderPhone && (
              <div className="text-[var(--color-text-secondary)]">{order.riderPhone}</div>
            )}
          </section>
        )}

        {order.trackingEvents.length > 0 && (
          <section className="border border-[var(--color-border-default)] rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Tracking Timeline</h3>
            <div className="space-y-3">
              {order.trackingEvents.map((event) => (
                <div key={event.occurredAt} className="flex gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[var(--color-border-strong)] flex-shrink-0" />
                  <div>
                    <div className="font-medium text-[var(--color-text-primary)]">
                      {event.type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)]">
                      {new Date(event.occurredAt).toLocaleString()}
                    </div>
                    {event.lat && event.lng && (
                      <div className="text-xs text-[var(--color-text-secondary)] opacity-75">
                        {event.lat.toFixed(5)}, {event.lng.toFixed(5)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}