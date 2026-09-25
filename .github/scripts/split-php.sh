#!/usr/bin/env bash
# Mirror packages/php to b4moss/shardian-php via git subtree split.
set -euo pipefail

MIRROR_REPO="${MIRROR_REPO:-git@github.com:b4moss/shardian-php.git}"
SPLIT_BRANCH="php-split-$$"
GITHUB_SHA="${GITHUB_SHA:-$(git rev-parse HEAD)}"
GITHUB_EVENT_BEFORE="${GITHUB_EVENT_BEFORE:-}"
GITHUB_REF_NAME="${GITHUB_REF_NAME:-}"
GITHUB_REF_TYPE="${GITHUB_REF_TYPE:-}"

cleanup() {
  git branch -D "${SPLIT_BRANCH}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# On main/release branch pushes, skip when packages/php (and split tooling) did not change.
if [[ "${GITHUB_REF_TYPE}" == "branch" && ( "${GITHUB_REF_NAME}" == "main" || "${GITHUB_REF_NAME}" == "release" ) ]]; then
  if [[ -n "${GITHUB_EVENT_BEFORE}" && "${GITHUB_EVENT_BEFORE}" =~ ^0+$ ]]; then
    : # first push / empty before — always split
  elif [[ -n "${GITHUB_EVENT_BEFORE}" ]]; then
    if ! git diff --name-only "${GITHUB_EVENT_BEFORE}" "${GITHUB_SHA}" \
      | grep -qE '^packages/php/|^\.github/workflows/split-php\.yml$|^\.github/scripts/split-php\.sh$'; then
      echo "No packages/php changes on ${GITHUB_REF_NAME}; skipping split."
      exit 0
    fi
  fi
fi

echo "Splitting packages/php ..."
git subtree split --prefix=packages/php -b "${SPLIT_BRANCH}"

mkdir -p "${HOME}/.ssh"
ssh-keyscan -t ed25519,rsa github.com >> "${HOME}/.ssh/known_hosts" 2>/dev/null

echo "Pushing ${SPLIT_BRANCH} → ${MIRROR_REPO} (main) ..."
git push "${MIRROR_REPO}" "${SPLIT_BRANCH}:main" --force

if [[ "${GITHUB_REF_TYPE}" == "tag" && "${GITHUB_REF_NAME}" == packages/php/v* ]]; then
  MIRROR_TAG="${GITHUB_REF_NAME#packages/php/}"
  echo "Pushing mirror tag ${MIRROR_TAG} ..."
  git push "${MIRROR_REPO}" "${SPLIT_BRANCH}:refs/tags/${MIRROR_TAG}" --force
fi

echo "Done."
