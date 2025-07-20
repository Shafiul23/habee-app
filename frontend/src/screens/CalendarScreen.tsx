// // frontend/src/screens/CalendarScreen.tsx
// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, Text } from "react-native";
// import { Calendar } from "react-native-calendars";
// import { format } from "date-fns";
// import { getHabitLogs } from "../../lib/api";

// export default function CalendarScreen() {
//   const [markedDates, setMarkedDates] = useState({});
//   const [month, setMonth] = useState<string>(format(new Date(), "yyyy-MM"));

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const logs = await getHabitLogs(month);
//         const marked: Record<string, any> = {};

//         for (const [date, summary] of Object.entries(logs)) {
//           let color = "#fff";

//           switch (summary.status) {
//             case "complete":
//               color = "#52c41a"; // green
//               break;
//             case "partial":
//               color = "#f7ce46"; // yellow
//               break;
//             case "none":
//               color = "#ff4d4f"; // red
//               break;
//             case "future":
//               color = "#e0e0e0"; // light grey
//               break;
//             case "inactive":
//               color = "#f5f5f5"; // off-white
//               break;
//           }

//           marked[date] = {
//             customStyles: {
//               container: {
//                 backgroundColor: color,
//                 borderRadius: 8,
//               },
//               text: {
//                 color: "#000",
//                 fontWeight: "bold",
//               },
//             },
//           };
//         }

//         setMarkedDates(marked);
//       } catch (err) {
//         console.error("Failed to load calendar data:", err);
//       }
//     };

//     fetchData();
//   }, [month]);

//   const onMonthChange = (date: { year: number; month: number }) => {
//     setMonth(`${date.year}-${String(date.month).padStart(2, "0")}`);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Monthly Progress</Text>
//       <Calendar
//         markingType="custom"
//         markedDates={markedDates}
//         onMonthChange={onMonthChange}
//         theme={{
//           backgroundColor: "#fff",
//           calendarBackground: "#fff",
//           textSectionTitleColor: "#000",
//           selectedDayBackgroundColor: "#000",
//           dayTextColor: "#000",
//           todayTextColor: "#000",
//           arrowColor: "#000",
//           monthTextColor: "#000",
//         }}
//         style={styles.calendar}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "700",
//     marginBottom: 20,
//     color: "#000",
//   },
//   calendar: {
//     borderRadius: 12,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
// });

// CalendarScreen.tsx
import React from "react";
import { View, Text } from "react-native";

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1, paddingTop: 80, paddingHorizontal: 20 }}>
      <Text>Calendar Screen (Habits)</Text>
    </View>
  );
}
