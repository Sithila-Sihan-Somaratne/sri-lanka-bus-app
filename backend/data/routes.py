# Sample bus route data for Sri Lanka
busRoutes = [
    {
        "id": "01",
        "name": "Colombo Fort - Kandy",
        "origin": "Colombo Fort",
        "destination": "Kandy",
        "fare": 740,
        "duration": 250,
        "frequency": 10,
        "type": "luxury",
        "stops": [
            { "id": "f1", "name": "Colombo Fort", "lat": 6.9373, "lng": 79.8471, "order": 1 },
            { "id": "pl1", "name": "Peliyagoda", "lat": 6.9355, "lng": 79.8848, "order": 2 },
            { "id": "ne1", "name": "Neludeniya", "lat": 7.2349, "lng": 80.2632, "order": 3 },
            { "id": "ke1", "name": "Kegalle", "lat": 7.2533, "lng": 80.3448, "order": 4 },
            { "id": "ka1", "name": "Kandy", "lat": 7.2898, "lng": 80.6311, "order": 5 }
        ]
    },
    {
        "id": "87",
        "name": "Colombo Fort - Jaffna",
        "origin": "Colombo Fort",
        "destination": "Jaffna",
        "fare": 1719,
        "duration": 375,
        "frequency": 10,
        "type": "semi-luxury",
        "stops": [
            { "id": "f1", "name": "Colombo Fort", "lat": 6.9373, "lng": 79.8471, "order": 1 },
            { "id": "ch1", "name": "Chilaw", "lat": 7.5769, "lng": 79.7961, "order": 2 },
            { "id": "pu1", "name": "Puttalam", "lat": 8.0281, "lng": 79.8333, "order": 3 },
            { "id": "an1", "name": "Anuradhapura", "lat": 8.3231, "lng": 80.4028, "order": 4 },
            { "id": "ja1", "name": "Jaffna", "lat": 9.6668, "lng": 80.0120, "order": 5 }
        ]
    },
    {
        "id": "138",
        "name": "Colombo Pettah - Homagama",
        "origin": "Colombo Pettah",
        "destination": "Homagama",
        "fare": 2200,
        "duration": 50,
        "frequency": 10,
        "type": "luxury",
        "stops": [
            { "id": "p1", "name": "Colombo Pettah", "lat": 6.9340, "lng": 79.8502, "order": 1 },
            { "id": "f1", "name": "Colombo Fort", "lat": 6.9364, "lng": 79.8465, "order": 2 },
            { "id": "lh1", "name": "Lake House", "lat": 6.9323, "lng": 79.8473, "order": 3 },
            { "id": "si1", "name": "Slave Island", "lat": 6.9257, "lng": 79.8503, "order": 4 },
            { "id": "ib1", "name": "Ibbanwala Junction", "lat": 6.9181, "lng": 79.8625, "order": 5 },
            { "id": "th1", "name": "Colombo Town Hall", "lat": 6.9168, "lng": 79.8631, "order": 6 },
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
        ]
    },
    {
        "id": "193",
        "name": "Colombo Town Hall - Kadawatha",
        "origin": "Colombo Town Hall",
        "destination": "Kadawatha",
        "fare": 2300,
        "duration": 35,
        "frequency": 10,
        "type": "regular",
        "stops": [
            { "id": "th1", "name": "Colombo Town Hall", "lat": 6.9168, "lng": 79.8631, "order": 1 },
            { "id": "th2", "name": "Borella", "lat": 6.9150, "lng": 79.8780, "order": 2 },
            { "id": "th3", "name": "Rajagiriya", "lat": 6.9101, "lng": 79.8944, "order": 3 },
            { "id": "th4", "name": "Battaramulla", "lat": 6.9020, "lng": 79.9174, "order": 4 },
            { "id": "th5", "name": "Kaduwela", "lat": 6.9363, "lng": 79.9833, "order": 5 },
            { "id": "th6", "name": "Kadawatha", "lat": 7.0052, "lng": 79.9546, "order": 6 }
        ]
    },
    {
        "id": "EX1-1",
        "name": "Makumbara - Matara (Express)",
        "origin": "Makumbara",
        "destination": "Matara",
        "fare": 970,
        "duration": 105,
        "frequency": 10,
        "type": "express",
        "stops": [
            { "id": "ex1", "name": "Makumbara", "lat": 6.8730, "lng": 79.9390, "order": 1 },
            { "id": "ex2", "name": "Kalutara", "lat": 6.5844, "lng": 79.9604, "order": 2 },
            { "id": "ex3", "name": "Aluthgama", "lat": 6.4320, "lng": 79.9984, "order": 3 },
            { "id": "ex4", "name": "Galle", "lat": 6.0329, "lng": 80.2158, "order": 4 },
            { "id": "ex5", "name": "Matara", "lat": 5.9431, "lng": 80.5490, "order": 5 }
        ]
    }
]

cities = [
    { "name": "Colombo Fort", "lat": 6.9373, "lng": 79.8471 },
    { "name": "Colombo Pettah", "lat": 6.9340, "lng": 79.8502 },
    { "name": "Makumbara", "lat": 6.8730, "lng": 79.9390 },
    { "name": "Kadawatha", "lat": 7.0052, "lng": 79.9546 },
    { "name": "Colombo Town Hall", "lat": 6.9147, "lng": 79.8656 },
    { "name": "Aluthgama", "lat": 6.4320, "lng": 79.9984 },
    { "name": "Kandy", "lat": 7.2898, "lng": 80.6311 },
    { "name": "Galle", "lat": 6.0329, "lng": 80.2158 },
    { "name": "Matara", "lat": 5.9431, "lng": 80.5490 },
    { "name": "Negombo", "lat": 7.2053, "lng": 79.8412 },
    { "name": "Kalutara", "lat": 6.5844, "lng": 79.9604 },
    { "name": "Ratnapura", "lat": 6.6834, "lng": 80.4021 },
    { "name": "Anuradhapura", "lat": 8.3231, "lng": 80.4028 },
    { "name": "Jaffna", "lat": 9.6668, "lng": 80.0120 },
    { "name": "Batticaloa", "lat": 7.7146, "lng": 81.6947 },
    { "name": "Trincomalee", "lat": 8.5767, "lng": 81.2351 },
    { "name": "Kalutara", "lat": 6.5844, "lng": 79.9604 },
    { "name": "Homagama", "lat": 6.8420, "lng": 80.0033 },
    { "name": "Kaduwela", "lat": 6.9363, "lng": 79.9833 },
    { "name": "Maharagama", "lat": 6.8482, "lng": 79.9254 },
    { "name": "Nugegoda", "lat": 6.8717, "lng": 79.8898 },
    { "name": "Kottawa", "lat": 6.8408, "lng": 79.9639 },
    { "name": "Pannipitiya", "lat": 6.8454, "lng": 79.9434 },
    { "name": "Kirulapone", "lat": 6.8786, "lng": 79.8755 },
    { "name": "Battaramulla", "lat": 6.9020, "lng": 79.9174 },
    { "name": "Rajagiriya", "lat": 6.9101, "lng": 79.8944 },
    { "name": "Borella", "lat": 6.9150, "lng": 79.8780 },
    { "name": "Peliyagoda", "lat": 6.9355, "lng": 79.8848 },
    { "name": "Neludeniya", "lat": 7.2349, "lng": 80.2632 },
    { "name": "Kegalle", "lat": 7.2533, "lng": 80.3448 },
    { "name": "Ibbanwala Junction", "lat": 6.9181, "lng": 79.8625 },
    { "name": "Thummulla", "lat": 6.8957, "lng": 79.8605 },
    { "name": "Thimbirigasyaya Junction", "lat": 6.9211, "lng": 79.8698 },
    { "name": "Havelock City", "lat": 6.8829, "lng": 79.8688 },
    { "name": "Delkanda", "lat": 6.8600, "lng": 79.9000 },
    { "name": "Navinna", "lat": 6.8525, "lng": 79.9169 },
    { "name": "Lake House", "lat": 6.9323, "lng": 79.8473 },
    { "name": "Slave Island", "lat": 6.9257, "lng": 79.8503 }
]
