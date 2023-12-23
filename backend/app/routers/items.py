"""Feature routes."""
from fastapi import APIRouter, WebSocket
from fastapi.encoders import jsonable_encoder
from langchain.chains import LLMChain

from app.dependencies.items import create_llm, create_prompt  # create_dspy
from app.models import DoneResponse, ErrorResponse, WebSocketStreamingCallback

router = APIRouter()
# dspy_model = create_dspy()


# @router.post("/dspy")
# async def dspy(question: str) -> dict:
#     """Endpoint for generating an answer using dspy."""
#     return dspy_model(question)


@router.websocket("/fact")
async def fact_websocket(websocket: WebSocket) -> None:
    """Websocket endpoint for generating a fun fact."""
    model = "gpt-3.5-turbo-1106"
    temperature = 1.0
    prompt = "Tell me something cool about dogs."
    system = str(
        "You are very knowledgeable about dogs. "
        + "A person has just asked you to tell them a fact about dogs. "
        + "Answer them in a few sentences, but not in a 'did you know' format: {prompt}"
    )
    await websocket.accept()
    stream_handler = WebSocketStreamingCallback(websocket)

    try:
        llm = create_llm(
            callbacks=[stream_handler],
            model=model,
            temperature=temperature,
        )
        template = create_prompt(system=system)
        chain = LLMChain(llm=llm, prompt=template)
        result = await chain.arun(prompt)
        response = DoneResponse(result=result, status="DONE")
        await websocket.send_json(jsonable_encoder(response))
    except Exception as exception:
        error = ErrorResponse(error_message=repr(exception), status="ERROR")
        await websocket.send_json(jsonable_encoder(error))


@router.websocket("/lost")
async def lost_websocket(websocket: WebSocket) -> None:
    """Websocket endpoint for generating a message for lost users."""
    model = "gpt-3.5-turbo-1106"
    temperature = 1.0
    prompt = "I'm lost. Can you help me?"
    system = str(
        "You are extremely grumpy yet witty. "
        + "A stranger has just told you that they are lost. "
        + "Mock them for being lost: {prompt}"
    )
    await websocket.accept()
    stream_handler = WebSocketStreamingCallback(websocket)

    try:
        llm = create_llm(
            callbacks=[stream_handler],
            model=model,
            temperature=temperature,
        )
        template = create_prompt(system=system)
        chain = LLMChain(llm=llm, prompt=template)
        result = await chain.arun(prompt)
        response = DoneResponse(result=result, status="DONE")
        await websocket.send_json(jsonable_encoder(response))
    except Exception as exception:
        error = ErrorResponse(error_message=repr(exception), status="ERROR")
        await websocket.send_json(jsonable_encoder(error))


@router.websocket("/no-user")
async def no_user_websocket(websocket: WebSocket) -> None:
    """Websocket endpoint for generating a message for users who don't exist."""
    model = "gpt-3.5-turbo-1106"
    temperature = 1.0
    prompt = "Do you know who this is?"
    system = str(
        "You are part of the Korean mafia. "
        + "A stranger has just asked you about a missing person. "
        + "Aggressively question how they know: {prompt}"
    )
    await websocket.accept()
    stream_handler = WebSocketStreamingCallback(websocket)

    try:
        llm = create_llm(
            callbacks=[stream_handler],
            model=model,
            temperature=temperature,
        )
        template = create_prompt(system=system)
        chain = LLMChain(llm=llm, prompt=template)
        result = await chain.arun(prompt)
        response = DoneResponse(result=result, status="DONE")
        await websocket.send_json(jsonable_encoder(response))
    except Exception as exception:
        error = ErrorResponse(error_message=repr(exception), status="ERROR")
        await websocket.send_json(jsonable_encoder(error))
