import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

export async function captureAndShare(
  viewRef: React.RefObject<any>,
  dialogTitle = "Share via",
): Promise<boolean> {
  try {
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "tmpfile",
    });
    const available = await Sharing.isAvailableAsync();
    if (!available) return false;
    await Sharing.shareAsync(uri as string, { dialogTitle, mimeType: "image/png" });
    return true;
  } catch {
    return false;
  }
}
