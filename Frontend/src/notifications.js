import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

const CHANNEL_ID = "medicine-reminders";

// Medicine ID-ஐ Android notification ID-ஆ மாற்ற
function getNotificationId(medicineId) {
  let hash = 0;

  const text = String(medicineId);

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash) || 1;
}


// ==========================================
// Initialize Android Notifications
// ==========================================

export async function initializeNotifications() {

  // Laptop/browser-ல் இதை செய்ய வேண்டாம்
  if (!Capacitor.isNativePlatform()) {
    console.log("Browser mode");
    return;
  }

  try {

    // Notification permission
    let permission =
      await LocalNotifications.checkPermissions();

    console.log(
      "Notification permission:",
      permission
    );

    if (permission.display !== "granted") {

      permission =
        await LocalNotifications.requestPermissions();

      console.log(
        "Notification permission after request:",
        permission
      );
    }


    // Android notification channel
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,

      name: "Medicine Reminders",

      description:
        "Medicine reminder alarms",

      importance: 5,

      visibility: 1,

      sound: "alarm.mp3",

      vibration: true,

      lights: true,

      lightColor: "#2563eb",
    });


    console.log(
      "✅ Android notification channel created"
    );

  } catch (error) {

    console.log(
      "❌ Notification initialization error:",
      error
    );
  }
}


// ==========================================
// Schedule Medicine Alarm
// ==========================================

export async function scheduleMedicineReminder(
  medicine
) {

  // Laptop/browser-ல் native alarm வேண்டாம்
  if (!Capacitor.isNativePlatform()) {

    console.log(
      "Browser mode - native Android alarm skipped"
    );

    return;
  }

  try {

    const [hourString, minuteString] =
      medicine.time.split(":");

    const hour = Number(hourString);
    const minute = Number(minuteString);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute)
    ) {

      console.log(
        "❌ Invalid medicine time:",
        medicine.time
      );

      return;
    }


    const notificationId =
      getNotificationId(medicine._id);


    // Same medicine-க்கு existing alarm இருந்தால் cancel
    try {

      await LocalNotifications.cancel({
        notifications: [
          {
            id: notificationId,
          },
        ],
      });

    } catch (error) {

      console.log(
        "Old notification cancel skipped:",
        error
      );
    }


    // Daily Android reminder
    await LocalNotifications.schedule({

      notifications: [

        {
          id: notificationId,

          title:
            "💊 Medicine Reminder",

          body:
            `Time to take ${medicine.medicineName}`,

          channelId:
            CHANNEL_ID,

          sound:
            "alarm.mp3",

          schedule: {

            on: {
              hour: hour,
              minute: minute,
            },

            allowWhileIdle: true,
          },

          extra: {

            medicineId:
              medicine._id,

            medicineName:
              medicine.medicineName,

            time:
              medicine.time,
          },
        },

      ],
    });


    console.log(
      `✅ Android alarm scheduled: ${medicine.medicineName} at ${medicine.time}`
    );

  } catch (error) {

    console.log(
      "❌ Schedule medicine alarm error:",
      error
    );
  }
}


// ==========================================
// Cancel Medicine Alarm
// ==========================================

export async function cancelMedicineReminder(
  medicineId
) {

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {

    const notificationId =
      getNotificationId(medicineId);

    await LocalNotifications.cancel({

      notifications: [
        {
          id: notificationId,
        },
      ],

    });

    console.log(
      "✅ Medicine alarm cancelled:",
      medicineId
    );

  } catch (error) {

    console.log(
      "❌ Cancel alarm error:",
      error
    );
  }
}