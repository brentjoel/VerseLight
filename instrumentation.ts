import { reportOperationalEvent } from "@/lib/operational-monitor";

// Intentionally accept no error/request/context arguments. No remote reporting.
export function onRequestError() {
  reportOperationalEvent("server_error");
}
