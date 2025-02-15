import axios from 'axios';
import { GOOGLE_API_KEY } from '@env'

export const askGoogle = async (start, end) => {
    const endpoint = 'https://maps.googleapis.com/maps/api/directions/json';

    try {
        const response = await axios.get(endpoint, {
            params: {
                origin: start,
                destination: end,
                key: GOOGLE_API_KEY,
                mode: 'WALKING'
            }
        });
        //console.log(`This is raw response ${response.data.choices[0].message.content}`);
        //console.log(response.data.routes[0].legs[0].steps)
        let responseArr = response.data.routes[0].legs[0].steps
        //console.log(responseObj._response)
        let directionString = '';
        for (let i = 0; i < responseArr.length; i++) {
            directionString += responseArr[i].html_instructions;
            directionString += '.\n'
        }
        const antihtml = new RegExp(/<[^>]*>/g);
        directionString = directionString.replace(antihtml, '');
        //console.log(directionString);
        return directionString;
    } catch (error) {
        console.error('Axios Error:', error.response ? error.response.data : error.message);
    }
};