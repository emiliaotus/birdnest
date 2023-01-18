import * as React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import FmdBadIcon from '@mui/icons-material/FmdBad';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';


/**
 * Component for the list of NDZ violations.
 * @param {*} props Gets closest drone data from App.js.
 * @returns List of NDZ violations sorted by distance (closest first).
 */
function ViolationList(props) {

  return (

    <div>
    <Typography 
        sx={{mt: 3, mb: 2,}} 
        variant='h5' 
        component='h2'
        align='center'
        fontWeight='bold'
    >
        NDZ violations in the last 10 min
    </Typography>

    <List sx={{ 
        width: '100%', 
        maxWidth: 500, 
        bgcolor: 'background.paper' 
    }}>

        {/* Generate list of NDZ violations in the last 10 min */}

        {props.items.map( (item, idx) => {

            return(
                <React.Fragment>
                <ListItem alignItems="flex-start">
                    
                    <FmdBadIcon sx={{fontSize: 55}} />
                    <ListItemText
                        primary={
                        <React.Fragment>

                            <Typography 
                                variant="h6" 
                                component="h3" 
                                fontWeight="bold"
                                sx={{ display: 'inline' }}
                            >
                                {(item.minDistance / 1000).toFixed(2) + " m"}
                            </Typography>

                            <Typography
                                sx={{ display: 'inline', ml: 15 }}
                                variant="body2"
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                {item.violationDate}
                            </Typography>

                            <Typography
                                sx={{ display: 'inline', ml: 0.5 }}
                                variant="body2"
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                {" klo "}
                            </Typography>
                            <Typography
                                sx={{ display: 'inline', ml: 0.5 }}
                                variant="body2"
                                color="text.secondary"
                                fontWeight="bold"
                            >
                                {item.violationTime}
                            </Typography>

                        </React.Fragment>
                        }
                        secondary={
                        <React.Fragment>

                            <Typography
                                sx={{ display: 'inline' }}
                                variant="body2"
                                color="text.secondary"
                            >
                                {item.droneManu}
                            </Typography>
                            {" — "}
                            <Typography
                                sx={{ display: 'inline' }}
                                variant="body2"
                                color="text.secondary"
                            >
                                {item.droneModel}
                            </Typography>

                            <List dense>
                                <ListItem disablePadding>
                                    <ListItemIcon>
                                        <PersonIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.pilotName}
                                    />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemIcon>
                                        <EmailIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.email}
                                    />
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemIcon>
                                        <PhoneIcon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.phoneNumber}
                                    />
                                </ListItem>
                            </List>

                        </React.Fragment>
                        }
                    />
                </ListItem>

                <Divider variant="middle" component="li" />
                </React.Fragment>
            );
        })}
    </List>
    </div>
  );
}

export default ViolationList;