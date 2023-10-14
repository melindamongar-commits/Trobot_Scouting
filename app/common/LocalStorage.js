/*
DATA SERIALIZATION
Data should be stored as efficiently as possible (within reason, no use packing individual bits). JSON strings
should be avoided, because the labels often take up multitudes more space than the data they're pointing to. As
long as the data is serialized and deserialized with the same conventions there is no need for labels.

DATA CONVENTIONS
Each round should have a hash of some kind which is used for the name of a sub-key. For simplicities sake, it makes the
most sense to use the team number, round type, and round number. It could be packed bytes as seen above, or in a more
readable format like 4829-Q18
*/

// Library imports
import AsyncStorage from '@react-native-async-storage/async-storage';
import LZString from 'lz-string';
import { Promise } from "bluebird";

// Component imports
import { concurrency } from './Constants';

// Constants
const settingsKey = "@settingsKey";
const otherSettingsKey = "@OtherSettingsKey";
const cloudCacheKey = "@cloudCacheKey";
const tbaEventCacheKey = "@tbaEventCacheKey";
const matchCacheKey = "@matchCacheKey"
const delimiter = String.fromCharCode(124);

// Take a list of data and packs it into a string. Only works with lists numbers and strings
// Example: [90, 4829] -> "90 4829"
const serializeData = (data) => {
    return data.join(delimiter);
};

// Reads a string of separated values into an array. Only outputs numbers and strings
// Example: "90 4829" -> [90, 4829]
const deserializeData = (data) => {    
    return data.split(delimiter);
};

// Compresses data using LZString
const compressData = (stringData) => {
    return LZString.compressToUTF16(stringData);
}

// Decompresses data using LZString
const decompressData = (compressedData) => {
    return LZString.decompressFromUTF16(compressedData);
}

// Stores data at a key. Returns false if there there was an error, returns true otherwise.
const writeData = async (data, key) => {
    try {
        //console.log(data)
        await AsyncStorage.setItem(key, data);
        return true;
    } catch (e) {
        console.error(e);
        return null;
    }
};

// Reads data at a key. Returns false if there was an error, returns the data otherwise
const readData = async (key) => {
    try {
        const data = await AsyncStorage.getItem(key);
        if (data !== null) {
            //console.log(data)
            return data;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Reads multiple match keys
const readMultipleDataKeys = async (keys) => {
    try {
        const outputData = Promise.map(keys,
            (key) => {
                return readData(key);
            },
            {concurrency: concurrency}
        );
        return outputData;
    } catch (e) {
        console.error(`Error reading multiple matches:\n${e}`);
        return null;
    }
}


// Deletes a key. Returns false if there was an error, returns true otherwise
const deleteData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Deletes multiple keys. Returns false if there was an error, returns true otherwise
const deleteMultipleDataKeys = async (keys) => {
    try {
        // Absolutely magical function
        Promise.map(keys, 
            (key) => {
                return deleteData(key);
            },
            {concurrency: concurrency}
        );
        return true;
    } catch (e) {
        console.error(`Error deleting multiple match keys:\n${e}`)
        return null;
    }
}

// Takes a list of values and saves it according to conventions. Returns false if there was an error, returns true otherwise
const saveMatchData = async (data) => {
    const matchTypeValues = ["Practice", "Qualifiers", "Finals"]; // Probably should be stored elsewhere

    const key = `@MD${data[2]}-${matchTypeValues[data[4]]}-${data[3]}`;
    const serializedData = serializeData(data);
    return await writeData(serializedData, key);
};

//Save latest version of match meta data for reuse.
const saveMatchCache = async (data) => {
    const stringData = JSON.stringify(data);
    return await writeData(stringData, matchCacheKey);
};

// Reads the data stored at a key value. Returns false if there was an error, returns list of data otherwise.
const loadMatchData = async (key) => {
    const data = await readData(key);
    if (data == false) {
        return null;
    } else {
        const listData = deserializeData(data);
        return listData;
    }
};

// Reads the latest stored version of the match meta data
const loadMatchCache = async () => {
    const data = await readData(matchCacheKey);
    if (!data) return null;
    try {
        const parsedData = JSON.parse(data);
        return parsedData;
    } catch (e) {
        return null;
    }
};

// Helper function to only keep match keys
const removeNonMatchKeys = (loadedKeys) => {
    const filtered = loadedKeys.filter((keyName) => {return keyName.slice(0, 3) == "@MD"});
    return filtered;
}

// Helper function to load settings
const loadSettings = async () => {
    const loadedSettings = await readData(settingsKey);
    if (!loadedSettings) return null;

    // This probably shouldn't even include a try function because it shouldn't accept settings that don't parse correctly
    try {
        const parsedSettings = JSON.parse(loadedSettings);
        return parsedSettings;
    } catch (e) {
        return null;
    }
}

// Helper function to load other settings
const loadOtherSettings = async () => {
    const loadedOtherSettings = await readData(otherSettingsKey);
    if (!loadedOtherSettings) return null;

    // This probably shouldn't even include a try function because it shouldn't accept settings that don't parse correctly
    try {
        const parsedSettings = JSON.parse(loadedOtherSettings);
        //console.log(parsedSettings);
        return parsedSettings;
    } catch (e) {
        return null;
    }
}

// Helper function to save cloud cache
const saveCloudCache = async (cloudData) => {
    const stringData = JSON.stringify(cloudData);
    return await writeData(stringData, cloudCacheKey);
}

// Helper function to load cloud cache
const loadCloudCache = async () => {
    const loadedCache = await readData(cloudCacheKey);
    try {
        const parsedData = JSON.parse(loadedCache);
        return parsedData;
    } catch (e) {
        return null;
    }
}


// Helper function to save cloud cache
const saveTbaEventCache = async (tbaData) => {
    //console.log(tbaData);
    
    const stringData = JSON.stringify(tbaData);
    //console.log(stringData);
    return await writeData(stringData, tbaEventCacheKey);
}

// Helper function to load cloud cache
const loadTbaEventCache = async () => {
    const loadedCache = await readData(tbaEventCacheKey);
    if (!loadedCache) return null;
    //console.log(loadedCache);
    try {
        const parsedData = JSON.parse(loadedCache);
        return parsedData;
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Exports
export { 
    settingsKey,
    otherSettingsKey,
    matchCacheKey,
    tbaEventCacheKey,
    cloudCacheKey,
    delimiter,
    readData,
    readMultipleDataKeys,
    writeData,
    serializeData, 
    deserializeData, 
    compressData, 
    decompressData,
    saveMatchData,
    loadMatchData,
    deleteData,
    deleteMultipleDataKeys,
    removeNonMatchKeys,
    loadSettings,
    loadOtherSettings,
    saveCloudCache,
    saveTbaEventCache,
    loadTbaEventCache,
    loadCloudCache,
    loadMatchCache,
    saveMatchCache
}