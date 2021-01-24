all: README.md

README.md: edify.md
	./edify.bin.js --mode text $< > $@
