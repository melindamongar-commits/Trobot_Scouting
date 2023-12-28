// Library Imports
import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Component Imports
import { ColorScheme as CS } from '../../common/ColorScheme';
import { fU, vh, vw } from '../../common/Constants';
import { globalContainerStyles, globalInputStyles, globalTextStyles } from '../../common/GlobalStyleSheet';
import { TTGradient } from '../components/ExtraComponents';
import { TTDropdown } from '../components/InputComponents';
import { matchTypeValues, teamColorValues } from './ScoutTeam';

const chartableValues = ["Auto Points", "Teleop Points", "Cubes", "Cones", "Misses", "Docking"];

const TeamAnalytics = ({route, navigation}) => {

    // States
    const [chartValue, setChartValue] = React.useState("Teleop Points");
    const [chartData, setChartData] = React.useState([]);
    const [chartLabels, setChartLabels] = React.useState([]);

    const checkEmptyComments = () => {
        for (const match of route.params.teamData) {
            if (match[28].length !== 0) return false;
        }
        for (const pit of route.params.pitData) {
            if (pit[4].length !==0)return false;
        }
        return true;
    }

    const checkForDNP = () => {
        for (const match of route.params.teamData) {
            const comment = match[28].toLowerCase().replace(/’/g, "'");
            if (
                comment.includes("dnp") || 
                comment.includes("don't pick") || 
                comment.includes("dont pick") || 
                comment.includes("do not pick")
            ) return true;
        }
        for (const pit of route.params.pitData) {
            const comment = pit[4].toLowerCase().replace(/’/g, "'");
            if (
                comment.includes("dnp") || 
                comment.includes("don't pick") || 
                comment.includes("dont pick") || 
                comment.includes("do not pick")
            ) return true;
        }
        return false;
    }

    // Should be a better way to do this
    const getSpecificData = (section) => {
        switch (section) {
            case ("Total Points"): {
                const points = route.params.teamData.map((md) => {
                    return 6*(Number(md[10])+Number(md[13])) + 4*(Number(md[11])+Number(md[14]))+ 3*(Number(md[12])+Number(md[15]))
                    + 5*(Number(md[17])+Number(md[20])) + 3*(Number(md[18])+Number(md[21]))+ 2*(Number(md[19])+Number(md[22]))
                    + 8*Number(md[8]) + 12*Number(md[9]) + 6*Number(md[25]) + 10*Number(md[26]) + 2*Number(md[24]) + 3*Number(md[7]);
                });
                return points;
            } break;
            case ("Auto Points"): {
                const points = route.params.teamData.map((md) => {
                    return 6*(Number(md[10])+Number(md[13])) + 4*(Number(md[11])+Number(md[14]))+ 3*(Number(md[12])+Number(md[15]));
                });
                return points;
            } break;
            case ("Teleop Points"): {
                const points = route.params.teamData.map((md) => {
                    return 5*(Number(md[17])+Number(md[20])) + 3*(Number(md[18])+Number(md[21]))+ 2*(Number(md[19])+Number(md[22]));
                });
                return points;
            } break;
            case ("Misses"): {
                const count = route.params.teamData.map((md) => {
                    return Number(md[16]) + Number(md[23]);
                });
                return count;
            } break;
            case ("Docking"): {
                const count = route.params.teamData.map((md) => {
                    return 8*Number(md[8]) + 12*Number(md[9]) + 6*Number(md[25]) + 10*Number(md[26]) + 2*Number(md[24]);
                });
                return count;
            } break;
            case ("Cubes"): {
                const count = route.params.teamData.map((md) => {
                    return Number(md[10])+Number(md[11])+Number(md[12]) + Number(md[17])+Number(md[18])+Number(md[19]);
                });
                return count;
            } break;
            case ("Cones"): {
                const count = route.params.teamData.map((md) => {
                    return Number(md[13])+Number(md[14])+Number(md[15]) + Number(md[20])+Number(md[21])+Number(md[22]);
                });
                return count;
            } break;
        }
    }

    React.useEffect(() => {
        const matchAbbreviations = route.params.teamData.map((item) => {
            return `${matchTypeValues[item[5]][1]}${item[4]}`;
        });
        setChartLabels(matchAbbreviations);
        
        setChartData(getSpecificData("Teleop Points"));
    }, [])

    // Individual match data component
    const MatchDataBox = (props) => {
        return (
            <View key={props.id} style={styles.matchDataContainer}>
                <Text style={{...globalTextStyles.secondaryText, fontSize: 24*fU, color: CS.dark1}}>
                    {matchTypeValues[props.matchData[5]]} {props.matchData[4]}  —  {teamColorValues[props.matchData[7]]}
                </Text>

                {/* Auto subcontainer */}
                <View style={styles.matchDataSubcontainer}>
                    <Text style={{...globalTextStyles.secondaryText, fontSize: 20*fU, color: CS.dark1}}>
                        Auto
                    </Text>

                    <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[7] == 1 ? "" : "No"}</Text> Mobility</Text>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Cube High-<Text style={styles.dataText}>{props.matchData[10]}</Text></Text>
                        <Text style={styles.dataLabel}>Cube Mid-<Text style={styles.dataText}>{props.matchData[11]}</Text></Text>
                        <Text style={styles.dataLabel}>Cube Low-<Text style={styles.dataText}>{props.matchData[12]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Cone High-<Text style={styles.dataText}>{props.matchData[13]}</Text></Text>
                        <Text style={styles.dataLabel}>Cone Mid-<Text style={styles.dataText}>{props.matchData[14]}</Text></Text>
                        <Text style={styles.dataLabel}>Cone Low-<Text style={styles.dataText}>{props.matchData[15]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Miss-<Text style={styles.dataText}>{props.matchData[16]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[8] == 1 ? "Did" : "Did not"}</Text> dock</Text>
                        <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[9] == 1 ? "Did" : "Did not"}</Text> engage</Text>
                    </View>
                </View>

                {/* Teleop Subcontainer */}
                <View style={styles.matchDataSubcontainer}>
                    <Text style={{...globalTextStyles.secondaryText, fontSize: 20*fU, color: CS.dark1}}>
                        Teleop
                    </Text>

                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Cube High-<Text style={styles.dataText}>{props.matchData[17]}</Text></Text>
                        <Text style={styles.dataLabel}>Cube Mid-<Text style={styles.dataText}>{props.matchData[18]}</Text></Text>
                        <Text style={styles.dataLabel}>Cube Low-<Text style={styles.dataText}>{props.matchData[19]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Cone High-<Text style={styles.dataText}>{props.matchData[20]}</Text></Text>
                        <Text style={styles.dataLabel}>Cone Mid-<Text style={styles.dataText}>{props.matchData[21]}</Text></Text>
                        <Text style={styles.dataLabel}>Cone Low-<Text style={styles.dataText}>{props.matchData[22]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>Miss-<Text style={styles.dataText}>{props.matchData[23]}</Text></Text>
                    </View>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[24] == 1 ? "Did" : "Did not"}</Text> parked</Text>
                        <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[25] == 1 ? "Did" : "Did not"}</Text> dock</Text>
                        <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.matchData[26] == 1 ? "Did" : "Did not"}</Text> engage</Text>
                    </View>
                </View>

                {/* Comment Subcontainer */}
                <View style={styles.matchDataSubcontainer}>
                    <Text style={{...globalTextStyles.secondaryText, fontSize: 20*fU, color: CS.dark1}}>
                        Comment
                    </Text>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>"{props.matchData[28]}"</Text>
                    </View>
                </View>

            </View>
        );
    }
    // Individual pit data component
    const PitDataBox = (props) => {

    if (props.pitData && props.pitData.length > 0)
    {
        return (
            <View key={props.id} style={styles.matchDataContainer}>
                <Text style={{...globalTextStyles.secondaryText, fontSize: 24*fU, color: CS.dark1}}>
                    {props.pitData[1]} {props.pitData[2]} 
                </Text>

                {/* Comment Subcontainer */}
                <View style={styles.matchDataSubcontainer}>
                    <Text style={{...globalTextStyles.secondaryText, fontSize: 20*fU, color: CS.dark1}}>
                        Comments
                    </Text>
                    <View style={styles.rowAlignContainer}>
                        <Text style={styles.dataLabel}>"{props.pitData[4]}"</Text>
                    </View>
                </View>

                {/* Image subcontainer */}
                <View style={styles.matchDataSubcontainer}>
                    <Text style={{...globalTextStyles.secondaryText, fontSize: 20*fU, color: CS.dark1}}>
                        Images
                    </Text>

                    <Text style={styles.dataLabel}><Text style={styles.dataText}>{props.pitData[5]}</Text></Text>
                </View>

            </View>
        );
        } else {
            return;
        }
    }

    const PerformanceChart = (data, labels) => {

            if (chartLabels.length === 0 || chartData.length === 0) return;

            // Centering this is a remarkable pain
            return (
                <View style={{alignItems: "center", justifyContent: "center", marginTop: 4*vh, marginRight: 4*vw}}>
                    <LineChart
                        data={{
                            labels: chartLabels,
                            datasets: [{
                                data: chartData
                            }],
                        }}
                        width={90*vw}
                        height={70*vw}
                        yAxisInterval={1}
                        segments={Math.min(Math.max(...chartData), 9)}
                        fromZero={true}
                        withOuterLines={false}
                        chartConfig={{
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientToOpacity: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            decimalPlaces: 0,
                            propsForDots: {
                                r: 1*vh,
                                strokeWidth: 0,
                            },
                            propsForLabels: {
                                fontSize: 8
                            }
                        }}
                        style={{
                        }}
                    />
                </View>
        );
    }

    return (
        <View style={globalContainerStyles.centerContainer}>
            <TTGradient/>

            { checkForDNP() && (
                <View style={styles.warningTopBar}>
                    <Text style={{fontFamily: "LGC Light Italic", color: CS.light2, fontSize: 16*fU, textAlign: "center"}}>
                        A commenter has flagged this team as a <Text style={{fontFamily: "LGC Bold"}}>do not pick</Text> team!
                    </Text>
                </View>
            )}

            <ScrollView>
                {/* General Team Overview */}
                <View style={styles.sectionStyle}>
                    <TTGradient/>
                    <View style={{margin: 1*vh}}/>

                    <Text style={styles.sectionTitle}>
                        Team {route.params.teamNumber} Overview
                    </Text>

                    <View style={{...styles.rowAlignContainer, paddingHorizontal: 3*vw}}>
                        <View style={{...styles.columnContainer, alignItems: "center"}}>
                            <Text style={styles.statHeader}>Played</Text>
                            <Text style={globalTextStyles.secondaryText}>{route.params.teamData.length}</Text>
                        </View>
                        <View style={{...styles.columnContainer, alignItems: "center"}}>
                            <Text style={styles.statHeader}>Auto Avg</Text>
                            <Text style={globalTextStyles.secondaryText}>{route.params.teamStatistics.auto}</Text>
                        </View>
                        <View style={{...styles.columnContainer, alignItems: "center"}}>
                            <Text style={styles.statHeader}>Teleop Avg</Text>
                            <Text style={globalTextStyles.secondaryText}>{route.params.teamStatistics.teleop}</Text>
                        </View>
                        <View style={{...styles.columnContainer, alignItems: "center"}}>
                            <Text style={styles.statHeader}>Miss Avg</Text>
                            <Text style={globalTextStyles.secondaryText}>{route.params.teamStatistics.misses}</Text>
                        </View>
                        <View style={{...styles.columnContainer, alignItems: "center"}}>
                            <Text style={styles.statHeader}>Dock Avg</Text>
                            <Text style={globalTextStyles.secondaryText}>{route.params.teamStatistics.docking}</Text>
                        </View>
                    </View>
                    <View style={{margin: 2*vh}}/>
                </View>

                {/* Performance Over Time */}
                <View style={{...styles.sectionStyle, zIndex: 5}}>
                    <TTGradient/>
                    <View style={{margin: 1*vh}}/>

                    <Text style={styles.sectionTitle}>
                        Performance Chart
                    </Text>


                    {   route.params.teamData.length < 3 &&
                        <Text style={{fontFamily: "LGC Light", color: CS.light2, fontSize: 16*fU, textAlign: "center", margin: 2*vh}}>
                            There isn't enough data on this team to make a chart
                        </Text>
                    }
                    {
                        route.params.teamData.length >= 3 &&
                        <View style={{flex: 1, flexDirection: "column", width: "100%", alignItems: "center"}}>
                            <View style={{margin: 1.5*vh}}/>
                            <View style={{...styles.rowAlignContainer, zIndex: 5}}>
                                <Text style={globalTextStyles.labelText}>View graph of...</Text>
                                <TTDropdown 
                                    state={chartValue} 
                                    setState={(value) => {
                                        setChartValue(value);
                                        setChartData(getSpecificData(value));
                                    }} 
                                    items={chartableValues}
                                    boxWidth={50*vw}
                                    boxHeight={6*vh}
                                    boxStyle={globalInputStyles.dropdownInput}
                                    textStyle={globalTextStyles.labelText}
                                    overrideStyle={{margin: 0, alignSelf: "center"}}
                                    zIndex={5}
                                />
                            </View>
                            <PerformanceChart/>
                        </View>
                    }
                    <View style={{margin: 1*vh}}/>

                </View>

                {/* Comments */}
                <View style={styles.sectionStyle}>
                    <TTGradient/>
                    <View style={{margin: 1*vh}}/>

                    <Text style={styles.sectionTitle}>
                        Comments
                    </Text>
                    {route.params.teamData.map((match, index) => {
                        const comment = match[28];
                        if (comment.length !== 0) return (
                            <View key={index}>
                                <Text style={{...globalTextStyles.labelText, margin: 0.5*vh}}>"{comment}"</Text>
                            </View>
                        );
                    })}
                    {route.params.pitData.map((pit, index) => {
                        const comment = pit[4];
                        if (comment.length !== 0) return (
                            <View key={index}>
                                <Text style={{...globalTextStyles.labelText, margin: 0.5*vh}}>"{comment}"</Text>
                            </View>
                        );
                    })}
                    { checkEmptyComments() &&
                        <Text style={{fontFamily: "LGC Light", color: CS.light2, fontSize: 16*fU, textAlign: "center", margin: 2*vh}}>Nobody has commented on this team yet.</Text>
                    }

                    <View style={{margin: 2*vh}}/>
                </View>

                {/* Individual match data */}
                <View style={styles.sectionStyle}>
                    <TTGradient/>
                    <View style={{margin: 1*vh}}/>

                    <Text style={styles.sectionTitle}>
                        Pit Scouting
                    </Text>

                    {route.params.pitData.map((pit, index) => {
                        return <PitDataBox key={index} id={index} pitData={pit}/>
                    })}
                    

                    <Text style={styles.sectionTitle}>
                        Individual Matches
                    </Text>
                    {route.params.teamData.map((match, index) => {
                        return <MatchDataBox key={index} id={index} matchData={match}/>
                    })}

                    <View style={{margin: 2*vh}}/>
                </View>

            </ScrollView>
        </View>
    );
}

// Probably shouldn't be quite this localized
const styles = StyleSheet.create({
    sectionStyle: {
        ...globalContainerStyles.centerContainer, 
        alignItems: "center", 
        backgroundColor: `${CS.dark1}70`,
    },
    sectionTitle: {
        ...globalTextStyles.primaryText, 
        fontSize: 36*fU
    },
    matchDataContainer: {
        ...globalContainerStyles.columnContainer,
        alignItems: "center",
        marginHorizontal: 2*vh,
        marginVertical: 1*vh,
        padding: 1*vh,

        backgroundColor: CS.light1,
        borderRadius: 1*vh,
    },
    matchDataSubcontainer: {
        ...globalContainerStyles.columnContainer,
        alignItems: "center",
        padding: 1*vh,
        margin: 1*vh,
        
        backgroundColor: `${CS.light3}9F`,
        borderRadius: 0.5*vh,
    },
    rowAlignContainer: {
        ...globalContainerStyles.rowContainer, 
        width: "100%", 
        justifyContent: "space-evenly"
    },
    dataText: {
        fontFamily: "LGC Bold",
        fontSize: 14*fU,
    },
    dataLabel: {
        marginVertical: 0.4*vh,

        fontFamily: "LGC Light Italic", // For reasons I cannot explain, setting this to "LGC Light" adds a margin of about 130 to every item using it
        fontSize: 14*fU,
    },
    statHeader: {
        ...globalTextStyles.secondaryText,
        marginTop: 2*vh,
        marginBottom: -1*vh,

        fontSize: 14*fU,
        color: `${CS.light1}9F`
    },
    warningTopBar: {
        alignItems:"center",
        padding: 2*vh,
        zIndex: 10,

        backgroundColor: CS.accent3,
        shadowColor: CS.dark1,
        shadowRadius: 2*vh,
        shadowOpacity: 0.5,
    }
})

// Exports
export default TeamAnalytics;