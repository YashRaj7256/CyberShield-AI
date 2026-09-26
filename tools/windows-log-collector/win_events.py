"""
Windows Event Log Reader module.
Extracts security events via wevtutil or PowerShell without external dependencies.
"""

from __future__ import annotations

import ctypes
import logging
import os
import subprocess
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger("windows_collector.events")

# Windows Event XML Namespace
XML_NS = "{http://schemas.microsoft.com/win/2004/08/events/event}"


def is_elevated() -> bool:
    """Check if the current process has Administrator privileges."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin() != 0
    except Exception:
        return False


@dataclass
class RawWinEvent:
    """Represents an un-normalized event extracted from Windows Event Log."""

    channel: str
    event_id: int
    record_id: int
    timestamp: str  # ISO-8601
    computer: str
    provider: str
    level: int = 4
    user_sid: Optional[str] = None
    event_data: Dict[str, Any] = field(default_factory=dict)
    message: Optional[str] = None


class WindowsEventReader:
    """Reads events from Windows Event Log channels."""

    # Security Log XPath query: 4624, 4625, 4634, 4648, 4672, 4688, 4720, 4726, 4740
    SECURITY_XPATH = (
        "*[System[(EventID=4624 or EventID=4625 or EventID=4634 or "
        "EventID=4648 or EventID=4672 or EventID=4688 or EventID=4720 or "
        "EventID=4726 or EventID=4740)]]"
    )

    # Windows Defender Operational XPath query: 1116, 1117, 1000, 1001, 1006, 1007, 1008, 1119, 5007
    DEFENDER_XPATH = (
        "*[System[(EventID=1116 or EventID=1117 or EventID=1000 or "
        "EventID=1001 or EventID=1006 or EventID=1007 or EventID=1008 or "
        "EventID=1119 or EventID=5007)]]"
    )

    # System Log security/service XPath query: 7045 (service installed), 7036, 10016 (DCOM permission)
    SYSTEM_XPATH = (
        "*[System[(EventID=7045 or EventID=7036 or EventID=10016 or EventID=41)]]"
    )

    @classmethod
    def query_wevtutil(
        cls,
        channel: str,
        xpath: str,
        max_events: int = 50,
        reverse: bool = True,
    ) -> List[RawWinEvent]:
        """Query events using wevtutil.exe (native, zero dependency)."""
        cmd = [
            "wevtutil",
            "qe",
            channel,
            f"/q:{xpath}",
            f"/c:{max_events}",
            "/f:RenderedXml",
        ]
        if reverse:
            cmd.append("/rd:true")

        try:
            res = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False,
                encoding="utf-8",
                errors="replace",
            )
        except FileNotFoundError:
            logger.error("wevtutil command not found on system")
            return []

        if res.returncode != 0:
            err_msg = res.stderr.strip()
            if "Access is denied" in err_msg or "0x5" in err_msg:
                logger.warning(
                    "Access denied to channel '%s'. (Elevation required for Security channel)",
                    channel,
                )
            else:
                logger.debug("wevtutil returned non-zero (%d) for %s: %s", res.returncode, channel, err_msg)
            return []

        xml_output = res.stdout.strip()
        if not xml_output:
            return []

        return cls._parse_events_xml(xml_output, channel)

    @classmethod
    def _parse_events_xml(cls, xml_content: str, default_channel: str) -> List[RawWinEvent]:
        """Parse wevtutil rendered XML output into RawWinEvent list."""
        wrapped = f"<Events>{xml_content}</Events>"
        try:
            root = ET.fromstring(wrapped)
        except ET.ParseError as e:
            logger.warning("XML parse error on event batch: %s", e)
            return []

        events: List[RawWinEvent] = []
        for event_elem in root.iter(f"{XML_NS}Event"):
            try:
                system_elem = event_elem.find(f"{XML_NS}System")
                if system_elem is None:
                    continue

                event_id_elem = system_elem.find(f"{XML_NS}EventID")
                event_id = int(event_id_elem.text) if event_id_elem is not None and event_id_elem.text else 0

                record_elem = system_elem.find(f"{XML_NS}EventRecordID")
                record_id = int(record_elem.text) if record_elem is not None and record_elem.text else 0

                time_elem = system_elem.find(f"{XML_NS}TimeCreated")
                time_str = ""
                if time_elem is not None:
                    time_str = time_elem.attrib.get("SystemTime", "")

                if not time_str:
                    time_str = datetime.now(timezone.utc).isoformat()

                comp_elem = system_elem.find(f"{XML_NS}Computer")
                computer = comp_elem.text if comp_elem is not None and comp_elem.text else "localhost"

                chan_elem = system_elem.find(f"{XML_NS}Channel")
                channel = chan_elem.text if chan_elem is not None and chan_elem.text else default_channel

                prov_elem = system_elem.find(f"{XML_NS}Provider")
                provider = prov_elem.attrib.get("Name", "") if prov_elem is not None else ""

                sec_elem = system_elem.find(f"{XML_NS}Security")
                user_sid = sec_elem.attrib.get("UserID") if sec_elem is not None else None

                level_elem = system_elem.find(f"{XML_NS}Level")
                level = int(level_elem.text) if level_elem is not None and level_elem.text else 4

                # Extract EventData elements
                event_data: Dict[str, Any] = {}
                data_parent = event_elem.find(f"{XML_NS}EventData")
                if data_parent is not None:
                    for idx, data_elem in enumerate(data_parent.iter(f"{XML_NS}Data")):
                        data_name = data_elem.attrib.get("Name")
                        data_val = data_elem.text or ""
                        if data_name:
                            event_data[data_name] = data_val
                        else:
                            event_data[f"Data_{idx}"] = data_val

                # Extract human-readable Message from RenderingInfo if available
                message: Optional[str] = None
                render_elem = event_elem.find(f"{XML_NS}RenderingInfo")
                if render_elem is not None:
                    msg_elem = render_elem.find(f"{XML_NS}Message")
                    if msg_elem is not None and msg_elem.text:
                        message = msg_elem.text.strip()

                events.append(
                    RawWinEvent(
                        channel=channel,
                        event_id=event_id,
                        record_id=record_id,
                        timestamp=time_str,
                        computer=computer,
                        provider=provider,
                        level=level,
                        user_sid=user_sid,
                        event_data=event_data,
                        message=message,
                    )
                )
            except Exception as item_err:
                logger.debug("Failed to parse individual event: %s", item_err)
                continue

        return events

    @classmethod
    def collect_available_events(
        cls,
        max_events_per_channel: int = 50,
        last_seen_records: Optional[Dict[str, int]] = None,
    ) -> List[RawWinEvent]:
        """Collect events across accessible security channels.

        Prioritizes:
        1. Security channel (if elevated / accessible)
        2. Microsoft Defender Operational channel
        3. System security channel
        """
        all_events: List[RawWinEvent] = []
        last_seen = last_seen_records or {}

        # 1. Check Security log
        sec_events = cls.query_wevtutil(
            "Security",
            cls.SECURITY_XPATH,
            max_events=max_events_per_channel,
            reverse=True,
        )
        if sec_events:
            last_rec = last_seen.get("Security", 0)
            new_sec = [e for e in sec_events if e.record_id > last_rec]
            all_events.extend(new_sec)
        else:
            if not is_elevated():
                logger.info(
                    "Standard user mode: Querying Windows Defender & System channels. "
                    "(Tip: Run from an elevated Administrator prompt to also collect Security log events 4624/4625/etc.)"
                )

        # 2. Windows Defender Operational channel
        defender_events = cls.query_wevtutil(
            "Microsoft-Windows-Windows Defender/Operational",
            cls.DEFENDER_XPATH,
            max_events=max_events_per_channel,
            reverse=True,
        )
        last_def = last_seen.get("Microsoft-Windows-Windows Defender/Operational", 0)
        new_def = [e for e in defender_events if e.record_id > last_def]
        all_events.extend(new_def)

        # 3. System channel (security / service / privilege events)
        sys_events = cls.query_wevtutil(
            "System",
            cls.SYSTEM_XPATH,
            max_events=max_events_per_channel,
            reverse=True,
        )
        last_sys = last_seen.get("System", 0)
        new_sys = [e for e in sys_events if e.record_id > last_sys]
        all_events.extend(new_sys)

        # Sort all collected events chronologically descending
        all_events.sort(key=lambda x: x.timestamp, reverse=True)
        return all_events
