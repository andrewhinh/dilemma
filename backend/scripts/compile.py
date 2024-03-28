import glob
import json
from datetime import datetime

import dspy
import pandas as pd
from dspy.evaluate import Evaluate
from dspy.teleprompt import MIPRO
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

from app.config import get_settings
from app.dependencies.items import (
    HomesFinder,
)
from app.models.items import Property

SETTINGS = get_settings()
OPENAI_API_KEY = SETTINGS.openai_api_key

# Logging
LOGGING_PATH = "logs/compile.csv"
LOG_DF = pd.read_csv(LOGGING_PATH)

# Optimizer params - https://colab.research.google.com/github/stanfordnlp/dspy/blob/main/examples/qa/hotpot/hotpotqa_with_MIPRO.ipynb
NUM_THREADS = 16
NUM_CANDIDATES = 10
INIT_TEMPERATURE = 1.0
NUM_TRIALS = 20
MAX_BOOTSTRAPPED_DEMOS = 1
MAX_LABELED_DEMOS = 2

PROMPT_MODEL = "gpt-4-turbo-preview"
METRIC_MODEL = "gpt-3.5-turbo"
PROMPT_LM = dspy.OpenAI(model=PROMPT_MODEL, api_key=OPENAI_API_KEY, model_type="chat")
METRIC_LM = dspy.OpenAI(model=METRIC_MODEL, api_key=OPENAI_API_KEY, model_type="chat")

MODEL_PATH = f"models/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"


# Dataset params
EXAMPLES_PATH = max(glob.glob("data/*.csv"))
TRAIN_TEST_SPLIT = 0.9  # Randomly chosen


# Load dataset
df = pd.read_csv(EXAMPLES_PATH)
dataset = []
for query in df["query"]:
    dataset.append(
        dspy.Example(
            query=query,
        ).with_inputs("query")
    )
trainset, devset = dataset[: int(TRAIN_TEST_SPLIT * len(dataset))], dataset[int(TRAIN_TEST_SPLIT * len(dataset)) :]


# Define metric
class Input(BaseModel):
    """Input model."""

    query: str = Field()
    current_date: datetime = Field(default_factory=datetime.utcnow)

    location: str = Field(description="location of the homes")
    listing_type: str = Field(description="type of listing")
    radius: float | None = Field(description="radius in miles")
    mls_only: bool | None = Field(description="whether to include only MLS listings")
    past_days: int | None = Field(description="number of days in the past")
    date_from: str | None = Field(description="start date")
    date_to: str | None = Field(description="end date")
    foreclosure: bool | None = Field(description="whether to include foreclosures")
    homes: list[Property] = Field(description="list of homes")

    assessment_question: str = Field(description="question to assess the relevancy of homes")


class Output(BaseModel):
    """Output model."""

    assessment_answer: str = Field(description="yes or no")


class Assess(dspy.Signature):
    """Assess the relevancy of homes along the specified dimension."""

    input: Input = dspy.InputField()
    output: Output = dspy.OutputField()


def metric(gold, pred, trace=None):
    query, location, listing_type, radius, mls_only, past_days, date_from, date_to, foreclosure, homes = (
        gold.query,
        pred.location,
        pred.listing_type,
        pred.radius,
        pred.mls_only,
        pred.past_days,
        pred.date_from,
        pred.date_to,
        pred.foreclosure,
        pred.homes,
    )

    # Framing the base question for the assessment
    str_homes = "\n\n".join([json.dumps(jsonable_encoder(home)) for home in homes])
    base_question = f"""
    The query is: {query}

    The generated search parameters are:
    Location: {location}
    Listing Type: {listing_type}
    Radius: {radius}
    MLS Only: {mls_only}
    Past Days: {past_days}
    Date From: {date_from}
    Date To: {date_to}
    Foreclosure: {foreclosure}

    Based on the search, the homes found are:
    {str_homes}
    """

    # Defining the assessment questions
    questions = [
        "Is the location relevant to the query?",
        "Is the listing type relevant to the query?",
        "Is the radius relevant to the query, if specified? If not, return yes.",
        "Is the MLS Only relevant to the query, if specified? If not, return yes.",
        "Is the past days relevant to the query, if specified? If not, return yes.",
        "Is the date from relevant to the query, if specified? If not, return yes.",
        "Is the date to relevant to the query, if specified? If not, return yes.",
        "Is the foreclosure relevant to the query, if specified? If not, return yes.",
        "Are the homes relevant to the query?",
    ]
    questions = [base_question + "\n" + question for question in questions]

    # Collect responses to the questions
    responses = []
    with dspy.context(lm=METRIC_LM):
        for question in questions:
            response = dspy.TypedPredictor(Assess)(
                input=Input(
                    query=query,
                    location=location,
                    listing_type=listing_type,
                    radius=radius,
                    mls_only=mls_only,
                    past_days=past_days,
                    date_from=date_from,
                    date_to=date_to,
                    foreclosure=foreclosure,
                    homes=homes,
                    assessment_question=question,
                )
            ).output
            responses.append(response)

    # Convert the responses to boolean values and calculate the score
    results = [response.assessment_answer.lower() == "yes" for response in responses]
    score = sum(results)

    # Final evaluation logic
    if trace is not None:  # Provide detailed feedback if trace is enabled
        return score >= len(questions)  # True if all questions are affirmed
    return score / len(questions)  # Otherwise, return the proportion of positive responses as the score


# Optimization
def main():
    optimizer = MIPRO(
        metric=metric,
        prompt_model=PROMPT_LM,
        task_model=HomesFinder().lm,
        num_candidates=NUM_CANDIDATES,
        init_temperature=INIT_TEMPERATURE,
        verbose=True,
    )
    compiled_program = optimizer.compile(
        student=HomesFinder(),
        trainset=trainset,
        num_trials=NUM_TRIALS,
        max_bootstrapped_demos=MAX_BOOTSTRAPPED_DEMOS,
        max_labeled_demos=MAX_LABELED_DEMOS,
        eval_kwargs={"num_threads": NUM_THREADS, "display_progress": True, "display_table": 0},
    )
    compiled_program.save(MODEL_PATH)

    evaluate = Evaluate(devset=devset, metric=metric, num_threads=NUM_THREADS, display_progress=True)
    LOG_DF.loc[len(LOG_DF)] = [
        EXAMPLES_PATH,
        NUM_THREADS,
        NUM_CANDIDATES,
        INIT_TEMPERATURE,
        NUM_TRIALS,
        MAX_BOOTSTRAPPED_DEMOS,
        MAX_LABELED_DEMOS,
        PROMPT_MODEL,
        METRIC_MODEL,
        MODEL_PATH,
        TRAIN_TEST_SPLIT,
        evaluate(HomesFinder()),
        evaluate(compiled_program),
        datetime.utcnow(),
    ]
    LOG_DF.to_csv(LOGGING_PATH, index=False)


if __name__ == "__main__":
    main()
