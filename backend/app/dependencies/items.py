"""Dependencies for items endpoints."""
# import dspy
# from dspy.datasets import HotPotQA
# from dspy.teleprompt import BootstrapFewShotWithRandomSearch
# from dsp.utils import deduplicate
from langchain.callbacks.base import Callbacks
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

from app.config import get_settings

SETTINGS = get_settings()
DSPY_CONFIG = {
    "lm": "gpt-4-1106-preview",
    "rm": "https://ec2-35-87-71-196.us-west-2.compute.amazonaws.com:8893/api/search",
    "train_size": 100,
    "dev_size": 0,
    "test_size": 0,
    "passages_per_hop": 5,
    "max_hops": 3,
    "max_length": 1000,
    "frac_same": 0.8,
}


# def create_dspy():
#     """Create a DSPy-based model."""

#     # Configure DSPy.
#     turbo = dspy.OpenAI(model=DSPY_CONFIG["lm"], api_key=SETTINGS.openai_api_key, model_type="chat")
#     colbertv2_wiki18_abstracts = dspy.ColBERTv2(url=DSPY_CONFIG["rm"])
#     dspy.settings.configure(lm=turbo, rm=colbertv2_wiki18_abstracts)

#     # Load the dataset.
#     dataset = HotPotQA(
#         train_size=DSPY_CONFIG["train_size"], dev_size=DSPY_CONFIG["dev_size"], test_size=DSPY_CONFIG["test_size"]
#     )

#     # Tell DSPy that the 'question' field is the input. Any other fields are labels and/or metadata.
#     trainset = [x.with_inputs("question") for x in dataset.train]

#     # Create signatures for a multi-hop question answering program.
#     class GenerateAnswer(dspy.Signature):
#         """Answer questions with short factoid answers."""

#         context = dspy.InputField(desc="may contain relevant facts")
#         question = dspy.InputField()
#         answer = dspy.OutputField(desc="often between 1 and 5 words")

#     class GenerateSearchQuery(dspy.Signature):
#         """Write a simple search query that will help answer a complex question."""

#         context = GenerateAnswer.signature.context
#         question = dspy.InputField()
#         query = dspy.OutputField()

#     # Define a multi-hop question answering program.
#     class SimplifiedBaleen(dspy.Module):
#         def __init__(self, passages_per_hop=DSPY_CONFIG["passages_per_hop"], max_hops=DSPY_CONFIG["max_hops"]):
#             super().__init__()

#             self.generate_query = [dspy.ChainOfThought(GenerateSearchQuery) for _ in range(max_hops)]
#             self.retrieve = dspy.Retrieve(k=passages_per_hop)
#             self.generate_answer = dspy.ChainOfThought(GenerateAnswer)
#             self.max_hops = max_hops

#         def forward(self, question):
#             context = []

#             for hop in range(self.max_hops):
#                 query = self.generate_query[hop](context=context, question=question).query
#                 passages = self.retrieve(query).passages
#                 context = deduplicate(context + passages)

#             pred = self.generate_answer(context=context, question=question)
#             return dspy.Prediction(context=context, answer=pred.answer)

#     # Define a validation metric.
#     def validate_context_and_answer_and_hops(example, pred, trace=None):
#         if not dspy.evaluate.answer_exact_match(example, pred):
#             return False
#         if not dspy.evaluate.answer_passage_match(example, pred):
#             return False

#         hops = [example.question] + [outputs.query for *_, outputs in trace if "query" in outputs]

#         if max([len(h) for h in hops]) > DSPY_CONFIG["max_length"]:
#             return False
#         if any(
#             dspy.evaluate.answer_exact_match_str(hops[idx], hops[:idx], frac=DSPY_CONFIG["frac_same"])
#             for idx in range(2, len(hops))
#         ):
#             return False

#         return True

#     # Set up a basic teleprompter, which will compile our RAG program.
#     teleprompter = BootstrapFewShotWithRandomSearch(metric=validate_context_and_answer_and_hops)

#     # Compile!
#     compiled_baleen = teleprompter.compile(SimplifiedBaleen(), teacher=SimplifiedBaleen(), trainset=trainset)
#     return compiled_baleen


def create_llm(callbacks: Callbacks, model: str, temperature: float) -> ChatOpenAI:
    """Create an LLM instance."""
    return ChatOpenAI(
        openai_api_key=SETTINGS.openai_api_key,
        streaming=bool(callbacks),
        callbacks=callbacks,
        model=model,
        temperature=temperature,
    )


def create_prompt(system: str) -> PromptTemplate:
    """Create a prompt template."""
    return PromptTemplate.from_template(template=system)
