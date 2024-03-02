"""Dependencies for items endpoints."""

import logging
import signal
import traceback
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
from olclient import OpenLibrary, config
from pyudemy import Udemy
from pyyoutube import Client

from app.config import get_settings
from app.models.items import (
    ArXivResponse,
    GitHubResponse,
    OpenLibraryAuthor,
    OpenLibraryResponse,
    UdemyInstructor,
    UdemyResponse,
    WikipediaResponse,
    YouTubeResponse,
)

logger = logging.getLogger(__name__)

SETTINGS = get_settings()
GITHUB_USERNAME = SETTINGS.github_username
GITHUB_PASSWORD = SETTINGS.github_password
YOUTUBE_API_KEY = SETTINGS.youtube_api_key
OPEN_LIBRARY_ACCESS_KEY = SETTINGS.open_library_access_key
OPEN_LIBRARY_SECRET_KEY = SETTINGS.open_library_secret_key
UDEMY_CLIENT_ID = SETTINGS.udemy_client_id
UDEMY_CLIENT_SECRET = SETTINGS.udemy_client_secret

ARXIV_CLIENT = arxiv.Client()
GITHUB_CLIENT = Github(auth=Login(GITHUB_USERNAME, GITHUB_PASSWORD))
YOUTUBE_CLIENT = Client(api_key=YOUTUBE_API_KEY)
OL_CLIENT = OpenLibrary(credentials=config.Credentials(access=OPEN_LIBRARY_ACCESS_KEY, secret=OPEN_LIBRARY_SECRET_KEY))
UDEMY_CLIENT = Udemy(UDEMY_CLIENT_ID, UDEMY_CLIENT_SECRET)


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
def search_arxiv(query: str, max_results: int = 10) -> list[ArXivResponse]:
    """Search arXiv for articles."""
    with time_limit(API_TIMEOUT):
        results = ARXIV_CLIENT.results(
            arxiv.Search(
                query=query,
                max_results=max_results,
            )
        )
        if not results:
            return []
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


def search_wikipedia(title: str) -> WikipediaResponse:
    """Search Wikipedia for an article."""
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


def search_github(query: str, max_results: int = 10, sort: str = "stars", order: str = "desc") -> list[GitHubResponse]:
    """Search GitHub for a repository."""
    repos = GITHUB_CLIENT.search_repositories(query, sort, order)
    if not repos:
        return []

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


def search_youtube(query: str, max_results: int = 10, types="channel,playlist,video") -> list[YouTubeResponse]:
    """Search YouTube for videos."""
    results = []
    response = YOUTUBE_CLIENT.search.list(
        parts="snippet",
        max_results=max_results,
        q=query,
        type=types,
    ).items
    if not response:
        return results

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


def search_open_library(title: str, author: str = None) -> OpenLibraryResponse:
    """Search Open Library for works."""
    result = OL_CLIENT.Work.search(title, author)
    if not result:
        return None
    olid = result.identifiers["olid"][0]

    authors = [
        OpenLibraryAuthor(
            name=author["name"],
            olid=author["olid"],
        )
        for author in result.authors
    ]

    return OpenLibraryResponse(
        authors=authors,
        olid=olid,
        publish_year=result.publish_date if result.publish_date else None,
        publisher=result.publisher if result.publisher else None,
        subtitle=result.subtitle if result.subtitle else None,
        title=result.title,
        url=f"https://openlibrary.org/works/{olid}",
    )


def search_udemy(
    query: str, category: str = None, subcategory: str = None, max_results: int = 10
) -> list[UdemyResponse]:
    """Search Udemy for courses."""
    results = []
    response = UDEMY_CLIENT.courses(
        page=1, page_size=max_results, search=query, category=category, subcategory=subcategory
    )

    if not response["results"]:
        return results

    url = "https://www.udemy.com"
    for item in response["results"]:
        temp = item["visible_instructors"]
        instructors = [
            UdemyInstructor(
                display_name=inst["display_name"],
                job_title=inst["job_title"],
                url=url + inst["url"],
            )
            for inst in temp
        ]
        results.append(
            UdemyResponse(
                title=item["title"],
                url=url + item["url"],
                is_paid=item["is_paid"],
                price=item["price"],
                visible_instructors=instructors,
                headline=item["headline"],
            )
        )
    return results


# Search functions with LLM
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
            results = []
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        query = self.generate_query[hop](context=context, topic=topic).query
                except TimeoutException:
                    logger.error("arXiv %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    query = topic
                except Exception:
                    logger.error("arXiv %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    query = topic

                try:
                    with time_limit(API_TIMEOUT):
                        results = self.retrieve(query)
                        if len(results) > 0:
                            passages = [
                                f"{result.entry_id} {str(result.updated)} {str(result.published)} {result.title} {', '.join(result.authors)} {result.summary} {result.comment} {result.journal_ref} {result.primary_category} {', '.join(result.categories)}"
                                for result in results
                            ]
                            context = deduplicate(context + passages)
                        else:
                            message = "No results found."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateSearchQuery,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("arXiv %s retrieve timed out", query)
                except Exception as e:
                    logger.error("arXiv %s %s", query, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateSearchQuery,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_wikipedia_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1) -> WikipediaResponse:
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
            result = None
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        title = self.generate_title[hop](context=context, topic=topic).title
                except TimeoutException:
                    logger.error("Wikipedia %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    title = topic
                except Exception:
                    logger.error("Wikipedia %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    title = topic

                try:
                    with time_limit(API_TIMEOUT):
                        result = self.retrieve(title)
                        if isinstance(result, WikipediaResponse):
                            passages = [
                                f"{', '.join(result.categories)} {', '.join(result.images)} {', '.join(result.links)} {', '.join(result.references)} {result.summary} {result.title} {result.url}"
                            ]
                            context = deduplicate(context + passages)
                        else:
                            message = "Please generate a valid title."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateTitle,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("Wikipedia %s retrieve timed out", title)
                except wikipedia.exceptions.DisambiguationError as e:
                    message = f"Disambiguation: {', '.join(e.options)}"
                    logger.error("Wikipedia %s %s", title, message)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateTitle,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
                except Exception as e:
                    logger.error("Wikipedia %s %s", title, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateTitle,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
            return result

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_github_with_llm(
    topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1, **kwargs
) -> list[GitHubResponse]:
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
            results = []
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        query = self.generate_query[hop](context=context, topic=topic).query
                except TimeoutException:
                    logger.error("GitHub %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    query = topic
                except Exception:
                    logger.error("GitHub %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    query = topic

                try:
                    with time_limit(API_TIMEOUT):
                        results = self.retrieve(query)
                        if len(results) > 0:
                            topic_sets = [", ".join(result.topics) if result.topics else None for result in results]
                            passages = [
                                f"{str(result.created_at)} {result.description} {result.forks_count} {result.full_name} {result.language} {result.open_issues_count} {str(result.pushed_at)} {result.stargazers_count} {result.subscribers_count} {topics} {str(result.updated_at)}"
                                for topics, result in zip(topic_sets, results, strict=False)
                            ]
                            context = deduplicate(context + passages)

                        else:
                            message = "No results found."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateSearchQuery,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("GitHub %s retrieve timed out", query)
                except Exception as e:
                    logger.error("GitHub %s %s", query, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateSearchQuery,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_youtube_with_llm(
    topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1, **kwargs
) -> list[YouTubeResponse]:
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
            results = []
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        query = self.generate_query[hop](context=context, topic=topic).query
                except TimeoutException:
                    logger.error("YouTube %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    query = topic
                except Exception:
                    logger.error("YouTube %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    query = topic

                try:
                    with time_limit(API_TIMEOUT):
                        results = self.retrieve(query)
                        if len(results) > 0:
                            passages = [
                                f"{result.kind} {result.title} {result.description} {result.publishedAt} {result.url}"
                                for result in results
                            ]
                            context = deduplicate(context + passages)

                        else:
                            message = "No results found."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateSearchQuery,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("YouTube %s retrieve timed out", query)
                except Exception as e:
                    logger.error("YouTube %s %s", query, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateSearchQuery,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_open_library_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1) -> OpenLibraryResponse:
    """Search Open Library for works using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateTitleAndAuthor(dspy.Signature):
        """
        Given a topic, generate a title and author for a work in Open Library.
        """

        context = dspy.InputField(desc="may contain relevant articles")
        topic = dspy.InputField()
        title = dspy.OutputField()
        author = dspy.OutputField()

    # Define program
    class SimplifiedBaleen(dspy.Module):
        def __init__(
            self,
        ):
            super().__init__()

            self.generate_search = [dspy.ChainOfThought(GenerateTitleAndAuthor) for _ in range(max_hops)]
            self.retrieve = search_open_library

        def forward(self, topic):
            result = None
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        pred = self.generate_search[hop](context=context, topic=topic)
                        title, author = pred.title, pred.author
                except TimeoutException:
                    logger.error("Open Library %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    title = topic
                    author = None
                except Exception:
                    logger.error("Open Library %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    title = topic
                    author = None

                try:
                    with time_limit(API_TIMEOUT):
                        result = self.retrieve(title, author)
                        if isinstance(result, OpenLibraryResponse):
                            passages = [
                                f"{', '.join([author.name for author in result.authors])} {', '.join([author.olid for author in result.authors])} {result.olid} {result.publish_year} {result.publisher} {result.subtitle} {result.title} {result.url}"
                            ]
                            context = deduplicate(context + passages)

                        else:
                            message = "Please generate a valid title and author."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateTitleAndAuthor,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("Open Library %s %s retrieve timed out", title, author)
                except Exception as e:
                    logger.error("Open Library %s %s %s", title, author, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateTitleAndAuthor,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)
            return result

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)


def search_udemy_with_llm(topic: str, model: str = "gpt-3.5-turbo", max_hops: int = 1, **kwargs) -> list[UdemyResponse]:
    """Search Udemy for courses using model."""
    # Initialize the model
    lm = dspy.OpenAI(model=model, api_key=SETTINGS.openai_api_key, model_type="chat")
    dspy.settings.configure(lm=lm, trace=[])

    # Define problem signature
    class GenerateSearchKeys(dspy.Signature):
        """
        Given a topic, generate a search query, category, and subcategory for Udemy.

        These are the following valid categories:
        Business, Design, Development, Finance & Accounting, Health & Fitness, IT & Software, Lifestyle, Marketing, Music, Office Productivity, Personal Development, Photography & Video, Teaching & Academics, Udemy Free Resource Center, Vodafone

        These are the following valid subcategories:
        3D & Animation, Accounting & Bookkeeping, Affiliate Marketing, Apple, Architectural Design, Arts & Crafts, Beauty & Makeup, Branding, Business Analytics & Intelligence, Business Law, Business Strategy, Career Development, Commercial Photography, Communication, Compliance, Content Marketing, Creativity, Cryptocurrency & Blockchain, Dance, Data Science, Database Design & Development, Design Tools, Digital Marketing, Digital Photography, E-Commerce, Economics, Engineering, Entrepreneurship, Esoteric Practices, Essential Tech Skills, Fashion Design, Finance, Finance Cert & Exam Prep, Financial Modeling & Analysis, Fitness, Food & Beverage, Game Design, Game Development, Gaming, General Health, Google, Graphic Design & Illustration, Growth Hacking, Happiness, Hardware, Home Improvement & Gardening, Human Resources, Humanities, Industry, Influence, Instruments, Interior Design, Investing & Trading, IT Certifications, Language Learning, Leadership, Management, Marketing Analytics & Automation, Marketing Fundamentals, Martial Arts & Self Defense, Math, Media, Meditation, Memory & Study Skills, Mental Health, Microsoft, Mobile Development, Money Management Tools, Motivation, Music Fundamentals, Music Production, Music Software, Music Techniques, Network & Security, No-Code Development, Nutrition & Diet, Online Education, Operating Systems & Servers, Operations, Oracle, Other Business, Other Design, Other Finance & Accounting, Other Health & Fitness, Other IT & Software, Other Lifestyle, Other Marketing, Other Music, Other Office Productivity, Other Personal Development, Other Photography & Video, Other Teaching & Academics, Paid Advertising, Parenting & Relationships, Personal Brand Building, Personal Growth & Wellness, Personal Productivity, Personal Transformation, Pet Care & Training, Photography, Photography Tools, Portrait Photography, Product Marketing, Productivity & Professional Skills, Programming Languages, Project Management, Public Relations, Real Estate, Religion & Spirituality, Safety & First Aid, Sales, SAP, Science, Search Engine Optimization, Self Esteem & Confidence, Social Media Marketing, Social Science, Software Development Tools, Software Engineering, Software Testing, Sports, Stress Management, Taxes, Teacher Training, Test Prep, Travel, User Experience Design, Video & Mobile Marketing, Video Design, Vocal, Vodafone, Web Design, Web Development, Yoga
        """

        context = dspy.InputField(desc="may contain relevant articles")
        topic = dspy.InputField()
        query = dspy.OutputField()
        category = dspy.OutputField()
        subcategory = dspy.OutputField()

    # Define program
    class SimplifiedBaleen(dspy.Module):
        def __init__(
            self,
        ):
            super().__init__()

            self.generate_search = [dspy.ChainOfThought(GenerateSearchKeys) for _ in range(max_hops)]
            self.retrieve = (
                search_udemy
                if not kwargs.get("max_results")
                else partial(search_udemy, max_results=kwargs.get("max_results"))
            )

        def forward(self, topic):
            results = []
            context = []
            for hop in range(max_hops):
                try:
                    with time_limit(API_TIMEOUT):
                        pred = self.generate_search[hop](context=context, topic=topic)
                        query, category, subcategory = pred.query, pred.category, pred.subcategory
                except TimeoutException:
                    logger.error("Udemy %s generate timed out", topic)
                    logger.error("Falling back to default search.")
                    query = topic
                    category = None
                    subcategory = None
                except Exception:
                    logger.error("Udemy %s %s", topic, traceback.format_exc())
                    logger.error("Falling back to default search.")
                    query = topic
                    category = None
                    subcategory = None

                try:
                    with time_limit(API_TIMEOUT):
                        results = self.retrieve(query, category, subcategory)
                        if len(results) > 0:
                            passages = [
                                f"{result.title} {result.url} {result.is_paid} {result.price} {', '.join([inst.display_name for inst in result.visible_instructors])} {', '.join([inst.job_title for inst in result.visible_instructors])} {', '.join([inst.url for inst in result.visible_instructors])} {result.headline}"
                                for result in results
                            ]
                            context = deduplicate(context + passages)

                        else:
                            message = "No results found."
                            dspy.Suggest(
                                False,
                                message,
                                target_module=GenerateSearchKeys,
                            )
                            passages = [message]
                            context = deduplicate(context + passages)
                except TimeoutException:
                    logger.error("Udemy %s retrieve timed out", query)
                except Exception as e:
                    logger.error("Udemy %s %s", query, traceback.format_exc())
                    message = str(e)
                    dspy.Suggest(
                        False,
                        message,
                        target_module=GenerateSearchKeys,
                    )
                    passages = [message]
                    context = deduplicate(context + passages)

            return results

    # Run the program
    return assert_transform_module(SimplifiedBaleen().map_named_predictors(Retry), backtrack_handler)(topic=topic)
