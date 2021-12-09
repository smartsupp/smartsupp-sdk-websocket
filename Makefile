.PHONY: init

SHELL := /bin/bash
PATH := node_modules/.bin:$(PATH)JEST_ARGS :=

default:
	cat Makefile

init:
	rm -f .npmrc && cp "$(NPMRC_FILE)" .npmrc
