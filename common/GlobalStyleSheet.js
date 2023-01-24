import { StyleSheet } from 'react-native';

import { vh, vw } from './Constants';
import { ColorScheme as CS } from './ColorScheme';

// ! This should probably have functions returning the styles given the colorscheme

// Global stylesheet for frequently used styles like backgrounds, buttons, text, etc.. Also provides a base for other styles to build on


const globalButtonStyles = StyleSheet.create({
    primaryButton: {
        // Spacing and positioning
        width: "90%",

        padding: 2*vw,
        margin: 1*vh,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 1*vw,

        // Color
        backgroundColor: CS.accent2,
    },
    secondaryButton: {
        // Spacing and positioning
        width: "90%",

        padding: 2*vw,
        margin: 1*vh,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 1*vw,

        // Color
        backgroundColor: CS.accent1,
    },
    topCounterButton: {
        // Spacing and positioning
        width: "80%",

        padding: 2*vw,
        margin: 1*vh,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 2*vw,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,

        // Color
        backgroundColor: CS.accent1,
    },
    bottomCounterButton: {
        // Spacing and positioning
        width: "80%",

        padding: 2*vw,
        margin: 1*vh,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 2*vw,
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,

        // Color
        backgroundColor: CS.accent1,
    },
    matchKeyButton: {
        // Spacing and positioning
        width: "90%",

        padding: 2*vw,
        margin: 1*vh,

        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",

        borderRadius: 1*vw,

        // Color
        backgroundColor: CS.light1,
    },
    checkboxUncheckedStyle: {
        // Spacing and positioning
        width: 7*vw, 
        height: 7*vw, 
        margin: 1*vh, 

        // Border
        borderWidth: 3, 
        borderRadius: 3, 
        borderColor: CS.light1,

        // Color
        backgroundColor: `${CS.light1}10`, 
    },
    checkboxCheckedStyle: {
        // Spacing and positioning
        width: 7*vw, 
        height: 7*vw, 
        margin: 1*vh,
        
        // Border
        borderWidth: 3, 
        borderRadius: 3, 
        borderColor: CS.light1,

        // Color
        backgroundColor: CS.accent1, 
    }
});

const globalInputStyles = StyleSheet.create({
    numberInput: {
        // Spacing and positioning
        alignSelf: "center", 
        margin: 10,
        borderRadius: 9, 
        borderWidth: 3, 

        // Color
        backgroundColor: CS.dark3, 
        borderColor: CS.light1,
    },
    dropdownInput: {
        // Spacing and positioning
        alignSelf: "center", 
        borderRadius: 9, 
        borderWidth: 3, 

        // Color
        backgroundColor: CS.dark3, 
        borderColor: CS.light1,
    }
});

const globalTextStyles = StyleSheet.create({
    primaryText: {
        // Formatting
        fontFamily: "Bebas",
        fontSize: 48,

        // Color
        color: CS.light1
    },
    secondaryText: {
        // Formatting
        fontFamily: "Bebas",
        fontSize: 36,

        // Color
        color: CS.light1
    },
    labelText: {
        // Formatting
        fontFamily: "LGC", 
        fontSize: 18,
        letterSpacing: -1,

        // Color
        color: CS.light1,
    },
    matchKeyText: {
        // Formatting
        fontFamily: "LGC", 
        fontSize: 18,
        letterSpacing: 1,

        // Color
        color: CS.dark2,
    }
})

const globalConatinerStyles = StyleSheet.create({
    // General containers
    centerContainer: {
        flex: 1,
        backgroundColor: CS.dark1,
        justifyContent: "center",
    },
    topContainer: {
        flex: 1,
        backgroundColor: CS.dark1,
    },
    fullscreenBackground: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: "100%",
    },
    viewBackground: {
        position: "absolute",
        alignSelf: "center",
        width: "100%",
        height: "100%",
    },

    // Layout
    columnContainer: {
        flex: 1,
        flexDirection: "column"
    },
    rowContainer: {
        flex: 1,
        flexDirection: "row"
    },
    popupContainer: {
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        padding: 1*vh,
        borderRadius: 1*vw,
    }
});

// Exports
export { globalButtonStyles, globalInputStyles, globalTextStyles, globalConatinerStyles };