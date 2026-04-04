const express = require('express');
const router = express.Router();

// Sample properties data
let properties = [
  {
    id: 1,
    hostId: 3, // John Host
    title: 'Luxury Downtown Apartment',
    description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.',
    type: 'Apartment',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 150,
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Parking', 'Gym', 'Pool'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    availability: true,
    rating: 4.8,
    reviewCount: 127,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-03-10T15:30:00.000Z'
  },
  {
    id: 2,
    hostId: 3, // John Host
    title: 'Cozy Beach House',
    description: 'Charming beach house just steps from the ocean. Perfect for a relaxing getaway.',
    type: 'House',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 220,
    address: {
      street: '456 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      zipCode: '33139',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Beach Access', 'Parking', 'BBQ Grill', 'Hot Tub'],
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'
    ],
    availability: true,
    rating: 4.9,
    reviewCount: 89,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-03-12T09:15:00.000Z'
  },
  {
    id: 3,
    hostId: 3, // John Host
    title: 'Mountain Cabin Retreat',
    description: 'Rustic cabin in the mountains with fireplace and hiking trails nearby.',
    type: 'Cabin',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    pricePerNight: 180,
    address: {
      street: '789 Mountain View Road',
      city: 'Aspen',
      state: 'CO',
      zipCode: '81611',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Parking', 'Hiking Trails', 'Mountain View'],
    images: [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ],
    availability: true,
    rating: 4.7,
    reviewCount: 156,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-03-08T14:20:00.000Z'
  },
  {
    id: 4,
    hostId: 4, // Another host
    title: 'Modern Studio in Tech Hub',
    description: 'Contemporary studio apartment in a vibrant tech hub neighborhood. Perfect for business travelers.',
    type: 'Studio',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 95,
    address: {
      street: '321 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Workspace', 'Air Conditioning', 'Laundry'],
    images: [
      'https://images.unsplash.com/photo-1490644658840-ee6db43da12b?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
    ],
    availability: true,
    rating: 4.6,
    reviewCount: 203,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-02-10T10:00:00.000Z',
    updatedAt: '2024-03-11T11:45:00.000Z'
  },
  {
    id: 5,
    hostId: 4,
    title: 'Victorian House Downtown',
    description: 'Historic Victorian house with modern amenities. Close to restaurants and shops.',
    type: 'House',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 280,
    address: {
      street: '654 Heritage Street',
      city: 'Boston',
      state: 'MA',
      zipCode: '02134',
      country: 'USA'
    },
    amenities: ['WiFi', 'Full Kitchen', 'Dining Room', 'Fireplace', 'Garden', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1570129476519-bbf64df27c4f?w=800',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ],
    availability: true,
    rating: 4.9,
    reviewCount: 98,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-01-05T10:00:00.000Z',
    updatedAt: '2024-03-13T16:20:00.000Z'
  },
  {
    id: 6,
    hostId: 5,
    title: 'Desert Oasis Bungalow',
    description: 'Peaceful bungalow in the desert with pool and outdoor seating. Great for relaxation.',
    type: 'Bungalow',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 120,
    address: {
      street: '987 Cactus Road',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85016',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Pool', 'Air Conditioning', 'Patio', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1559400174-641ce0ac8abe?w=800',
      'https://images.unsplash.com/photo-1507237998391-03ea16b03e39?w=800',
      'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?w=800'
    ],
    availability: true,
    rating: 4.5,
    reviewCount: 76,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-02-14T10:00:00.000Z',
    updatedAt: '2024-03-09T13:15:00.000Z'
  },
  {
    id: 7,
    hostId: 5,
    title: 'Lakefront Cottage',
    description: 'Charming cottage with private lake access. Perfect for fishing and water activities.',
    type: 'Cottage',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 200,
    address: {
      street: '147 Lakeside Lane',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98109',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Lake Access', 'Dock', 'Fireplace', 'Boat Included'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800'
    ],
    availability: true,
    rating: 4.8,
    reviewCount: 112,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-03-01T10:00:00.000Z',
    updatedAt: '2024-03-12T10:30:00.000Z'
  },
  {
    id: 8,
    hostId: 6,
    title: 'City Loft with Terrace',
    description: 'Spacious loft with rooftop terrace overlooking the city skyline.',
    type: 'Loft',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 175,
    address: {
      street: '555 Sky Avenue',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'USA'
    },
    amenities: ['WiFi', 'Kitchen', 'Rooftop Terrace', 'Gym', 'Concierge', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'
    ],
    availability: true,
    rating: 4.7,
    reviewCount: 145,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-01-25T10:00:00.000Z',
    updatedAt: '2024-03-10T12:00:00.000Z'
  },
  {
    id: 9,
    hostId: 6,
    title: 'Tropical Garden Villa',
    description: 'Luxurious villa with lush tropical garden and resort-style amenities.',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 350,
    address: {
      street: '222 Paradise Drive',
      city: 'Honolulu',
      state: 'HI',
      zipCode: '96815',
      country: 'USA'
    },
    amenities: ['WiFi', 'Full Kitchen', 'Private Pool', 'Garden', 'Maid Service', 'Concierge'],
    images: [
      'https://images.unsplash.com/photo-1512207736139-a1b66464db19?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
      'https://images.unsplash.com/photo-1570129476519-bbf64df27c4f?w=800'
    ],
    availability: true,
    rating: 4.9,
    reviewCount: 64,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-02-20T10:00:00.000Z',
    updatedAt: '2024-03-13T14:45:00.000Z'
  },
  {
    id: 10,
    hostId: 7,
    title: 'Budget-Friendly Downtown Room',
    description: 'Comfortable private room in downtown. Share bathroom and kitchen. Great for solo travelers.',
    type: 'Room',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 1,
    pricePerNight: 55,
    address: {
      street: '888 Budget Boulevard',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'USA'
    },
    amenities: ['WiFi', 'Shared Kitchen', 'Shared Bathroom', 'Laundry'],
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'
    ],
    availability: true,
    rating: 4.4,
    reviewCount: 234,
    timeAvailability: {
      checkInTime: '15:00',
      checkOutTime: '11:00'
    },
    createdAt: '2024-03-05T10:00:00.000Z',
    updatedAt: '2024-03-13T09:20:00.000Z'
  }
];

// GET /api/properties - Get all properties or filter by host
router.get('/', (req, res) => {
  const { hostId } = req.query;
  
  let filteredProperties = properties;
  
  if (hostId) {
    filteredProperties = properties.filter(p => p.hostId === parseInt(hostId));
  }
  
  res.json({
    properties: filteredProperties,
    total: filteredProperties.length
  });
});

// GET /api/properties/:id - Get single property
router.get('/:id', (req, res) => {
  const propertyId = parseInt(req.params.id);
  const property = properties.find(p => p.id === propertyId);
  
  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }
  
  res.json(property);
});

// POST /api/properties - Create new property
router.post('/', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const hostId = parseInt(token.split('_')[1]);
  
  const newProperty = {
    id: properties.length + 1,
    hostId,
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rating: 0,
    reviewCount: 0,
    availability: true
  };
  
  properties.push(newProperty);
  
  res.status(201).json({
    message: 'Property created successfully',
    property: newProperty
  });
});

// PUT /api/properties/:id - Update property
router.put('/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const hostId = parseInt(token.split('_')[1]);
  const propertyId = parseInt(req.params.id);
  
  const propertyIndex = properties.findIndex(p => p.id === propertyId && p.hostId === hostId);
  
  if (propertyIndex === -1) {
    return res.status(404).json({ message: 'Property not found or access denied' });
  }
  
  properties[propertyIndex] = {
    ...properties[propertyIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  res.json({
    message: 'Property updated successfully',
    property: properties[propertyIndex]
  });
});

// DELETE /api/properties/:id - Delete property
router.delete('/:id', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const hostId = parseInt(token.split('_')[1]);
  const propertyId = parseInt(req.params.id);
  
  const propertyIndex = properties.findIndex(p => p.id === propertyId && p.hostId === hostId);
  
  if (propertyIndex === -1) {
    return res.status(404).json({ message: 'Property not found or access denied' });
  }
  
  properties.splice(propertyIndex, 1);
  
  res.json({ message: 'Property deleted successfully' });
});

module.exports = router;