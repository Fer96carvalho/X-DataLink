
import { format} from "date-fns";
import { toZonedTime } from "date-fns-tz";

export function dataHoraFormat(timestamp: string): string {
  const date = new Date(timestamp);
  const timeZone = "America/Sao_Paulo";
  const zonedDate = toZonedTime(date, timeZone);

  return format(zonedDate, "dd/MM/yyyy HH:mm");
}
