import * as React from 'react';
import { useState, useEffect } from 'react';
import { ViolationList, DroneMap } from './components';
import { Container, Typography } from '@mui/material';
import { format } from 'date-fns';


/**
 * Sort data in NDZ violation list by distance to the nest (closest first).
 * @param {*} data Gets data of drones closest to the nest.
 */ 
const sortByClosest = (data) => {
  data.sort( (a, b) => {
    const result = a.minDistance - b.minDistance;
    return result
  })
};

/**
 * Main application.
 * @returns Main application.
 */
function App() {

  const [items, setItems] = useState([]);

  // Get the newest closest drone data to the nest for the NDZ violation list
  useEffect(() => {
    const interval = setInterval( async () => {

      try {
        const dataResponse = await fetch(`${process.env.REACT_APP_BACKEND}/ndz-violations`);
        // Parse data into json
        const closestDroneData = await dataResponse.json();

        if (closestDroneData) {

          // Create an empty array for list items
          const listData = [];

          // Create new object for each violating drone based on serial number
          Object.keys(closestDroneData).forEach((drone) => {
            listData.push({
              violationTime: format(
                new Date(closestDroneData[drone].violationData.capturedTime),
                "HH:mm:ss"
              ),
              violationDate: format(
                new Date(closestDroneData[drone].violationData.capturedTime),
                "dd.MM.yyyy"
              ),
              pilotName: `${closestDroneData[drone].pilot.firstName} ${closestDroneData[drone].pilot.lastName}`,
              phoneNumber: closestDroneData[drone].pilot.phoneNumber,
              email: closestDroneData[drone].pilot.email,
              minDistance: closestDroneData[drone].violationData.droneDistance,
              droneModel: closestDroneData[drone].violationData.model,
              droneManu: closestDroneData[drone].violationData.manufacturer,
              positionX: closestDroneData[drone].violationData.positionX,
              positionY: closestDroneData[drone].violationData.positionY,
              serialNumber: drone,
            });
          });
          // Sort the list data by distance to the nest
          sortByClosest(listData);
          setItems(listData);
        }
      }
      catch (e) {
          console.error(e);
      }
    // Try to refresh NDZ violation list every 2 sec
    }, 2000);
      return () => clearInterval(interval);
  }, []);


  return (

    <Container
      maxWidth='sm'
    >
      <Typography 
        sx={{mt: 5, mb: 3,}} 
        variant='h3' 
        component='h1'
        align='center'
        fontWeight='bold'
      >
        Birdnest
      </Typography>

      <Typography 
        sx={{mt: 2, mb: 3,}} 
        variant='body1' 
        component='h4'
        align='center'
      >
        For the birds, by the birds.
      </Typography>

      <DroneMap items={items} />
      <ViolationList items={items} />

      <Typography 
        sx={{mt: 3, mb: 3,}} 
        variant='body2' 
        component='h4'
        align='center'
        fontWeight='bold'
      >
        Emilia Hahl (2023)
      </Typography>
    </Container>
  );
}

export default App;
