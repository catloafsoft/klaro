build: pnpm-install klaro klaro-no-css

RT=patch
RP=""

release:
	@echo "Making a '${RT}' release (change by setting RT=patch|minor|major)"
	@git  diff --quiet src || (echo "source directory not clean" && exit 1)
	@(pnpm run lint-fix && pnpm run lint-scss-fix) || (echo "fix your errors first" && exit 1)
	python3 .scripts/make_release.py ${RT} ${RP}

pnpm-install:
	pnpm install --frozen-lockfile

klaro:
	pnpm run make

translate:
	python3 .scripts/update_translations.py $(TR)

klaro-no-css:
	SEPARATE_CSS=1 pnpm run make
	SEPARATE_CSS=1 NO_MINIFY_CSS=1 pnpm run make

publish:
	pnpm publish
