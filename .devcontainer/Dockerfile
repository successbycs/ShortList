ARG PYTHON_IMAGE=python:3.12.11-slim-bookworm
FROM ${PYTHON_IMAGE}

COPY --from=ghcr.io/astral-sh/uv:0.9.21 /uv /uvx /usr/local/bin/

RUN apt-get update \
    && apt-get install --yes --no-install-recommends bash git \
    && rm --recursive --force /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

RUN groupadd --gid 10001 app \
    # VS Code launches its integrated terminal using the remote user's login
    # shell.  Keep the runtime non-root while providing a usable shell for
    # interactive development inside the Dev Container.
    && useradd --uid 10001 --gid app --create-home --shell /bin/bash app \
    && mkdir --parents /workspace /opt/venv /var/lib/app-template \
    && chown --recursive app:app /workspace /opt/venv /var/lib/app-template

WORKDIR /workspace
USER app

CMD ["sleep", "infinity"]
