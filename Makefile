all: lint test bld

lint:
	npm run lint

test:
	PONOMAR_DB=ponomar/Ponomar/languages npm run test

strss:
	npm run stress

bld:
	npm run build
