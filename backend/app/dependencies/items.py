"""Dependencies for items endpoints."""

import signal
from contextlib import contextmanager
from datetime import datetime
from functools import partial

import arxiv
import dspy
import wikipedia
from dsp.utils import deduplicate
from dspy.predict import Retry
from dspy.primitives.assertions import assert_transform_module, backtrack_handler
from github import Github
from github.Auth import Login
from pyyoutube import Client

from app.config import get_settings
from app.models.items import (
    ArXivResponse,
    GitHubResponse,
    WikipediaResponse,
    YouTubeResponse,
)

SETTINGS = get_settings()
GITHUB_USERNAME = SETTINGS.github_username
GITHUB_PASSWORD = SETTINGS.github_password
YOUTUBE_API_KEY = SETTINGS.youtube_api_key

ARXIV_CLIENT = arxiv.Client()
GITHUB_CLIENT = Github(auth=Login(GITHUB_USERNAME, GITHUB_PASSWORD))
YOUTUBE_CLIENT = Client(api_key=YOUTUBE_API_KEY)


# Timeout handling
API_TIMEOUT = 10  # seconds


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


# Basic search functions
def search_arxiv(query: str, max_results: int = 10) -> list[ArXivResponse | None]:
    """Search arXiv for articles."""
    try:
        with time_limit(API_TIMEOUT):
            results = ARXIV_CLIENT.results(
                arxiv.Search(
                    query=query,
                    max_results=max_results,
                    sort_by=arxiv.SortCriterion.SubmittedDate,
                )
            )
            if not results:
                raise Exception("No results found")
            return [
                ArXivResponse(
                    entry_id=result.entry_id,
                    updated=result.updated,
                    published=result.published,
                    title=result.title,
                    authors=[author.name for author in result.authors],
                    summary=result.summary,
                    comment=result.comment if result.comment else None,
                    journal_ref=result.journal_ref if result.journal_ref else None,
                    primary_category=result.primary_category,
                    categories=result.categories,
                )
                for result in results
            ]
    except TimeoutException:
        print("arXiv", query, "timed out")
        return []
    except Exception as e:
        print("arXiv", query, e)
        return []


def search_wikipedia(title: str) -> WikipediaResponse | list[str | None]:
    """Search Wikipedia for an article."""
    try:
        with time_limit(API_TIMEOUT):
            response = wikipedia.page(title)
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
        print("Wikipedia", title, e)
        return e.options
    except TimeoutException:
        print("Wikipedia", title, "timed out")
        return []
    except Exception as e:
        print("Wikipedia", title, e)
        return []


def search_github(
    query: str, max_results: int = 10, sort: str = "stars", order: str = "desc"
) -> list[GitHubResponse | None]:
    """Search GitHub for a repository."""
    try:
        with time_limit(API_TIMEOUT):
            repos = GITHUB_CLIENT.search_repositories(query, sort, order)
            if not repos:
                raise Exception("No results found")

            return [
                GitHubResponse(
                    created_at=repo.created_at,
                    description=repo.description if repo.description else None,
                    forks_count=repo.forks_count,
                    full_name=repo.full_name,
                    language=repo.language if repo.language else None,
                    open_issues_count=repo.open_issues_count,
                    pushed_at=repo.pushed_at,
                    stargazers_count=repo.stargazers_count,
                    subscribers_count=repo.subscribers_count,
                    topics=repo.topics if repo.topics else None,
                    updated_at=repo.updated_at,
                    url=repo.url,
                )
                for repo in repos[:max_results]
            ]
    except TimeoutException:
        print("GitHub", query, "timed out")
        return []
    except Exception as e:
        print("GitHub", query, e)
        return []


def search_youtube(query: str, max_results: int = 10) -> list[str | None]:
    """Search YouTube for videos."""
    try:
        with time_limit(API_TIMEOUT):
            results = []
            response = YOUTUBE_CLIENT.search.list(
                parts="snippet",
                max_results=max_results,
                q=query,
                type="channel,playlist,video",
            ).items
            if not response:
                raise Exception("No results found")

            for item in response:
                kind = item.id.kind.split("#")[-1]
                url = "https://www.youtube.com/"
                if kind == "channel":
                    url = f"{url}channel/{item.id.channelId}"
                elif kind == "playlist":
                    url = f"{url}playlist?list={item.id.playlistId}"
                elif kind == "video":
                    url = f"{url}watch?v={item.id.videoId}"
                results.append(
                    YouTubeResponse(
                        kind=kind,
                        title=item.snippet.title,
                        description=item.snippet.description,
                        publishedAt=datetime.strptime(item.snippet.publishedAt, "%Y-%m-%dT%H:%M:%SZ"),
                        url=url,
                    )
                )
            return results
    except TimeoutException:
        print("YouTube", query, "timed out")
        return []
    except Exception as e:
        print("YouTube", query, e)
        return []


# Search functions with LLM
def search_arxiv_with_llm(
    topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 3, **kwargs
) -> list[ArXivResponse | None]:
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
            context = []
            for hop in range(max_hops):
                query = self.generate_query[hop](context=context, topic=topic).query
                results = self.retrieve(query)
                dspy.Suggest(
                    len(results) > 0,
                    "Please generate a valid search query.",
                    target_module=GenerateSearchQuery,
                )

                passages = [
                    f"{result.entry_id} {str(result.updated)} {str(result.published)} {result.title} {', '.join(result.authors)} {result.summary} {result.comment} {result.journal_ref} {result.primary_category} {', '.join(result.categories)}"
                    for result in results
                ]
                context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_wikipedia_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 3) -> WikipediaResponse | None:
    """Search Wikipedia for an article using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateTitle(dspy.Signature):
        """
        Given a topic, generate a relevant wikipedia page title.

        Be wary of generating vague titles that lead to a disambiguation page:
        e.g. "Mercury" could refer to the planet, the element, the Roman god, the automobile brand, etc.
             To search for the planet, the query would be "Mercury (planet)".
        """

        context = dspy.InputField(desc="may contain relevant articles")
        topic = dspy.InputField()
        title = dspy.OutputField()

    # Define program
    class SimplifiedBaleen(dspy.Module):
        def __init__(
            self,
        ):
            super().__init__()

            self.generate_title = [dspy.ChainOfThought(GenerateTitle) for _ in range(max_hops)]
            self.retrieve = search_wikipedia

        def forward(self, topic):
            context = []
            for hop in range(max_hops):
                title = self.generate_title[hop](context=context, topic=topic).query
                result = self.retrieve(title)
                dspy.Suggest(
                    isinstance(result, WikipediaResponse),
                    "Please generate a valid title.",
                    target_module=GenerateTitle,
                )
                passages = [
                    f"{', '.join(result.categories)} {', '.join(result.images)} {', '.join(result.links)} {', '.join(result.references)} {result.summary} {result.title} {result.url}"
                ]
                context = deduplicate(context + passages)
            return result

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_github_with_llm(
    topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 3, **kwargs
) -> GitHubResponse | None:
    """Search GitHub for a repository using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateSearchQuery(dspy.Signature):
        """
        Given a topic, generate a search query for GitHub.

        The table below shows options to filter the results:

        This search	            Finds repositories with…
        cat stars:>100	        Find cat repositories with greater than 100 stars.
        user:defunkt	        Get all repositories from the user defunkt.
        pugs pushed:>2013-01-28	Pugs repositories pushed to since Jan 28, 2013.
        node.js forks:<200	    Find all node.js repositories with less than 200 forks.
        jquery size:1024..4089	Find jquery repositories between the sizes 1024 and 4089 kB.
        gitx fork:true	        Repository search includes forks of gitx.
        gitx fork:only	        Repository search returns only forks of gitx.

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
                search_github
                if not kwargs.get("max_results")
                else partial(search_github, max_results=kwargs.get("max_results"))
            )

        def forward(self, topic):
            context = []
            for hop in range(max_hops):
                query = self.generate_query[hop](context=context, topic=topic).query
                results = self.retrieve(query)
                dspy.Suggest(
                    len(results) > 0,
                    "Please generate a valid search query.",
                    target_module=GenerateSearchQuery,
                )

                passages = [
                    f"{str(result.created_at)} {result.description} {result.forks_count} {result.full_name} {result.language} {result.open_issues_count} {str(result.pushed_at)} {result.stargazers_count} {result.subscribers_count} {', '.join(result.topics)} {str(result.updated_at)}"
                    for result in results
                ]
                context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_youtube_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 3, **kwargs) -> list[str | None]:
    """Search YouTube for videos using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateSearchQuery(dspy.Signature):
        """
        Given a topic, generate a search query for YouTube.
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
                search_youtube
                if not kwargs.get("max_results")
                else partial(search_youtube, max_results=kwargs.get("max_results"))
            )

        def forward(self, topic):
            context = []
            for hop in range(max_hops):
                query = self.generate_query[hop](context=context, topic=topic).query
                results = self.retrieve(query)
                dspy.Suggest(
                    len(results) > 0,
                    "Please generate a valid search query.",
                    target_module=GenerateSearchQuery,
                )

                passages = [
                    f"{result.kind} {result.title} {result.description} {result.publishedAt} {result.url}"
                    for result in results
                ]
                context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)
