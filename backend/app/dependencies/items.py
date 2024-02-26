"""Dependencies for items endpoints."""

from functools import partial

import arxiv
import dspy
import wikipedia
from dsp.utils import deduplicate
from dspy.predict import Retry
from dspy.primitives.assertions import assert_transform_module, backtrack_handler

from app.config import get_settings
from app.models.items import ArXivResponse, WikipediaResponse

SETTINGS = get_settings()

ARXIV_CLIENT = arxiv.Client()


def search_arxiv(topic: str, max_results: int = 10) -> list[ArXivResponse]:
    """Search arXiv for articles."""
    return [
        ArXivResponse(
            entry_id=result.entry_id,
            updated=result.updated,
            published=result.published,
            title=result.title,
            authors=[author.name for author in result.authors],
            summary=result.summary,
            comment=result.comment,
            journal_ref=result.journal_ref,
            primary_category=result.primary_category,
            categories=result.categories,
        )
        for result in ARXIV_CLIENT.results(
            arxiv.Search(
                query=topic,
                max_results=max_results,
                sort_by=arxiv.SortCriterion.SubmittedDate,
            )
        )
    ]


def search_wikipedia(topic: str) -> WikipediaResponse:
    """Search Wikipedia for an article."""
    try:
        response = wikipedia.page(topic)
        return WikipediaResponse(
            categories=response.categories,
            images=response.images,
            links=response.links,
            references=response.references,
            summary=response.summary,
            title=response.title,
            url=response.url,
        )
    except wikipedia.exceptions.DisambiguationError as e:
        raise e.options from e


def search_arxiv_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1, **kwargs) -> list[ArXivResponse]:
    """Search arXiv for articles using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateSearchQuery(dspy.Signature):
        """
        Given a topic, generate a search query for arXiv.

        The following table lists the field prefixes for all the fields that can be searched:
            prefix	explanation
            ti	    Title
            au	    Author
            abs	    Abstract
            co	    Comment
            jr	    Journal Reference
            cat	    Subject Category
            rn	    Report Number
            id_list	Id
            all	    All of the above

        The following table lists the three possible Boolean operators.
            AND
            OR
            ANDNOT

        The table below lists the two grouping operators used in the API.
            symbol	      encoding explanation
            ( )	          %28 %29  Used to group Boolean expressions for Boolean operator precedence.
            double quotes %22 %22  Used to group multiple words into phrases to search a particular field.
            space	      +	       Used to extend a search_query to include multiple fields.

        e.g.: To search for articles with "checkerboard" in the title and "del_maestro" as an author, the query would be:
            au:del_maestro AND ti:checkerboard
        """

        context = dspy.InputField(desc="may contain relevant articles")
        topic = dspy.InputField()
        query = dspy.OutputField()

    # Define program
    class SimplifiedBaleen(dspy.Module):
        def __init__(
            self,
        ):
            super().__init__()

            self.generate_query = [dspy.ChainOfThought(GenerateSearchQuery) for _ in range(max_hops)]
            self.retrieve = (
                search_arxiv
                if not kwargs.get("max_results")
                else partial(search_arxiv, max_results=kwargs.get("max_results"))
            )

        def forward(self, topic):
            if max_hops == 1:
                query = self.generate_query[0](context=[], topic=topic).query
                results = self.retrieve(query)
                return results
            else:
                context = []
                for hop in range(max_hops):
                    query = self.generate_query[hop](context=context, topic=topic).query
                    results = self.retrieve(query)

                    (
                        entry_ids,
                        updated_dates,
                        published_dates,
                        titles,
                        author_groups,
                        summaries,
                        comments,
                        journal_refs,
                        primary_categories,
                        category_groups,
                    ) = zip(
                        *[
                            (
                                result.entry_id,
                                result.updated,
                                result.published,
                                result.title,
                                result.authors,
                                result.summary,
                                result.comment,
                                result.journal_ref,
                                result.primary_category,
                                result.categories,
                            )
                            for result in results
                        ],
                        strict=False,
                    )
                    passages = [
                        f"{entry_id} {str(updated_date)} {str(published_date)} {title} {', '.join(authors)} {summary} {comment} {journal_ref} {primary_category} {', '.join(categories)}"
                        for (
                            entry_id,
                            updated_date,
                            published_date,
                            title,
                            authors,
                            summary,
                            comment,
                            journal_ref,
                            primary_category,
                            categories,
                        ) in zip(
                            entry_ids,
                            updated_dates,
                            published_dates,
                            titles,
                            author_groups,
                            summaries,
                            comments,
                            journal_refs,
                            primary_categories,
                            category_groups,
                            strict=False,
                        )
                    ]
                    context = deduplicate(context + passages)
                return results

    # Run the program
    return SimplifiedBaleen()(topic=topic)


def search_wikipedia_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1) -> WikipediaResponse:
    """Search Wikipedia for an article using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateSearchQuery(dspy.Signature):
        """
        Given a topic, generate a search query for wikipedia.

        Be wary of generating vague titles that lead to a disambiguation page:
        e.g. "Mercury" could refer to the planet, the element, the Roman god, the automobile brand, etc.
             To search for the planet, the query would be "Mercury (planet)".
        """

        context = dspy.InputField(desc="may contain relevant articles")
        topic = dspy.InputField()
        query = dspy.OutputField()

    # Define program
    class SimplifiedBaleen(dspy.Module):
        def __init__(
            self,
        ):
            super().__init__()

            self.generate_query = [dspy.ChainOfThought(GenerateSearchQuery) for _ in range(max_hops)]
            self.retrieve = search_wikipedia

        def forward(self, topic):
            if max_hops == 1:
                query = self.generate_query[0](context=[], topic=topic).query
                try:
                    return self.retrieve(query)
                except wikipedia.exceptions.DisambiguationError as e:
                    dspy.Assert(
                        True,
                        f"Please make the title more specific: {e.options}",
                        target_module=GenerateSearchQuery,
                    )
            else:
                context = []
                for hop in range(max_hops):
                    query = self.generate_query[hop](context=context, topic=topic).query
                    result = self.retrieve(query)
                    passages = [
                        f"{', '.join(result.categories)} {', '.join(result.images)} {', '.join(result.links)} {', '.join(result.references)} {result.summary} {result.title} {result.url}"
                    ]
                    context = deduplicate(context + passages)
                return result

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)
