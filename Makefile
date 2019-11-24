all: lint test bld

lint:
	npm run lint

test:
	npm run test

stress2019:
	npm run stress201901
	npm run stress201904
	npm run stress201907
	npm run stress201910

stress2020:
	npm run stress202001
	npm run stress202004
	npm run stress202007
	npm run stress202010

stress2021:
	npm run stress202101
	npm run stress202104
	npm run stress202107
	npm run stress202110

stress: stress2019 stress2020 stress2021

bld:
	npm run build
