// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Component imports
import { fU, vh, vw } from '../../common/Constants';
import { globalButtonStyles, globalInputStyles, globalTextStyles, globalContainerStyles } from '../../common/GlobalStyleSheet';
import { TTButton, TTCheckbox, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';
import { TTCounterInput, TTDropdown, TTNumberInput, TTTextInput } from '../components/InputComponents';
import { serializeData, deserializeData, compressData, decompressData, saveMatchData, loadMatchData,loadOtherSettings, loadTbaEventCache, loadMatchCache, saveMatchCache} from '../../common/LocalStorage'
import { TTGradient } from '../components/ExtraComponents';
import { ColorScheme as CS } from '../../common/ColorScheme';

// Main function
const PitScout = ({route, navigation}) => 
{
    // Might be good to make some of these into arrays
    
    const [scouterName, setScouterName] = React.useState("");
    

    const [teamNumber, setTeamNumber] = React.useState("");
    
    const [comments, setComments] = React.useState("");
    const [eventKey, setEventKey] = React.useState("");


    // Prevents nothing entries
    const formatNumericState = (state) => {
        return ((state != "") ? Number(state) : 0);
    }
    const formatNameState = (state) => {
        return ((state != "") ? state.trim() : 0);
    }
    // Serializes the data to a string and saves it
    const saveAndExit = async () => {
        const pitData = [
            // Pre Round
            formatNameState(scouterName),
           
            formatNumericState(teamNumber), 

            // After Round
            eventKey,
            comments,
        ];


        // Save data using hash
        try {
            await savePitData(pitData);
            navigation.navigate("Home");
        } catch (e) {
            console.error(`Error Saving Data: ${e}`);
        }
    };

    const loadSavedData = (data) => {
        // Pre Round
        
        setScouterName(data[0]);
               setTeamNumber(data[1]);
        

        // After Round
        
        setEventKey(data[2]);
        setComments(data[3]);
    }
    

    React.useEffect(() => {
        //Load setting defaults from tba and other settings if configured. 
        const loadOtherSettingsToState = async () => {
            //Get Other Settings used to pull TBA data and determine device
            const loadedOtherSettings = await loadOtherSettings();
            if(loadedOtherSettings){
                setEventKey(loadedOtherSettings.eventKey);
            };

            //GetTBAEventMatchData to populate the team number
            const loadTbaEvent = await loadTbaEventCache();

            setTeamNumber("");   

        };       
        
        //Load data if a prior scouting match was passed to page. 
        if (route?.params?.pitData) {
            loadSavedData(route.params.pitData);
        } else {
            loadOtherSettingsToState();  
        }

    }, [])

    const scrollRef = React.useRef(null);

    // Ugly but necessary
    const counterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [globalButtonStyles.topCounterButton, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [globalButtonStyles.bottomCounterButton, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }
    const cubeCounterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [{...globalButtonStyles.topCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [{...globalButtonStyles.bottomCounterButton, backgroundColor: CS.cube}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }
    const coneCounterSettings = {
        stateMin: 0,
        stateMax: 99,
        overallStyle: {justifySelf: "center", marginTop: 7*vh},
        topButtonProps: {text: "+", buttonStyle: [{...globalButtonStyles.topCounterButton, backgroundColor: CS.cone}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText},
        inputProps: {style: [globalInputStyles.numberInput, globalTextStyles.labelText, {width: "80%", height: "25%", margin: 0}]},
        bottomButtonProps: {text: "-", buttonStyle: [{...globalButtonStyles.bottomCounterButton, backgroundColor: CS.cone}, {height: 8.5*vh, padding: 0}], textStyle: globalTextStyles.primaryText}
    }

    return (
        <View style={globalContainerStyles.topContainer}>
        <TTGradient/>

            {/* All scouting settings go in the scroll view */}
            <KeyboardAvoidingView style={{flex: 1}} behavior="height">
            <ScrollView keyboardShouldPersistTaps='handled' ref={scrollRef}>
                <View style={{height: 50*vh, zIndex: 1}}>
                    <Text style={styles.sectionHeader}>Pre-Round</Text>

                    <View style={{...styles.rowAlignContainer, zIndex: 7}}>
                        {/* ScouterName */}
                        <Text style={globalTextStyles.labelText}>
                            Scouter Name:
                        </Text>
                        <TTTextInput
                            state={scouterName}
                            setState={setScouterName}
                            maxLength={30}
                            placeholder="Scouter Name"
                            placeholderTextColor={`${CS.light1}50`}
                            style={[
                                {...globalInputStyles.numberInput, width: "45%", height: "75%"},
                                globalTextStyles.labelText
                            ]}
                        />
                    </View>

 
                    <View style={{...styles.rowAlignContainer, zIndex: 4}}>
                        <Text style={ globalTextStyles.labelText }>
                            Team Number:
                        </Text>
                        {/* Team number */}
                        <TTNumberInput
                            state={teamNumber}
                            setState={setTeamNumber}
                            stateMax={9999}
                            maxLength={4}
                            placeholder="Team #"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
                        />
                    </View>
                    <View style={{marginBottom: 5*vh}}/> 
                </View>

               
                
                {/* 
                
                ENDGAME 
                
                */}
                <View style={{height: 50*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Endgame</Text>
                    
                    
                    <View style={styles.rowAlignContainer}>
                        <TTTextInput
                            state={comments}
                            setState={setComments}
                            placeholder="Comments (50 characters)"
                            placeholderTextColor={`${CS.light1}50`}
                            multiline={true}
                            maxLength={50}
                            numberOfLines={4}
                            onFocus={() => {scrollRef.current.scrollToEnd()}}
                            style={[
                                {...globalInputStyles.numberInput, width: "90%", height: "90%"},
                                globalTextStyles.labelText
                            ]}
                        />
                    </View>

                    {/* Rudamentary spacer */}
                    <View style={{marginBottom: 5*vh}}/> 
                </View>
                
                <View style={{...globalContainerStyles.centerContainer, backgroundColor: "#00000000"}}>
                    <TTButton
                        text="Save Data"
                        buttonStyle={{...globalButtonStyles.primaryButton, width: "90%", margin: 5*vh}}
                        textStyle={{...globalTextStyles.primaryText, fontSize: 36*fU}}
                        onPress={saveAndExit}
                    />
                </View>

            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

// !! TODO !! REPLACE ALL MASSIVE INLINE STYLES WITH A STYLESHEET
const styles = StyleSheet.create({
    sectionHeader: {
        ...globalTextStyles.primaryText, 
        fontSize: 24*fU, 
        margin: 1.5*vh
    },
    topNumberInput: {
        ...globalInputStyles.numberInput, 
        ...globalTextStyles.labelText,
        margin: 0,
        width: 45*vw, 
        height: 5*vh,
    },
    rowAlignContainer: {
        ...globalContainerStyles.rowContainer, 
        width: "100%", 
        alignItems: "center", 
        justifyContent: "space-evenly",
    },
    counterHeader: {
        ...globalTextStyles.labelText, 
        fontSize: 15*fU, 
        alignSelf: "center", 
        position: "absolute", 
        top: 2.6*vh
    }
});


// Exports
export default PitScout;
