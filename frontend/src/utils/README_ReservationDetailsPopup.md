# ReservationDetailsPopup Component

A comprehensive popup component for displaying and managing reservation details for parking slots.

## Features

- **Reservation List**: Displays all reservations for a specific parking slot
- **Action Buttons**: 
  - Mark as Occupied (for confirmed reservations)
  - Cancel Reservation (for pending/confirmed reservations)
  - Mark as Paid/Pending (payment status management)
  - View Details (placeholder for future detailed view)
- **Real-time Updates**: Automatically refreshes data after actions
- **Responsive Design**: Works on desktop and mobile devices
- **Loading States**: Shows loading indicators during API calls
- **Error Handling**: Displays toast notifications for errors

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls popup visibility |
| `onClose` | function | Yes | Callback when popup is closed |
| `parkingSlotId` | string | Yes | ID of the parking slot |
| `parkingSlotData` | object | Yes | Parking slot data object |
| `onReservationUpdate` | function | No | Callback when reservations are updated |

## Usage Example

```jsx
import ReservationDetailsPopup from './utils/ReservationDetailsPopup';

const MyComponent = () => {
  const [isReservationPopupOpen, setIsReservationPopupOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleViewReservations = (slot) => {
    setSelectedSlot(slot);
    setIsReservationPopupOpen(true);
  };

  const handleReservationUpdate = () => {
    // Refresh your parking slots data
    fetchParkingSlots();
  };

  return (
    <>
      {/* Your parking slot UI */}
      <button onClick={() => handleViewReservations(slot)}>
        View Reservations
      </button>

      {/* Reservation Details Popup */}
      <ReservationDetailsPopup
        isOpen={isReservationPopupOpen}
        onClose={() => setIsReservationPopupOpen(false)}
        parkingSlotId={selectedSlot?._id}
        parkingSlotData={selectedSlot}
        onReservationUpdate={handleReservationUpdate}
      />
    </>
  );
};
```

## API Endpoints Used

The component uses the following backend endpoints:

- `GET /v1/reservation/parking-slot/:parkingSlotId` - Fetch reservations for a slot
- `PATCH /v1/reservation/:id/complete` - Complete a reservation
- `PATCH /v1/reservation/:id/cancel` - Cancel a reservation
- `PATCH /v1/reservation/:id/payment-status` - Update payment status

## Reservation Status Colors

- **Pending**: Yellow background
- **Confirmed**: Blue background
- **Completed**: Green background
- **Cancelled**: Red background

## Payment Status Colors

- **Pending**: Orange background
- **Paid**: Green background
- **Refunded**: Purple background

## Action Button Visibility

- **Mark as Occupied**: Only shown for confirmed reservations
- **Cancel Reservation**: Only shown for pending/confirmed reservations
- **Mark as Paid**: Only shown for pending payment status
- **Mark as Pending**: Only shown for paid payment status
- **View Details**: Always shown (placeholder functionality)

## Integration with ListParkingSlots

The component is already integrated into the `ListParkingSlots` component. Users can click on the "Active Reservations" section of any parking slot to view and manage reservations.

## Styling

The component uses Tailwind CSS classes and follows the existing design system with:
- Cyan color scheme for primary actions
- Responsive grid layouts
- Consistent spacing and typography
- Hover effects and transitions
- Loading spinners and disabled states 