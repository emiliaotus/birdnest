import React from 'react';
import { Typography } from '@mui/material';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


// Coordinates for the nest location
const nestLocation = [ { positionX: 250000, y: 250000, z: 1}];


/**
 * Component for the map of NDZ violating drones closest around the nest.
 * @param {*} props Gets closest drone xy-coordinates from App.js. 
 * @returns An xy-scatter chart map of drones around the nest.
 */
function DroneMap(props) {

  return (
    <div>

      <Typography 
          sx={{mt: 2}} 
          variant='h5' 
          component='h2'
          align='center'
          fontWeight='bold'
      >
          Drone map
      </Typography>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 0,
          }}
        >
          <CartesianGrid />

          <XAxis type="number" dataKey="positionX" name="X" domain={[150000,350000]}  />
          <YAxis yAxisId="left" type="number" dataKey="positionY" name="Y" domain={[150000,350000]} />

          {/* Another Y-axis for the nest coordinates */}
          <YAxis yAxisId="right" type="number" dataKey="y" name="Y" domain={[150000,350000]} hide="true" />
          {/* Added z-axis for the nest to make its marker more visible */}
          <ZAxis type="number" dataKey="z" range={[60, 400]} />

          {/* Populate map with xy-coordinates from the NDZ violating drone data closest to the nest */}
          <Scatter yAxisId="left" name="Drones within the NDZ" data={props.items} fill="#8884d8" />
          <Scatter yAxisId="right" name="Nest location" data={nestLocation} fill="#ff6600" shape="star" size="20" />
          
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Legend />

        </ScatterChart>
      </ResponsiveContainer>

    </div>
  );
}

export default DroneMap;