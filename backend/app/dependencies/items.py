"""Dependencies for items endpoints."""

import logging
import signal
from contextlib import contextmanager
from uuid import UUID

from app.config import get_settings

logger = logging.getLogger(__name__)

SETTINGS = get_settings()
OPENAI_API_KEY = SETTINGS.openai_api_key

DEFAULT_MODEL = "gpt-3.5-turbo"
DEFAULT_MAX_HOPS = 2
DEFAULT_TEMPERATURE = 0.7
DEFAULT_DELTA = 0.0001
DEFAULT_TIMEOUT = 5  # seconds


# Convert UUID to float between 0 and 1
def uuid_to_float(uuid: UUID) -> float:
    """Convert UUID to float between 0 and 1."""
    return int(uuid) / 2**128


# Timeout handling
class TimeoutException(Exception):
    """Exception raised when a timeout occurs."""

    pass


@contextmanager
def time_limit(seconds):
    def signal_handler(signum, frame):
        raise TimeoutException

    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
