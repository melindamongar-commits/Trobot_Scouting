// Library imports
import * as React from 'react';
import { StyleSheet, Text, View, Button, Pressable, TextInput } from 'react-native';

// Component imports
import ColorScheme from '../../common/ColorScheme';
import { TTButton, TTPushButton, TTSimpleCheckbox } from '../components/ButtonComponents';

// Main function
const Settings = ({route, navigation}) => {
    // States
    const [autoSync, setAutoSync] = React.useState(false);
    const [autoClear, setAutoClear] = React.useState(false);
    const [randomVar, setRandomVar] = React.useState(false);

    // JSX
    return (
        <View style={styles.container}>
            <Text>Settings! (all styles are temporary)</Text>
            <TextInput
                style={styles.PLACEHOLDER_input}
                placeholder="Scouter Name"
            />

            <TTButton text="Sample Button!" buttonStyle={{padding: 12, backgroundColor: "orange", borderRadius: 5}} textStyle={{font: "Comic Sans"}}/>
            <TTPushButton text="Currently Not Syncing to Cloud" pushText="Now Syncing to Cloud!" state={autoSync} setState={setAutoSync} buttonStyle={{padding: 12, backgroundColor: "orange", borderRadius: 5}} buttonPushedStyle={{padding: 12, backgroundColor: "red", borderRadius: 5}}/>
            <TTPushButton text="Auto Clear Synced Local Data" state={autoClear} setState={setAutoClear} buttonStyle={{padding: 12, backgroundColor: "orange", borderRadius: 5}} buttonPushedStyle={{padding: 12, backgroundColor: "red", borderRadius: 5}}/>

            <TTSimpleCheckbox text="And heres a random checkbox" state={randomVar} setState={setRandomVar} boxCheckedStyle={{padding: 15, backgroundColor: "green", borderRadius: 15}} boxUncheckedStyle={{padding: 15, backgroundColor: "red"}}/>

            {/* Really shouldn't be using default buttons for anything */}
            <Button
                title="Save"
                onPress={() => {navigation.navigate("Home")}}
            />
        </View>
    );
}

// Stylesheet
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    PLACEHOLDER_input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        width: 300,
        padding: 10,
    },
    PLACEHOLDER_checkboxUnchecked: {
        margin: 12,
        padding: 10,
        elevation: 3,
        backgroundColor: ColorScheme.color2
    },
    PLACEHOLDER_checkboxChecked: {
        margin: 12,
        padding: 10,
        elevation: 3,
        backgroundColor: ColorScheme.color3
    },
  });

// Exports
export default Settings;