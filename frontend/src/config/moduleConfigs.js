/**
 * Central schema configuration for the Airport Management System modules.
 * This file is the single source of truth for the entire frontend system.
 * Adding, removing, or modifying fields here dynamically updates tables, forms, filters, and lookups.
 */
export const moduleConfigs = {
  passengers: {
    title: 'Passengers',
    singularTitle: 'Passenger',
    primaryKey: 'passenger_id',
    apiEndpoint: '/api/passengers',
    icon: 'Users',
    searchPlaceholder: 'Search name, passport, nationality, email...',
    fields: [
      {
        name: 'passenger_id',
        label: 'ID',
        type: 'number',
        readOnly: true,
        showInTable: true,
        showInForm: false,
      },
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter full name',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          minLength: 2,
          maxLength: 100
        }
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        placeholder: 'Enter age',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          min: 0,
          max: 120
        }
      },
      {
        name: 'gender',
        label: 'Gender',
        type: 'select',
        options: ['Male', 'Female', 'Other'],
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'passport_number',
        label: 'Passport Number',
        type: 'text',
        placeholder: 'e.g. US1234567',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          pattern: '^[A-Z0-9]{6,15}$',
          patternMessage: 'Must be 6-15 uppercase alphanumeric characters'
        }
      },
      {
        name: 'nationality',
        label: 'Nationality',
        type: 'text',
        placeholder: 'e.g. American',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'e.g. +15550199',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'name@example.com',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          patternMessage: 'Must be a valid email address'
        }
      }
    ]
  },
  flights: {
    title: 'Flights',
    singularTitle: 'Flight',
    primaryKey: 'flight_id',
    apiEndpoint: '/api/flights',
    icon: 'Plane',
    searchPlaceholder: 'Search flight name, source, destination...',
    fields: [
      {
        name: 'flight_id',
        label: 'ID',
        type: 'number',
        readOnly: true,
        showInTable: true,
        showInForm: false
      },
      {
        name: 'flight_name',
        label: 'Flight Number',
        type: 'text',
        placeholder: 'e.g. AI-101',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'source',
        label: 'Source City',
        type: 'text',
        placeholder: 'Departure city',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'destination',
        label: 'Destination City',
        type: 'text',
        placeholder: 'Arrival city',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'departure_time',
        label: 'Departure Time',
        type: 'datetime-local',
        required: true,
        showInTable: true,
        showInForm: true,
        format: (val) => val ? new Date(val).toLocaleString() : ''
      },
      {
        name: 'arrival_time',
        label: 'Arrival Time',
        type: 'datetime-local',
        required: true,
        showInTable: true,
        showInForm: true,
        format: (val) => val ? new Date(val).toLocaleString() : ''
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['Scheduled', 'On Time', 'Delayed', 'Departed', 'Arrived', 'Cancelled'],
        required: true,
        defaultValue: 'Scheduled',
        showInTable: true,
        showInForm: true
      }
    ]
  },
  tickets: {
    title: 'Ticket Bookings',
    singularTitle: 'Ticket',
    primaryKey: 'ticket_id',
    apiEndpoint: '/api/tickets',
    icon: 'Ticket',
    searchPlaceholder: 'Search seat or class type...',
    fields: [
      {
        name: 'ticket_id',
        label: 'ID',
        type: 'number',
        readOnly: true,
        showInTable: true,
        showInForm: false
      },
      {
        name: 'passenger_id',
        label: 'Passenger',
        type: 'lookup',
        lookupModule: 'passengers',
        lookupLabelField: 'name',
        required: true,
        showInTable: false,
        showInForm: true
      },
      {
        name: 'passenger_name_display',
        label: 'Passenger Name',
        type: 'text',
        showInTable: true,
        showInForm: false,
        derived: true,
        getValue: (row) => row.passenger ? row.passenger.name : 'Unknown'
      },
      {
        name: 'flight_id',
        label: 'Flight',
        type: 'lookup',
        lookupModule: 'flights',
        lookupLabelField: 'flight_name',
        required: true,
        showInTable: false,
        showInForm: true
      },
      {
        name: 'flight_name_display',
        label: 'Flight Number',
        type: 'text',
        showInTable: true,
        showInForm: false,
        derived: true,
        getValue: (row) => row.flight ? row.flight.flight_name : 'Unknown'
      },
      {
        name: 'flight_route_display',
        label: 'Route',
        type: 'text',
        showInTable: true,
        showInForm: false,
        derived: true,
        getValue: (row) => row.flight ? `${row.flight.source} ➔ ${row.flight.destination}` : 'N/A'
      },
      {
        name: 'seat_number',
        label: 'Seat Number',
        type: 'text',
        placeholder: 'e.g. 12A',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'class_type',
        label: 'Class',
        type: 'select',
        options: ['Economy', 'Business', 'First Class'],
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'booking_date',
        label: 'Booking Date',
        type: 'date',
        required: true,
        showInTable: true,
        showInForm: true,
        defaultValue: () => new Date().toISOString().split('T')[0]
      },
      {
        name: 'ticket_price',
        label: 'Ticket Price ($)',
        type: 'number',
        placeholder: 'Price in USD',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          min: 0
        },
        format: (val) => val ? `$${parseFloat(val).toFixed(2)}` : ''
      }
    ]
  },
  staff: {
    title: 'Staff Management',
    singularTitle: 'Staff Member',
    primaryKey: 'staff_id',
    apiEndpoint: '/api/staff',
    icon: 'ShieldAlert',
    searchPlaceholder: 'Search name, role, department...',
    fields: [
      {
        name: 'staff_id',
        label: 'ID',
        type: 'number',
        readOnly: true,
        showInTable: true,
        showInForm: false
      },
      {
        name: 'name',
        label: 'Staff Name',
        type: 'text',
        placeholder: 'Enter name',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'role',
        label: 'Role',
        type: 'text',
        placeholder: 'e.g. Pilot, Security, Air Traffic Controller',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'department',
        label: 'Department',
        type: 'select',
        options: ['Flight Operations', 'Engineering', 'Ground Staff', 'Airport Security', 'Control Tower', 'Administration'],
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'salary',
        label: 'Salary ($)',
        type: 'number',
        placeholder: 'Annual salary in USD',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          min: 0
        },
        format: (val) => val ? `$${parseFloat(val).toLocaleString()}` : ''
      },
      {
        name: 'shift_timing',
        label: 'Shift Timing',
        type: 'select',
        options: ['Morning Shift', 'Evening Shift', 'Night Shift', 'Mixed Shift'],
        required: true,
        showInTable: true,
        showInForm: true
      }
    ]
  },
  airports: {
    title: 'Airports',
    singularTitle: 'Airport',
    primaryKey: 'airport_id',
    apiEndpoint: '/api/airports',
    icon: 'Building',
    searchPlaceholder: 'Search airport name, city, country...',
    fields: [
      {
        name: 'airport_id',
        label: 'ID',
        type: 'number',
        readOnly: true,
        showInTable: true,
        showInForm: false
      },
      {
        name: 'airport_name',
        label: 'Airport Name',
        type: 'text',
        placeholder: 'e.g. London Heathrow Airport',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'Airport city',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'country',
        label: 'Country',
        type: 'text',
        placeholder: 'Airport country',
        required: true,
        showInTable: true,
        showInForm: true
      },
      {
        name: 'runway_count',
        label: 'Runway Count',
        type: 'number',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          min: 1
        }
      },
      {
        name: 'terminal_count',
        label: 'Terminal Count',
        type: 'number',
        required: true,
        showInTable: true,
        showInForm: true,
        validation: {
          min: 1
        }
      }
    ]
  }
};
