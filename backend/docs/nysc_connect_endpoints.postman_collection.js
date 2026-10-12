{
    "info": {
      "_postman_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "NYSC Connect - Pilot Locations & Housing API",
      "description": "API contract for NYSC Connect MVP endpoints covering Pilot Locations and Seeded Accommodations.",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "variable": [
      {
        "key": "baseUrl",
        "value": "http://localhost:5000/api/v1",
        "type": "string"
      }
    ],
    "item": [
      {
        "name": "Locations",
        "item": [
          {
            "name": "Get Supported Pilot States",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/locations/states",
                "host": ["{{baseUrl}}"],
                "path": ["locations", "states"]
              }
            },
            "response": []
          },
          {
            "name": "Get Pilot LGAs by State (Lagos)",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/locations/lgas?state=Lagos",
                "host": ["{{baseUrl}}"],
                "path": ["locations", "lgas"],
                "query": [
                  {
                    "key": "state",
                    "value": "Lagos",
                    "description": "Lagos or Oyo"
                  }
                ]
              }
            },
            "response": []
          },
          {
            "name": "Get Pilot LGAs by State (Oyo)",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/locations/lgas?state=Oyo",
                "host": ["{{baseUrl}}"],
                "path": ["locations", "lgas"],
                "query": [
                  {
                    "key": "state",
                    "value": "Oyo"
                  }
                ]
              }
            },
            "response": []
          }
        ]
      },
      {
        "name": "Accommodations (Seeded)",
        "item": [
          {
            "name": "Get Accommodations (Ikeja)",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/accommodations?state=Lagos&lga=Ikeja",
                "host": ["{{baseUrl}}"],
                "path": ["accommodations"],
                "query": [
                  { "key": "state", "value": "Lagos" },
                  { "key": "lga", "value": "Ikeja" }
                ]
              }
            },
            "response": []
          },
          {
            "name": "Get Accommodations (Ibadan North)",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/accommodations?state=Oyo&lga=Ibadan North",
                "host": ["{{baseUrl}}"],
                "path": ["accommodations"],
                "query": [
                  { "key": "state", "value": "Oyo" },
                  { "key": "lga", "value": "Ibadan North" }
                ]
              }
            },
            "response": []
          },
          {
            "name": "Get Accommodations (Kosofe)",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/accommodations?state=Lagos&lga=Kosofe",
                "host": ["{{baseUrl}}"],
                "path": ["accommodations"],
                "query": [
                  { "key": "state", "value": "Lagos" },
                  { "key": "lga", "value": "Kosofe" }
                ]
              }
            },
            "response": []
          },
          {
            "name": "Get Single Accommodation Detail",
            "request": {
              "method": "GET",
              "header": [],
              "url": {
                "raw": "{{baseUrl}}/accommodations/:id",
                "host": ["{{baseUrl}}"],
                "path": ["accommodations", ":id"],
                "variable": [
                  {
                    "key": "id",
                    "value": "REPLACE_WITH_OBJECT_ID",
                    "description": "MongoDB _id from accommodation search"
                  }
                ]
              }
            },
            "response": []
          }
        ]
      }
    ]
  }