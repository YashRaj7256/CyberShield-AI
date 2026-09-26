"""
Event Normalizer module.
Converts raw Windows Event Log entries into the project's SecurityLog schema.
Ensures strict conformity with CreateLogDto without fabricating false telemetry.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Optional

from win_events import RawWinEvent


def _sanitize_ip(ip_val: Optional[str]) -> str:
    """Normalize Windows IP strings, defaulting to 127.0.0.1 if local or unset."""
    if not ip_val or ip_val.strip() in ("-", "::1", "0.0.0.0", "localhost"):
        return "127.0.0.1"
    ip = ip_val.strip()
    # Basic IPv4 validation
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", ip):
        return ip
    return "127.0.0.1"


def _sanitize_port(port_val: Any) -> int:
    """Safely convert port string or number to an integer in 0-65535."""
    try:
        p = int(str(port_val).strip())
        if 0 <= p <= 65535:
            return p
    except (ValueError, TypeError):
        pass
    return 0


def normalize_event(event: RawWinEvent, device_type: str = "Windows Laptop") -> Dict[str, Any]:
    """Convert a RawWinEvent into a dictionary matching the backend SecurityLog schema."""
    eid = event.event_id
    data = event.event_data

    # Extract user information
    target_user = data.get("TargetUserName") or data.get("SubjectUserName") or data.get("AccountName")
    user_sid = data.get("TargetUserSid") or data.get("SubjectUserSid") or event.user_sid
    if target_user in ("-", "SYSTEM", "LOCAL SERVICE", "NETWORK SERVICE") and user_sid:
        target_user = data.get("SubjectUserName") or target_user

    # Default network attributes
    source_ip = _sanitize_ip(data.get("IpAddress") or data.get("ClientIP") or data.get("SourceAddress"))
    dest_ip = "127.0.0.1"
    source_port = _sanitize_port(data.get("IpPort") or data.get("SourcePort"))
    dest_port = 0
    protocol = "TCP"

    # Default action, severity, source, eventType, message
    action = "ALLOW"
    severity = "LOW"
    source = "WINDOWS_SECURITY"
    event_type = f"WIN_EVENT_{eid}"
    message = event.message or f"Windows Event {eid} in {event.channel}"

    # ─────────────────────────────────────────────────────────────
    # Windows Security Channel Mappings (4624, 4625, 4634, etc.)
    # ─────────────────────────────────────────────────────────────
    if eid == 4624:
        logon_type = data.get("LogonType", "2")
        event_type = "LOGIN_SUCCESS"
        action = "ALLOW"
        severity = "LOW"
        dest_port = 3389 if logon_type == "10" else 445 if logon_type == "3" else 0
        message = f"Windows authentication successful for user '{target_user or 'unknown'}' (LogonType: {logon_type})"

    elif eid == 4625:
        logon_type = data.get("LogonType", "2")
        status = data.get("Status", "0xC000006D")
        sub_status = data.get("SubStatus", "0xC000006A")
        event_type = "LOGIN_FAILURE"
        action = "DENY"
        severity = "HIGH"
        dest_port = 3389 if logon_type == "10" else 445 if logon_type == "3" else 0
        message = (
            f"Windows authentication failed for user '{target_user or 'unknown'}' "
            f"(Status: {status}, SubStatus: {sub_status})"
        )

    elif eid == 4634:
        event_type = "LOGOFF"
        action = "ALLOW"
        severity = "LOW"
        message = f"Windows user session closed for '{target_user or 'unknown'}'"

    elif eid == 4648:
        event_type = "EXPLICIT_CREDENTIAL_LOGON"
        action = "ALERT"
        severity = "MEDIUM"
        target_server = data.get("TargetServerName", "local")
        message = f"Explicit credentials used by '{target_user or 'unknown'}' targeting '{target_server}'"

    elif eid == 4672:
        event_type = "PRIVILEGE_ASSIGNED"
        action = "ALLOW"
        severity = "MEDIUM"
        message = f"Special administrative privileges assigned to logon session for '{target_user or 'admin'}'"

    elif eid == 4688:
        event_type = "PROCESS_CREATION"
        action = "ALLOW"
        severity = "LOW"
        proc = data.get("NewProcessName", "unknown_process")
        parent = data.get("ParentProcessName", "unknown_parent")
        message = f"Process spawned: {proc} (Parent: {parent})"

    elif eid == 4720:
        event_type = "ACCOUNT_CREATED"
        action = "ALERT"
        severity = "HIGH"
        message = f"New local Windows user account created: '{target_user or 'unknown'}'"

    elif eid == 4726:
        event_type = "ACCOUNT_DELETED"
        action = "ALERT"
        severity = "HIGH"
        message = f"Windows user account deleted: '{target_user or 'unknown'}'"

    elif eid == 4740:
        event_type = "ACCOUNT_LOCKED"
        action = "DENY"
        severity = "CRITICAL"
        message = f"User account locked out due to consecutive failed authentications: '{target_user or 'unknown'}'"

    # ─────────────────────────────────────────────────────────────
    # Microsoft Defender Channel Mappings
    # ─────────────────────────────────────────────────────────────
    elif "Defender" in event.channel:
        source = "ANTIVIRUS"
        if eid in (1116, 1117):
            event_type = "MALWARE_DETECTED"
            action = "DROP" if eid == 1117 else "ALERT"
            severity = "CRITICAL"
            threat = data.get("Threat Name", "Unknown Threat")
            path = data.get("Path", "Unknown Path")
            message = f"Microsoft Defender detected malware threat '{threat}' in {path}"
        elif eid in (1000, 1001):
            event_type = "ANTIVIRUS_SCAN"
            action = "ALLOW"
            severity = "LOW"
            scan_type = "Full Scan" if eid == 1001 else "Quick Scan"
            message = f"Microsoft Defender {scan_type} completed"
        elif eid == 5007:
            event_type = "CONFIG_CHANGE"
            action = "ALERT"
            severity = "MEDIUM"
            message = "Microsoft Defender configuration modified"
        else:
            event_type = "ANTIVIRUS_EVENT"
            action = "ALLOW"
            severity = "LOW"
            message = f"Microsoft Defender operational event {eid}"

    # ─────────────────────────────────────────────────────────────
    # System Channel Mappings
    # ─────────────────────────────────────────────────────────────
    elif event.channel == "System":
        if eid == 7045:
            event_type = "SERVICE_INSTALLED"
            action = "ALERT"
            severity = "HIGH"
            source = "WINDOWS_SECURITY"
            svc = data.get("ServiceName", "UnknownService")
            img = data.get("ImagePath", "UnknownPath")
            message = f"New Windows system service installed: '{svc}' (Binary: {img})"
        elif eid == 10016:
            event_type = "PERMISSION_DENIED"
            action = "DENY"
            severity = "MEDIUM"
            source = "WINDOWS_SECURITY"
            message = "DCOM security activation permission denied"
        elif eid == 7036:
            event_type = "SERVICE_STATUS_CHANGE"
            action = "ALLOW"
            severity = "LOW"
            source = "SERVER"
            svc_name = data.get("param1", "System Service")
            svc_state = data.get("param2", "State Changed")
            message = f"Service '{svc_name}' entered {svc_state} state"
        elif eid == 41:
            event_type = "SYSTEM_SHUTDOWN"
            action = "ALERT"
            severity = "MEDIUM"
            source = "SERVER"
            message = "System rebooted without cleanly shutting down first"

    # Assemble normalized log document
    normalized: Dict[str, Any] = {
        "timestamp": event.timestamp,
        "sourceIp": source_ip,
        "destinationIp": dest_ip,
        "sourcePort": source_port,
        "destinationPort": dest_port,
        "protocol": protocol,
        "action": action,
        "severity": severity,
        "source": source,
        "eventType": event_type,
        "message": message,
        "userName": target_user if target_user and target_user != "-" else None,
        "userId": str(user_sid) if user_sid and user_sid != "-" else None,
        "deviceType": device_type,
        "os": "Windows",
        # Do not invent fake geolocation or browser values for local Windows telemetry
        "country": None,
        "city": None,
        "latitude": None,
        "longitude": None,
        "browser": None,
        "rawData": {
            "channel": event.channel,
            "event_id": eid,
            "record_id": event.record_id,
            "provider": event.provider,
            "computer": event.computer,
        },
    }

    return normalized
