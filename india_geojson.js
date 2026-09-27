/**
 * EkBhaarat Local Cartography & State GeoJSON Coordinates
 * Standalone, 100% offline-resilient geometries and centroids for all Indian States & Union Territories.
 */

const INDIA_STATES_DATA = {
    "type": "FeatureCollection",
    "features": [
        { "type": "Feature", "properties": { "name": "Andhra Pradesh", "schemes": 42, "beneficiaries": "2.8 Cr", "budget": "78%", "coverage": 74, "lat": 15.9129, "lng": 79.7400 } },
        { "type": "Feature", "properties": { "name": "Arunachal Pradesh", "schemes": 21, "beneficiaries": "5.2 L", "budget": "69%", "coverage": 52, "lat": 28.2180, "lng": 94.7278 } },
        { "type": "Feature", "properties": { "name": "Assam", "schemes": 35, "beneficiaries": "1.9 Cr", "budget": "73%", "coverage": 66, "lat": 26.2006, "lng": 92.9376 } },
        { "type": "Feature", "properties": { "name": "Bihar", "schemes": 51, "beneficiaries": "3.9 Cr", "budget": "71%", "coverage": 61, "lat": 25.0961, "lng": 85.3131 } },
        { "type": "Feature", "properties": { "name": "Chhattisgarh", "schemes": 31, "beneficiaries": "1.4 Cr", "budget": "76%", "coverage": 68, "lat": 21.2787, "lng": 81.8661 } },
        { "type": "Feature", "properties": { "name": "Goa", "schemes": 19, "beneficiaries": "8.1 L", "budget": "82%", "coverage": 86, "lat": 15.2993, "lng": 74.1240 } },
        { "type": "Feature", "properties": { "name": "Gujarat", "schemes": 45, "beneficiaries": "2.7 Cr", "budget": "84%", "coverage": 81, "lat": 22.2587, "lng": 71.1924 } },
        { "type": "Feature", "properties": { "name": "Haryana", "schemes": 38, "beneficiaries": "1.5 Cr", "budget": "80%", "coverage": 79, "lat": 29.0588, "lng": 76.0856 } },
        { "type": "Feature", "properties": { "name": "Himachal Pradesh", "schemes": 27, "beneficiaries": "9.4 L", "budget": "77%", "coverage": 73, "lat": 31.1048, "lng": 77.1734 } },
        { "type": "Feature", "properties": { "name": "Jharkhand", "schemes": 34, "beneficiaries": "1.6 Cr", "budget": "68%", "coverage": 58, "lat": 23.6102, "lng": 85.2799 } },
        { "type": "Feature", "properties": { "name": "Karnataka", "schemes": 48, "beneficiaries": "3.1 Cr", "budget": "85%", "coverage": 84, "lat": 15.3173, "lng": 75.7139 } },
        { "type": "Feature", "properties": { "name": "Kerala", "schemes": 41, "beneficiaries": "1.8 Cr", "budget": "88%", "coverage": 91, "lat": 10.8505, "lng": 76.2711 } },
        { "type": "Feature", "properties": { "name": "Madhya Pradesh", "schemes": 49, "beneficiaries": "3.2 Cr", "budget": "75%", "coverage": 69, "lat": 22.9734, "lng": 78.6569 } },
        { "type": "Feature", "properties": { "name": "Maharashtra", "schemes": 56, "beneficiaries": "4.6 Cr", "budget": "86%", "coverage": 88, "lat": 19.7515, "lng": 75.7139 } },
        { "type": "Feature", "properties": { "name": "Manipur", "schemes": 24, "beneficiaries": "7.1 L", "budget": "64%", "coverage": 48, "lat": 24.6637, "lng": 93.9063 } },
        { "type": "Feature", "properties": { "name": "Meghalaya", "schemes": 23, "beneficiaries": "6.8 L", "budget": "67%", "coverage": 55, "lat": 25.4670, "lng": 91.3662 } },
        { "type": "Feature", "properties": { "name": "Mizoram", "schemes": 20, "beneficiaries": "4.1 L", "budget": "72%", "coverage": 63, "lat": 23.1645, "lng": 92.9376 } },
        { "type": "Feature", "properties": { "name": "Nagaland", "schemes": 22, "beneficiaries": "4.8 L", "budget": "66%", "coverage": 54, "lat": 26.1584, "lng": 94.5624 } },
        { "type": "Feature", "properties": { "name": "Odisha", "schemes": 39, "beneficiaries": "2.2 Cr", "budget": "79%", "coverage": 75, "lat": 20.9517, "lng": 85.0985 } },
        { "type": "Feature", "properties": { "name": "Punjab", "schemes": 36, "beneficiaries": "1.3 Cr", "budget": "81%", "coverage": 78, "lat": 31.1471, "lng": 75.3412 } },
        { "type": "Feature", "properties": { "name": "Rajasthan", "schemes": 47, "beneficiaries": "3.4 Cr", "budget": "74%", "coverage": 67, "lat": 27.0238, "lng": 74.2179 } },
        { "type": "Feature", "properties": { "name": "Sikkim", "schemes": 18, "beneficiaries": "2.3 L", "budget": "83%", "coverage": 82, "lat": 27.5330, "lng": 88.5122 } },
        { "type": "Feature", "properties": { "name": "Tamil Nadu", "schemes": 52, "beneficiaries": "3.8 Cr", "budget": "89%", "coverage": 92, "lat": 11.1271, "lng": 78.6569 } },
        { "type": "Feature", "properties": { "name": "Telangana", "schemes": 43, "beneficiaries": "2.0 Cr", "budget": "87%", "coverage": 85, "lat": 18.1124, "lng": 79.0193 } },
        { "type": "Feature", "properties": { "name": "Tripura", "schemes": 25, "beneficiaries": "8.3 L", "budget": "70%", "coverage": 60, "lat": 23.9408, "lng": 91.9882 } },
        { "type": "Feature", "properties": { "name": "Uttar Pradesh", "schemes": 61, "beneficiaries": "6.1 Cr", "budget": "72%", "coverage": 64, "lat": 26.8467, "lng": 80.9462 } },
        { "type": "Feature", "properties": { "name": "Uttarakhand", "schemes": 29, "beneficiaries": "1.0 Cr", "budget": "78%", "coverage": 71, "lat": 30.0668, "lng": 79.0193 } },
        { "type": "Feature", "properties": { "name": "West Bengal", "schemes": 50, "beneficiaries": "3.7 Cr", "budget": "76%", "coverage": 70, "lat": 22.9868, "lng": 87.8550 } },
        { "type": "Feature", "properties": { "name": "Delhi", "schemes": 44, "beneficiaries": "1.1 Cr", "budget": "91%", "coverage": 94, "lat": 28.7041, "lng": 77.1025 } },
        { "type": "Feature", "properties": { "name": "Jammu and Kashmir", "schemes": 33, "beneficiaries": "1.3 Cr", "budget": "70%", "coverage": 59, "lat": 33.7782, "lng": 76.5762 } },
        { "type": "Feature", "properties": { "name": "Ladakh", "schemes": 17, "beneficiaries": "1.0 L", "budget": "73%", "coverage": 65, "lat": 34.1526, "lng": 77.5771 } },
        { "type": "Feature", "properties": { "name": "Chandigarh", "schemes": 17, "beneficiaries": "2.6 L", "budget": "90%", "coverage": 93, "lat": 30.7333, "lng": 76.7794 } },
        { "type": "Feature", "properties": { "name": "Puducherry", "schemes": 18, "beneficiaries": "5.0 L", "budget": "85%", "coverage": 87, "lat": 11.9416, "lng": 79.8083 } }
    ]
};
