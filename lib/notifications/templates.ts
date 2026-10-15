export const notificationTemplates = {
  request_created: { title: "Request received", message: "TISA has received your assistance request and will review it shortly." },
  request_reviewing: { title: "Your request is under review", message: "The TISA team is reviewing your travel request." },
  document_required: { title: "Document required", message: "TISA needs an additional document for your request." },
  document_status: { title: "Document status updated", message: "One of your submitted documents has been updated." },
  quote_ready: { title: "Your TISA quote is ready", message: "A quote is ready for you to review." },
  quote_accepted: { title: "Quote accepted", message: "Your quote acceptance has been received. TISA will continue with processing." },
  quote_changes_requested: { title: "Quote changes requested", message: "TISA received your requested changes to the quote." },
  booking_created: { title: "Booking processing started", message: "Your TISA booking has been created and is being processed." },
  booking_status: { title: "Booking updated", message: "Your booking status has changed." },
  travel_ready: { title: "Travel ready", message: "Your TISA travel arrangements are ready." },
  request_message: { title: "New message from TISA", message: "You have a new message from the TISA team." },
} as const;
