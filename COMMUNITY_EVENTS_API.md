# Community Events API Documentation

## Overview

This API endpoint is specifically designed to retrieve programs from the "Community Event" category, which includes community-based events, workshops, and activities that promote drug prevention awareness and support recovery efforts.

## Endpoint

```
GET /api/programs/community-events
```

## Description

Returns all active programs from the Community Event category (category_id: 18) with additional metadata specific to community events.

## Authentication

No authentication required - this is a public endpoint.

## Request

### Method
`GET`

### URL
```
http://localhost:3000/api/programs/community-events
```

### Headers
- Content-Type: application/json

### Query Parameters
None required.

## Response

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "program_id": 25,
      "img_link": "/uploads/program-images/default-community.png",
      "title": "Community Prevention Fair",
      "description": "Interactive community event featuring prevention education booths, resource sharing, and family-friendly activities to build awareness and support networks",
      "create_by": 1,
      "status": "active",
      "age_group": "All Ages",
      "create_at": "2024-01-20T10:00:00.000Z",
      "category_id": 18,
      "creator": {
        "user_id": 1,
        "role": "admin",
        "email": "admin@drugprevention.com"
      },
      "category": {
        "category_id": 18,
        "name": "Community Event",
        "description": "Community-based events, workshops, and activities that promote drug prevention awareness and support recovery efforts"
      },
      "enrollments": [],
      "contents": [
        {
          "content_id": 97,
          "title": "Planning Your Community Prevention Fair",
          "type": "article",
          "orders": 1,
          "content_file_link": "/content/markdown/community-prevention-fair.md",
          "content_type": "markdown"
        },
        {
          "content_id": 98,
          "title": "Engaging Activities for All Ages",
          "type": "article",
          "orders": 2,
          "content_file_link": "/content/markdown/prevention-fair-activities.md",
          "content_type": "markdown"
        }
      ],
      "event_metadata": {
        "total_enrollments": 0,
        "total_contents": 2,
        "is_community_event": true,
        "event_type": "community_fair"
      }
    },
    {
      "program_id": 26,
      "img_link": "/uploads/program-images/default-community.png",
      "title": "Recovery Walk & Support Rally",
      "description": "Community walking event to show solidarity with those in recovery, reduce stigma, and connect families with local support resources",
      "create_by": 1,
      "status": "active",
      "age_group": "All Ages",
      "create_at": "2024-01-20T10:00:00.000Z",
      "category_id": 18,
      "creator": {
        "user_id": 1,
        "role": "admin",
        "email": "admin@drugprevention.com"
      },
      "category": {
        "category_id": 18,
        "name": "Community Event",
        "description": "Community-based events, workshops, and activities that promote drug prevention awareness and support recovery efforts"
      },
      "enrollments": [],
      "contents": [
        {
          "content_id": 99,
          "title": "Organizing a Recovery Support Walk",
          "type": "article",
          "orders": 1,
          "content_file_link": "/content/markdown/recovery-walk-guide.md",
          "content_type": "markdown"
        },
        {
          "content_id": 100,
          "title": "Building Community Support Networks",
          "type": "article",
          "orders": 2,
          "content_file_link": "/content/markdown/community-support-networks.md",
          "content_type": "markdown"
        }
      ],
      "event_metadata": {
        "total_enrollments": 0,
        "total_contents": 2,
        "is_community_event": true,
        "event_type": "outdoor_event"
      }
    }
  ],
  "count": 2,
  "category": "Community Event",
  "message": "Community Event programs retrieved successfully"
}
```

### Error Response (500)

```json
{
  "success": false,
  "message": "Failed to retrieve Community Event programs",
  "error": "Database connection error or other internal error message"
}
```

## Response Fields

### Main Response
- `success` (boolean): Indicates if the request was successful
- `data` (array): Array of community event program objects
- `count` (number): Number of programs returned
- `category` (string): Always "Community Event" for this endpoint
- `message` (string): Success message

### Program Object Fields
- `program_id` (number): Unique identifier for the program
- `img_link` (string): URL/path to the program image
- `title` (string): Program title
- `description` (string): Program description
- `create_by` (number): User ID of program creator
- `status` (string): Program status (only "active" programs are returned)
- `age_group` (string): Target age group for the program
- `create_at` (string): ISO timestamp of when the program was created
- `category_id` (number): Always 18 for Community Event category
- `creator` (object): Information about the program creator
- `category` (object): Category information
- `enrollments` (array): List of user enrollments in this program
- `contents` (array): List of content items in this program
- `event_metadata` (object): Additional metadata specific to community events

### Event Metadata Fields
- `total_enrollments` (number): Total number of users enrolled in this program
- `total_contents` (number): Total number of content items in this program
- `is_community_event` (boolean): Always true for this endpoint
- `event_type` (string): Type of event ("community_fair" or "outdoor_event")

## Usage Examples

### JavaScript (Fetch API)
```javascript
// Get all community event programs
fetch('http://localhost:3000/api/programs/community-events')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Community events:', data.data);
      console.log('Total events found:', data.count);
    }
  })
  .catch(error => console.error('Error:', error));
```

### JavaScript (Axios)
```javascript
// Using axios
axios.get('http://localhost:3000/api/programs/community-events')
  .then(response => {
    const { data, count, category } = response.data;
    console.log(`Found ${count} programs in ${category} category`);
    data.forEach(program => {
      console.log(`- ${program.title}: ${program.description}`);
    });
  })
  .catch(error => console.error('Error:', error));
```

### React Component Example
```jsx
import React, { useState, useEffect } from 'react';

const CommunityEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunityEvents = async () => {
      try {
        const response = await fetch('/api/programs/community-events');
        const result = await response.json();
        
        if (result.success) {
          setEvents(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch community events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityEvents();
  }, []);

  if (loading) return <div>Loading community events...</div>;

  return (
    <div>
      <h2>Community Events ({events.length})</h2>
      {events.map(event => (
        <div key={event.program_id} className="event-card">
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <div className="event-meta">
            <span>Age Group: {event.age_group}</span>
            <span>Contents: {event.event_metadata.total_contents}</span>
            <span>Type: {event.event_metadata.event_type}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommunityEvents;
```

## Related Endpoints

For comparison, here are other related program endpoints:

- `GET /api/programs` - Get all programs
- `GET /api/programs/category/:categoryId` - Get programs by any category ID
- `GET /api/programs/:id` - Get a specific program by ID
- `GET /api/categories/18/programs` - Alternative way to get Community Event programs via category endpoint

## Notes

1. This endpoint only returns **active** programs from the Community Event category
2. The `event_metadata` field is unique to this endpoint and provides additional context for community events
3. The `event_type` is automatically determined based on the program title (programs with "walk" in the title are classified as "outdoor_event", others as "community_fair")
4. Content files referenced in the response are markdown files that can be accessed via the content API endpoints
5. All Community Event programs are designed to have 2 content items or fewer, making them concise and actionable 