// Helper function to format dates based on time range
export function formatDateForTimeRange(
  timestamp: number,
  timeRange: string
): string {
  const date = new Date(timestamp * 1000);

  switch (timeRange) {
    case "1D":
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "5D":
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    case "1M":
    case "3M":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "6M":
    case "YTD":
    case "1Y":
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    case "5Y":
    case "MAX":
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    default:
      return date.toLocaleDateString("en-US");
  }
}
