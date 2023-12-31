// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Image, ScrollView, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Component imports
import { fU, vh, vw } from '../../common/Constants';
import { globalButtonStyles, globalInputStyles, globalTextStyles, globalContainerStyles } from '../../common/GlobalStyleSheet';
import { TTButton, TTCheckbox, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';
import { TTCounterInput, TTDropdown, TTNumberInput, TTTextInput } from '../components/InputComponents';
import { serializeData, deserializeData, compressData, decompressData, saveMatchData, loadDevice, loadMatchData,loadOtherSettings, loadTbaEventCache, loadMatchCache, saveMatchCache} from '../../common/LocalStorage'
import { TTGradient } from '../components/ExtraComponents';
import { ColorScheme as CS } from '../../common/ColorScheme';

const matchTypeValues = ["Practice", "Qualifiers", "Finals"];
const teamColorValues = ["Red", "Blue"];
const deviceValues = ["Blue1","Blue2","Blue3","Red1","Red2","Red3"];

// Main function
const ScoutTeam = ({route, navigation}) => {
    // Might be good to make some of these into arrays
    
    const [scouterName, setScouterName] = React.useState("");
    const [device, setDevice] = React.useState("Device");
    const [dataType, setDataType] = React.useState("Match");
    const [teamNumber, setTeamNumber] = React.useState("");
    const [matchNumber, setMatchNumber] = React.useState("");
    const [matchType, setMatchType] = React.useState("Match Type");
    const [teamColor, setTeamColor] = React.useState("Team Color");

    const [taxi, setTaxi] = React.useState(false);
    const [autoDocked, setAutoDocked] = React.useState(false);
    const [autoEngaged, setAutoEngaged] = React.useState(false);
    const [autoPoints, setAutoPoints] = React.useState({
        cubeHigh: "0", cubeMid: "0", cubeLow: "0", 
        coneHigh: "0", coneMid: "0", coneLow: "0", 
        misses: "0",
    });
    const setAutoPointParam = (parameter, value) => {
        const temp = {...autoPoints};
        temp[parameter] = value;
        setAutoPoints(temp);
    }

    const [telePoints, setTelePoints] = React.useState({
        cubeHigh: "0", cubeMid: "0", cubeLow: "0", 
        coneHigh: "0", coneMid: "0", coneLow: "0", 
        misses: "0",
    });
    const setTelePointParam = (parameter, value) => {
        const temp = {...telePoints};
        temp[parameter] = value;
        setTelePoints(temp);
    }
    
    const [teleParked, setTeleParked] = React.useState(false);
    const [teleDocked, setTeleDocked] = React.useState(false);
    const [teleEngaged, setTeleEngaged] = React.useState(false);
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
        const matchData = [
            // Pre Round
            dataType, //0
            formatNameState(scouterName),//1
            device != "Device" ? deviceValues.indexOf(device) : 0, //2
            formatNumericState(teamNumber), //3
            formatNumericState(matchNumber), //4
            matchType != "Match Type" ? matchTypeValues.indexOf(matchType) : 1, //5
            teamColor != "Team Color" ? (device.includes("Blue")?"Blue":"Red") : 0, //6

            // Auto
            taxi ? 1 : 0, //7
            autoDocked ? 1 : 0, //8
            autoEngaged ? 1 : 0, //9
            formatNumericState(autoPoints.cubeHigh), //10
            formatNumericState(autoPoints.cubeMid), //11
            formatNumericState(autoPoints.cubeLow), //12
            formatNumericState(autoPoints.coneHigh), //13
            formatNumericState(autoPoints.coneMid), //14
            formatNumericState(autoPoints.coneLow), //15
            formatNumericState(autoPoints.misses), //16

            // Teleop
            formatNumericState(telePoints.cubeHigh), //17
            formatNumericState(telePoints.cubeMid), //18
            formatNumericState(telePoints.cubeLow), //19
            formatNumericState(telePoints.coneHigh), //20
            formatNumericState(telePoints.coneMid), //21
            formatNumericState(telePoints.coneLow), //22
            formatNumericState(telePoints.misses), //23
            teleParked ? 1 : 0, //24
            teleDocked ? 1 : 0, //25
            teleEngaged ? 1 : 0, //26

            // After Round
            eventKey, //27
            comments, //28
        ];

        const matchCache = {
            'scouterName' : formatNameState(scouterName),
            'matchNumber' : formatNumericState(matchNumber),
            'matchType' : matchType
        };

        // Save data using hash
        try {
            await saveMatchData(matchData);
            await saveMatchCache(matchCache);
            navigation.navigate("Home");
        } catch (e) {
            console.error(`Error Saving Data: ${e}`);
        }
    };

    const loadSavedData = (data) => {
        // Pre Round
        setDataType(data[0]);
        setScouterName(data[1]);
        setDevice(deviceValues[data[2]]);
        setTeamNumber(data[3]);
        setMatchNumber(data[4]);
        setMatchType(matchTypeValues[data[5]]);
        setTeamColor(teamColorValues[data[6]]);

        // Auto
        setTaxi(Number(data[7]) ? true : false);
        setAutoDocked(Number(data[8]) ? true : false);
        setAutoEngaged(Number(data[9]) ? true : false);
        const autoPoints = {
            cubeHigh: data[10], cubeMid: data[11], cubeLow: data[12],
            coneHigh: data[13], coneMid: data[14], coneLow: data[15],
            misses: data[16],
        }
        setAutoPoints(autoPoints);

        // Teleop
        const telePoints = {
            cubeHigh: data[17], cubeMid: data[18], cubeLow: data[19],
            coneHigh: data[20], coneMid: data[21], coneLow: data[22],
            misses: data[23],
        }
        setTelePoints(telePoints);
        
        setTeleParked(Number(data[24]) ? true : false);
        setTeleDocked(Number(data[25]) ? true : false);
        setTeleEngaged(Number(data[26]) ? true : false);

        // After Round
        
        setEventKey(data[27]);
        setComments(data[28]);
    }
    

    React.useEffect(() => {
        //Load setting defaults from tba and other settings if configured. 
        const loadOtherSettingsToState = async () => {
            //Get Other Settings used to pull TBA data and determine device
            const loadedOtherSettings = await loadOtherSettings();
            if(loadedOtherSettings){
                setEventKey(loadedOtherSettings.eventKey);
            };

            const loadedDevice = await loadDevice();
            if (loadedDevice) {
                setTeamColor(loadedDevice.device.includes("Blue")?"Blue":"Red");
                setDevice(loadedDevice.device);
            }
            //GetMatchCache which stores the last match data
            const loadMatch = await loadMatchCache()
           
            if (loadMatch) {
               
                if (loadMatch.matchNumber==="0"){
                    setMatchNumber("1");
                } else {
                    setMatchNumber((Number(loadMatch.matchNumber) + 1).toString())
                }
                setScouterName(loadMatch.scouterName);
                setMatchType(loadMatch.matchType);
            } else {
                setMatchNumber("1");
                setMatchType("Qualifiers");
            };
            //GetTBAEventMatchData to populate the team number
            const loadTbaEvent = await loadTbaEventCache();
            //console.log(loadTbaEvent);
            if (loadTbaEvent) {
                for (i = 0; i < JSON.parse(loadTbaEvent).length; i++) {
                    const data = JSON.parse(loadTbaEvent)[i];
                    var mt = "Qualifiers";
                    var mn = 1;                
                    try{
                        if (loadMatch) {
                            mt = loadMatch.matchType;
                            mn = String(Number(loadMatch.matchNumber) + 1);
                        }  
                        
                        if (data.eventkey == loadedOtherSettings.eventKey
                        && (mt == "Qualifiers")
                        && data.complevel == "qm"
                        && mn == String(data.matchnumber)) {

                        var team = "";
                        switch(loadedDevice.device) {
                            case "Blue3":
                                team = data.blue3.replace("frc","");
                                break;
                            case "Blue2":
                                team =data.blue2.replace("frc","");
                                break;
                            case "Blue1":
                                team = data.blue1.replace("frc","");
                                break;
                            case "Red3":
                                team = data.red3.replace("frc","");
                                break;
                            case "Red2":
                                team = data.red2.replace("frc","");
                                break;
                            case "Red1":
                                team = data.red1.replace("frc","");
                                break;
                            default:
                                team = "";
                                break;
                            };
                            //console.log(team);
                            setTeamNumber(team);
                        };
                    } catch(e) {
                        console.error(e);
                    }
                };
            } else {
                setTeamNumber("");
            };

        };       
        
        //Load data if a prior scouting match was passed to page. 
        if (route?.params?.matchData) {
            loadSavedData(route.params.matchData);
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

                    <View style={{...styles.rowAlignContainer, zIndex: 7}}>
                        <Text style={ globalTextStyles.labelText }>
                            Device:
                        </Text>
                        {/* Device */}
                        <TTDropdown 
                            state={device} 
                            setState={setDevice} 
                            items={deviceValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                        />
                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 6}}>
                        <Text style={ globalTextStyles.labelText }>
                            Match Type:
                        </Text>
                    {/* Match type */}
                        <TTDropdown 
                            state={matchType} 
                            setState={setMatchType} 
                            items={matchTypeValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                            zIndex={5}
                        />
                    </View>
                    <View style={{...styles.rowAlignContainer, zIndex: 5}}>
                        <Text style={ globalTextStyles.labelText }>
                            Match Number:
                        </Text>
                        <TTNumberInput
                            state={matchNumber}
                            setState={setMatchNumber}
                            maxLength={3}
                            placeholder="Match #"
                            placeholderTextColor={`${CS.light1}50`}
                            style={styles.topNumberInput}
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
                    {/* <View style={{...styles.rowAlignContainer, zIndex: 5}}>
                        <Text style={ globalTextStyles.labelText }>
                            Team Color:
                        </Text> */}
                        {/* Team Color */}
                        {/* <TTDropdown 
                            state={teamColor} 
                            setState={setTeamColor} 
                            items={teamColorValues}
                            boxWidth={40*vw}
                            boxHeight={5*vh}
                            boxStyle={globalInputStyles.dropdownInput}
                            textStyle={globalTextStyles.labelText}
                        />
                    </View> */}
                    {/* Rudamentary spacer */}
                    <View style={{marginBottom: 5*vh}}/> 
                </View>

                {/* 
                
                AUTO 
                
                */}
                <View style={{height: 95*vh}}>
                    <TTGradient/>

                    {/* Might also make title a block (?) */}
                    <Text style={styles.sectionHeader}>Auto</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        {/* Column for cube and cone high, middle, and low */}
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* Cubes */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube High</Text>
                                    <TTCounterInput
                                        state={autoPoints.cubeHigh}
                                        setState={(v) => setAutoPointParam("cubeHigh", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Mid</Text>
                                    <TTCounterInput
                                        state={autoPoints.cubeMid}
                                        setState={(v) => setAutoPointParam("cubeMid", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Low</Text>
                                    <TTCounterInput
                                        state={autoPoints.cubeLow}
                                        setState={(v) => setAutoPointParam("cubeLow", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                            </View>
                            {/* Cones */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone High</Text>
                                    <TTCounterInput
                                        state={autoPoints.coneHigh}
                                        setState={(v) => setAutoPointParam("coneHigh", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Mid</Text>
                                    <TTCounterInput
                                        state={autoPoints.coneMid}
                                        setState={(v) => setAutoPointParam("coneMid", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Low</Text>
                                    <TTCounterInput
                                        state={autoPoints.coneLow}
                                        setState={(v) => setAutoPointParam("coneLow", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                            </View>
                        </View>
                        {/* Misses */}
                        <View style={globalContainerStyles.columnContainer}>
                            <Text style={styles.counterHeader}>Misses</Text>
                            <TTCounterInput
                                state={autoPoints.misses}
                                setState={(v) => setAutoPointParam("misses", v)}
                                {...counterSettings}
                            />
                        </View>
                    </View>

                    <View style={{...styles.rowAlignContainer, flexGrow: 0.3}}>
                        {/* Taxi */}
                        <TTSimpleCheckbox 
                            state={taxi}
                            setState={setTaxi}
                            text="Mobility?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText, fontSize: 14*fU}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        {/* Docked */}
                        <TTSimpleCheckbox 
                            state={autoDocked}
                            setState={setAutoDocked}
                            text="Docked?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText, fontSize: 14*fU}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        {/* Engaged */}
                        <TTSimpleCheckbox 
                            state={autoEngaged}
                            setState={setAutoEngaged}
                            text="Engaged?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText, fontSize: 14*fU}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                    </View>
                    <View style={{marginBottom: 2*vh}}/> 
                </View>

                {/* 
                
                TELEOP 
                
                */}
                <View style={{height: 85*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Teleop</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                        {/* Column for cube and cone high, middle, and low */}
                        <View style={{...globalContainerStyles.columnContainer, flexGrow: 3}}>
                            {/* Cubes */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube High</Text>
                                    <TTCounterInput
                                        state={telePoints.cubeHigh}
                                        setState={(v) => setTelePointParam("cubeHigh", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Mid</Text>
                                    <TTCounterInput
                                        state={telePoints.cubeMid}
                                        setState={(v) => setTelePointParam("cubeMid", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>

                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cube Low</Text>
                                    <TTCounterInput
                                        state={telePoints.cubeLow}
                                        setState={(v) => setTelePointParam("cubeLow", v)}
                                        {...cubeCounterSettings}
                                    />
                                </View>
                            </View>
                            {/* Cones */}
                            <View style={{...styles.rowAlignContainer, flexGrow: 1}}>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone High</Text>
                                    <TTCounterInput
                                        state={telePoints.coneHigh}
                                        setState={(v) => setTelePointParam("coneHigh", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Mid</Text>
                                    <TTCounterInput
                                        state={telePoints.coneMid}
                                        setState={(v) => setTelePointParam("coneMid", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                                <View style={globalContainerStyles.columnContainer}>
                                    <Text style={styles.counterHeader}>Cone Low</Text>
                                    <TTCounterInput
                                        state={telePoints.coneLow}
                                        setState={(v) => setTelePointParam("coneLow", v)}
                                        {...coneCounterSettings}
                                    />
                                </View>
                            </View>
                        </View>
                        {/* Misses */}
                        <View style={globalContainerStyles.columnContainer}>
                            <Text style={styles.counterHeader}>Misses</Text>
                            <TTCounterInput
                                state={telePoints.misses}
                                setState={(v) => setTelePointParam("misses", v)}
                                {...counterSettings}
                            />
                        </View>
                    </View>
                </View>
                
                {/* 
                
                ENDGAME 
                
                */}
                <View style={{height: 50*vh}}>
                    <TTGradient/>

                    <Text style={styles.sectionHeader}>Endgame</Text>
                    
                    <View style={{...styles.rowAlignContainer, flexGrow: 0.3}}>
                        <TTSimpleCheckbox 
                            state={teleParked}
                            setState={setTeleParked}
                            text="Parked?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        <TTSimpleCheckbox 
                            state={teleDocked}
                            setState={setTeleDocked}
                            text="Docked?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                        <TTSimpleCheckbox 
                            state={teleEngaged}
                            setState={setTeleEngaged}
                            text="Engaged?" 
                            overallStyle={{height: "100%", alignSelf: "center"}}
                            textStyle={{...globalTextStyles.labelText}}
                            boxUncheckedStyle={{...globalButtonStyles.checkboxUncheckedStyle}}
                            boxCheckedStyle={{...globalButtonStyles.checkboxCheckedStyle}}
                        />
                    </View>
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
export default ScoutTeam;

export { matchTypeValues, teamColorValues, deviceValues, styles };