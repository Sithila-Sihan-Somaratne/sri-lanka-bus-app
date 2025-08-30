'''Sample bus route data for Sri Lanka'''
busRoutes = [
  {
    "id": "138",
    "name": "Pettah - Homagama",
    "origin": "Pettah",
    "destination": "Homagama",
    "fare": 50,
    "duration": 90,
    "frequency": 10,
    "type": "regular",
    "stops": [
        { "id": "p1", "name": "Pettah", "lat": 6.9340, "lng": 79.8502, "order": 1 },
        { "id": "f1", "name": "Fort", "lat": 6.9364, "lng": 79.8465, "order": 2 },
        { "id": "lh1", "name": "Lake House", "lat": 6.9323, "lng": 79.8473, "order": 3 },
        { "id": "si1", "name": "Slave Island", "lat": 6.9257, "lng": 79.8503, "order": 4 },
        { "id": "ib1", "name": "Ibbanwala Junction", "lat": 6.9181, "lng": 79.8625, "order": 5 },
        { "id": "th1", "name": "Town Hall", "lat": 6.9168, "lng": 79.8631, "order": 6 },
        { "id": "tm1", "name": "Thummulla", "lat": 6.8957, "lng": 79.8605, "order": 7 },
        { "id": "tj1", "name": "Thimbirigasyaya Junction", "lat": 6.9211, "lng": 79.8698, "order": 8 },
        { "id": "hc1", "name": "Havelock City", "lat": 6.8829, "lng": 79.8688, "order": 9 },
        { "id": "kp1", "name": "Kirulapone", "lat": 6.8786, "lng": 79.8755, "order": 10 },
        { "id": "ng1", "name": "Nugegoda", "lat": 6.8717, "lng": 79.8898, "order": 11 },
        { "id": "dl1", "name": "Delkanda", "lat": 6.8600, "lng": 79.9000, "order": 12 },
        { "id": "nv1", "name": "Navinna", "lat": 6.8525, "lng": 79.9169, "order": 13 },
        { "id": "mh1", "name": "Maharagama", "lat": 6.8482, "lng": 79.9254, "order": 14 },
        { "id": "pp1", "name": "Pannipitiya", "lat": 6.8454, "lng": 79.9434, "order": 15 },
        { "id": "kt1", "name": "Kottawa", "lat": 6.8408, "lng": 79.9639, "order": 16 },
        { "id": "hm1", "name": "Homagama", "lat": 6.8420, "lng": 80.0033, "order": 17 }
    ],
    "coordinates": [
        [6.9340, 79.8502],
        [6.9364, 79.8465],
        [6.9323, 79.8473],
        [6.9257, 79.8503],
        [6.9181, 79.8625],
        [6.9168, 79.8631],
        [6.8957, 79.8605],
        [6.9211, 79.8698],
        [6.8829, 79.8688],
        [6.8786, 79.8755],
        [6.8717, 79.8898],
        [6.8600, 79.9000],
        [6.8525, 79.9169],
        [6.8482, 79.9254],
        [6.8454, 79.9434],
        [6.8408, 79.9639],
        [6.8420, 80.0033]
    ]
  },
  {
    "id": "193",
    "name": "Town Hall - Kadawatha",
    "origin": "Town Hall",
    "destination": "Kadawatha",
    "fare": 30,
    "duration": 45,
    "frequency": 20,
    "type": "regular",
    "stops": [
      { "id": "th1", "name": "Town Hall", "lat": 6.9168, "lng": 79.8631, "order": 1 },
      { "id": "th2", "name": "Borella", "lat": 6.9200, "lng": 79.8700, "order": 2 },
      { "id": "th3", "name": "Rajagiriya", "lat": 6.9100, "lng": 79.8900, "order": 3 },
      { "id": "th4", "name": "Battaramulla", "lat": 6.8950, "lng": 79.9200, "order": 4 },
      { "id": "th5", "name": "Kaduwela", "lat": 6.9333, "lng": 79.9833, "order": 5 },
      { "id": "th6", "name": "Kadawatha", "lat": 7.0167, "lng": 79.9500, "order": 6 }
    ],
    "coordinates": [
      [6.9168, 79.8631], # Town Hall
      [6.9160, 79.8670],
      [6.9180, 79.8685],
      [6.9200, 79.8700], # Borella
      [6.9180, 79.8750],
      [6.9160, 79.8800],
      [6.9140, 79.8850],
      [6.9120, 79.8880],
      [6.9100, 79.8900], # Rajagiriya
      [6.9080, 79.9000],
      [6.9050, 79.9100],
      [6.9000, 79.9150],
      [6.8950, 79.9200], # Battaramulla
      [6.9000, 79.9300],
      [6.9100, 79.9500],
      [6.9200, 79.9650],
      [6.9250, 79.9700],
      [6.9300, 79.9750],
      [6.9333, 79.9833], # Kaduwela
      [6.9500, 79.9700],
      [6.9700, 79.9600],
      [6.9900, 79.9550],
      [7.0000, 79.9520],
      [7.0100, 79.9510],
      [7.0167, 79.9500]  # Kadawatha
    ]
  },
  {
    "id": "EX1-1",
    "name": "Makumbara - Matara (Express)",
    "origin": "Makumbara",
    "destination": "Matara",
    "fare": 150,
    "duration": 180,
    "frequency": 30,
    "type": "express",
    "stops": [
      { "id": "ex1", "name": "Makumbara", "lat": 6.9344, "lng": 79.8428, "order": 1 },
      { "id": "ex2", "name": "Kalutara", "lat": 6.5854, "lng": 79.9607, "order": 2 },
      { "id": "ex3", "name": "Aluthgama", "lat": 6.4281, "lng": 80.0037, "order": 3 },
      { "id": "ex4", "name": "Galle", "lat": 6.0535, "lng": 80.2210, "order": 4 },
      { "id": "ex5", "name": "Matara", "lat": 5.9549, "lng": 80.5550, "order": 5 }
    ],
    "coordinates": [
      [6.9344, 79.8428], # Makumbara (Colombo)
      [6.8500, 79.8800],
      [6.7500, 79.9200],
      [6.6500, 79.9500],
      [6.5854, 79.9607], # Kalutara
      [6.5000, 79.9800],
      [6.4500, 80.0000],
      [6.4281, 80.0037], # Aluthgama
      [6.3500, 80.0500],
      [6.2500, 80.1000],
      [6.1500, 80.1500],
      [6.0535, 80.2210], # Galle
      [6.0200, 80.3000],
      [5.9800, 80.4000],
      [5.9600, 80.5000],
      [5.9549, 80.5550]  # Matara
    ]
  }
]

cities = [
  { "name": "Colombo", "lat": 6.9271, "lng": 79.8612 },
  { "name": "Fort", "lat": 6.9344, "lng": 79.8428 },
  { "name": "Pettah", "lat": 6.9344, "lng": 79.8428 },
  { "name": "Kadawatha", "lat": 7.0167, "lng": 79.9500 },
  { "name": "Town Hall", "lat": 6.9147, "lng": 79.8656 },
  { "name": "Kandy", "lat": 7.2906, "lng": 80.6337 },
  { "name": "Galle", "lat": 6.0535, "lng": 80.2210 },
  { "name": "Matara", "lat": 5.9549, "lng": 80.5550 },
  { "name": "Negombo", "lat": 7.2083, "lng": 79.8358 },
  { "name": "Kalutara", "lat": 6.5854, "lng": 79.9607 },
  { "name": "Ratnapura", "lat": 6.6828, "lng": 80.4003 },
  { "name": "Anuradhapura", "lat": 8.3114, "lng": 80.4037 },
  { "name": "Jaffna", "lat": 9.6615, "lng": 80.0255 },
  { "name": "Batticaloa", "lat": 7.7102, "lng": 81.7088 },
  { "name": "Trincomalee", "lat": 8.5874, "lng": 81.2152 }
]
