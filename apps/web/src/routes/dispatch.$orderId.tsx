import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Badge, Button, Select } from '~/components/primitives';
import { RiderLocation } from '~/components/features/RiderLocation';
import { useOrderDetail, useAssignRider } from '~/features/dispatch';

export const Route = createFileRoute('/dispatch/$orderId')({
  component: DispatchOrderDetailComponent,
});

const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'car', label: 'Car' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
];

function DispatchOrderDetailComponent() {
  const { orderId } = Route.useParams();
  const { data: order, isLoading, error } = useOrderDetail(orderId);
  const assignRider = useAssignRider();
  const [selectedVehicle, setSelectedVehicle] = useState('');

  const handleAssign = () => {
    assignRider.mutate({
      orderId,
      preferredVehicleType: selectedVehicle || undefined,
    });
  };

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
    : order.status === 'assigned' || order.status === 'picked_up' ? 'info'
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
        </section>

        <section className="border border-[var(--color-border-default)] rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Dropoff</h3>
          <div className="text-lg text-[var(--color-text-primary)]">{order.dropoff.label}</div>
          <div className="text-[var(--color-text-secondary)]">{order.dropoff.city}, {order.dropoff.country}</div>
          {order.dropoff.landmark && (
            <div className="text-sm text-[var(--color-text-secondary)]">Landmark: {order.dropoff.landmark}</div>
          )}
        </section>

        <section className="border border-[var(--color-border-default)] rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Package</h3>
          <div className="text-[var(--color-text-primary)]">{order.packageDescription}</div>
          {order.estimatedFee && (
            <div className="mt-2 font-semibold text-[var(--color-text-primary)]">{order.estimatedFee}</div>
          )}
        </section>

        {order.riderId ? (
          <>
            <section className="border border-[var(--color-brand-primary)] rounded-lg p-4 bg-[var(--color-brand-primary)]/5">
              <h3 className="font-semibold mb-2 text-[var(--color-text-primary)]">Assigned Rider</h3>
              <div className="text-[var(--color-text-primary)] font-medium">{order.riderName}</div>
              {order.riderPhone && (
                <div className="text-[var(--color-text-secondary)]">{order.riderPhone}</div>
              )}
            </section>
            {order.status === 'in_transit' && (
              <RiderLocation orderId={orderId} showMap />
            )}
          </>
        ) : (
          <section className="border border-[var(--color-border-default)] rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Assign Rider</h3>
            <Select
              label="Vehicle Type"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              options={VEHICLE_TYPES}
            />
            <Button 
              onClick={handleAssign} 
              loading={assignRider.isPending}
              className="w-full mt-4"
            >
              Assign Rider
            </Button>
          </section>
        )}

        {order.trackingEvents.length > 0 && (
          <section className="border border-[var(--color-border-default)] rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-[var(--color-text-primary)]">Timeline</h3>
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