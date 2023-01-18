require("dotenv").config();
const fetch = require("node-fetch");
const { XMLParser} = require("fast-xml-parser");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;


// Static React frontend 
app.use(express.static("frontend/build"));

app.get("/healthz", (req, res) => {
    res.send("OK");
});
app.get("/ndz-violations", (req, res) => {
    res.send(closestDroneData);
});
app.listen(port, () => {
    console.log(`Birdnest is live, backend listening on port ${port} `);
})

// Store all NDZ violating drone position and pilot data from the last 10 min
let droneData = {};

// Only store the closest drone data from the last 10 min
let closestDroneData = {};

// Range for the NDZ zone
const NDZRange = 100000;

// Get drone data from API
const interval = setInterval( async () => {
    try {
        const droneResponse = await fetch(
            "https://assignments.reaktor.com/birdnest/drones"
        );
        const xmlData = await droneResponse.text();
        const parser = new XMLParser({ ignoreAttributes: false });
        const result = parser.parse(xmlData);

        // Store only NDZ violating drone data

        if (result) {
            
            // Get timestamp for each captured drone
            let capturedTime = result.report.capture["@_snapshotTimestamp"];

            // Loop through each captured drone data
            for (const capturedDrone of result.report.capture.drone) {

                // Calculate drone distance from nest
                const droneDistance = calculateDistance(
                    capturedDrone.positionX, capturedDrone.positionY
                );

                // If drone distance to nest is smaller than 100m, store drone data
                if (droneDistance < NDZRange) {

                    // If violating drone's serial number is already stored,push new violation data into array
                    if(droneData[capturedDrone.serialNumber]) {
                        droneData[capturedDrone.serialNumber].violationData.push({
                            capturedTime: capturedTime,
                            positionX: capturedDrone.positionX,
                            positionY: capturedDrone.positionY,
                            droneDistance: droneDistance,
                            model: capturedDrone.model,
                            manufacturer: capturedDrone.manufacturer,
                        });
                    } 
                    // If no prior violations, create new entry and fetch pilot data
                    else {
                        // Fetch pilot data only for NDZ violating drones
                        const pilotResponse = await fetch(
                            `https://assignments.reaktor.com/birdnest/pilots/${capturedDrone.serialNumber}`
                        );
                        const pilotData = await pilotResponse.json();

                        // Create new drone data object 
                        droneData[capturedDrone.serialNumber] = {
                            pilot: {
                                firstName: pilotData.firstName,
                                lastName: pilotData.lastName,
                                phoneNumber: pilotData.phoneNumber,
                                email: pilotData.email,
                            },
                            violationData: [
                                {
                                    capturedTime: capturedTime,
                                    positionX: capturedDrone.positionX,
                                    positionY: capturedDrone.positionY,
                                    droneDistance: droneDistance,
                                    model: capturedDrone.model,
                                    manufacturer: capturedDrone.manufacturer,
                                },
                            ],
                        };
                    }
                }
            }
        }
        // Delete data older than 10 min regardless of result
        deleteOldData();

        // Only store the closest distance to the nest for NDZ violating drones
        closestDroneData = findClosest();
    }
    catch (e) {
        console.error(e);
    }
    // Try to fetch new drone data every 2 sec
}, 2000);


/**
 * Calculate the distance of the drone from the nest based on XY-coordinates.
 * @param {number} dronePosX X-coordinate for the drone.
 * @param {number} dronePosY Y-coordinate for the drone.
 * @returns Distance of the drone from the nest.
 */
const calculateDistance = (dronePosX, dronePosY) => {
    
    // Position of the nest
    const nestPosX = 250000;
    const nestPosY = 250000;

    // Drone distance from the nest using trigonometry
    const nestDistance = Math.sqrt(
        Math.pow(nestPosX - dronePosX, 2) + Math.pow(nestPosY - dronePosY, 2)
    );

    return nestDistance;
};


/**
 * Deletes drone data that is older than 10 min.
 */
const deleteOldData = () => {
    
    // Time limit for NDZ violation storage (default 10 min)
    const dataLimit = 1000 * 60 * 10;

    // Loop through each serial number in drone data
    Object.keys(droneData).forEach((serialNumber) => {

        // Delete violation data that's older than 10 min
        droneData[serialNumber].violationData = droneData[serialNumber].violationData
            .filter((violation) => {
                // Calculate age of each violation data
                const violationAge = new Date() -  new Date(violation.capturedTime);

                // If violation data is older than 10 min, delete violation data
                if (violationAge > dataLimit) {
                    return false;
                }
                // If not older than 10 min, keep that violation data
                else {
                    return true;
                }
            }
        );
    });

    // Remove drones that have no violation data left from the list
    droneData = Object.keys(droneData)
        .filter((serialNumber) => droneData[serialNumber].violationData.length > 0)
        .reduce((filteredData, serialNumber) => {
            return {...filteredData, [serialNumber]: droneData[serialNumber]};
        }, {});
};



/**
 * Filter drone data to contain only the closest distance to the nest from each drone
 * @returns A new object containing only data of drones closest to the nest.
 */
const findClosest = () => {

    const newDroneData = JSON.parse(JSON.stringify(droneData));

    // Loop through each drone by serial number and filter out other data than the closest distance to nest
    Object.keys(newDroneData).forEach((droneSerialNumber) =>
        (newDroneData[droneSerialNumber].violationData = newDroneData[droneSerialNumber].violationData
        .reduce((previousDrone, currentDrone) => {

            // Return the violation data with the closest distance to nest
            if (previousDrone.droneDistance < currentDrone.droneDistance) {
                return previousDrone
            }
            else {
                return currentDrone
            };
        }))
    );
    return newDroneData;
}