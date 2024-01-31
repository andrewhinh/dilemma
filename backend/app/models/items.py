"""Item models."""
from contextlib import suppress
from typing import Any

from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from langchain.callbacks.base import AsyncCallbackHandler
from pydantic import BaseModel
from starlette.websockets import WebSocketState


class MessageResponse(BaseModel):
    """Response model for messages."""

    message: str


class StatusResponse(BaseModel):
    """Response model for status."""

    status: str


class ErrorResponse(StatusResponse):
    """Response model for errors."""

    error_message: str


class DoneResponse(StatusResponse):
    """Response model for done."""

    result: str


class WebSocketStreamingCallback(AsyncCallbackHandler):
    """Callback handler for streaming LLM responses."""

    def __init__(self, websocket: WebSocket):
        self.websocket = websocket

    async def on_llm_new_token(self, token: str, **_: Any) -> None:
        """Run when LLM generates a new token."""
        with suppress(
            Exception
        ):  # Suppresses `Error in WebSocketStreamingCallback.on_llm_new_token callback: received 1000 (OK); then sent 1000 (OK)`
            if self.websocket.client_state == WebSocketState.CONNECTED:
                if token != "":
                    response = MessageResponse(message=token)
                    await self.websocket.send_json(jsonable_encoder(response))
