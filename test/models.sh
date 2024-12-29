#!/usr/bin/env bash

export OPENAI_API_KEY=1234567890
export OPENAI_BASE_URL=http://0.0.0.0:8000/api/v1
# For older versions
# https://github.com/openai/openai-python/issues/624
export OPENAI_API_BASE=http://0.0.0.0:8000/api/v1

curl $OPENAI_BASE_URL/models \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY"