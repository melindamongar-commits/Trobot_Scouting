// Library imports
import LZString from "lz-string";
import axios from "axios";
import { Promise } from "bluebird";

// Component imports
import { loadSettings, loadOtherSettings, delimiter, deserializeData, compressData, decompressData } from './LocalStorage';
import { concurrency } from './Constants';

// Downloads the data of all the files from the cloud
const getTBAEventData = async (tbaKey, eventKey) => {
    
    const urlString = "https://www.thebluealliance.com/api/v3/event/" + eventKey + "/matches/simple";
    //console.log(urlString);
    //console.log(tbaKey);

    var headerConfig = {
        headers:{ 'X-TBA-Auth-Key': tbaKey}
    };

    try{
        const response = await axios.get(urlString, headerConfig)
            
        //console.log(JSON.stringify(response.data));
        const matches = response.data;
        const details = matches.map((match) => {
            return ( 
                {
                eventkey: eventKey,
                matchnumber: match.match_number,
                complevel: match.comp_level ,
                setnumber: match.set_number ,
                blue1: match.alliances.blue.team_keys[0],
                blue2: match.alliances.blue.team_keys[1],
                blue3: match.alliances.blue.team_keys[2],
                red1: match.alliances.red.team_keys[0],                    
                red2: match.alliances.red.team_keys[1],
                red3: match.alliances.red.team_keys[2]
                }
            ); 
        });

        //console.log(details);
        
        const responseData = JSON.stringify(details);
       // console.log(responseData);
        return responseData;
        
    } catch(error) {
        console.error(error);
        return "";
    }
  
};

export { 
    getTBAEventData
};